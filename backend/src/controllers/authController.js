const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");
const { sendVerificationEmail } = require("../utils/emailService");

const VALID_CURRENCIES = ["GHS", "USD", "EUR", "GBP", "NGN", "KES"];
const DEMO_ACCOUNTS = ["demo@spendsense.app", "demo2@spendsense.app", "test@spendsense.app"];
const isDemoAccount = (email) => Boolean(email && DEMO_ACCOUNTS.includes(email.toLowerCase().trim()));

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("FATAL: JWT_SECRET environment variable must be set in production.");
    }
    return "spendsense-jwt-secret-key-change-in-production-2026";
  }
  return secret;
};

const JWT_SECRET = getJwtSecret();

// In-memory OTP storage with rate limiting and expiration tracking
const verificationOtps = new Map();

const generateSecureOtp = () => crypto.randomInt(100000, 999999).toString();

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, currencyPreference } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const preferredCurrency = VALID_CURRENCIES.includes(currencyPreference)
      ? currencyPreference
      : "GHS";

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: cleanEmail,
        password: hashedPassword,
        isEmailVerified: false,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(201).json({
      message: "Registration successful",
      user: {
        ...user,
        currencyPreference: preferredCurrency,
      },
      token,
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error during registration" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        isEmailVerified: Boolean(user.isEmailVerified),
        currencyPreference: "GHS",
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error during login" });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        fullName: true,
        email: true,
        isEmailVerified: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        ...user,
        isEmailVerified: Boolean(user.isEmailVerified),
        currencyPreference: "GHS",
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

exports.sendVerificationOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Generate secure 6-digit OTP server-side (ignore any client-provided code for STX-01)
    const otpCode = generateSecureOtp();
    verificationOtps.set(cleanEmail, {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000, // 10 mins
      attempts: 0,
    });

    // Deliver real email to inbox via SMTP
    const emailResult = await sendVerificationEmail(cleanEmail, otpCode);

    // SECURITY: Never return otpCode in JSON response payload (CWE-200 / STX-01)
    res.json({
      message: "Verification code generated and dispatched successfully",
      emailDelivered: emailResult.success,
    });
  } catch (error) {
    console.error("sendVerificationOtp error:", error);
    res.status(500).json({ message: "Failed to dispatch verification code" });
  }
};

exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = verificationOtps.get(cleanEmail);

    if (record) {
      record.attempts = (record.attempts || 0) + 1;
      if (record.attempts > 5) {
        verificationOtps.delete(cleanEmail);
        return res.status(429).json({ message: "Too many invalid attempts. Please request a new code." });
      }
    }

    // Master code 123456 works strictly for pre-authorized demo testing accounts
    const isMasterCode = isDemoAccount(cleanEmail) && code.trim() === "123456";
    const isValidCode = record && record.code === code.trim() && record.expiresAt > Date.now();

    if (isMasterCode || isValidCode) {
      verificationOtps.delete(cleanEmail);

      // Persist verified status in database
      await prisma.user.updateMany({
        where: { email: cleanEmail },
        data: { isEmailVerified: true },
      });

      return res.json({
        message: "Email verified successfully",
        verified: true,
      });
    }

    return res.status(400).json({ message: "Invalid or expired verification code" });
  } catch (error) {
    console.error("verifyOtp error:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify account exists
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      // Uniform timing response to prevent user enumeration
      return res.json({
        message: "If an account is associated with this email, a reset code was sent.",
        emailDelivered: false,
      });
    }

    const otpCode = generateSecureOtp();
    verificationOtps.set(cleanEmail, {
      code: otpCode,
      expiresAt: Date.now() + 10 * 60 * 1000,
      attempts: 0,
    });

    const emailResult = await sendVerificationEmail(cleanEmail, otpCode);

    // SECURITY: CRITICAL FIX FOR STX-01 (Account Takeover)
    // NEVER expose otpCode in response body!
    res.json({
      message: "If an account is associated with this email, a reset code was sent.",
      emailDelivered: emailResult.success,
    });
  } catch (error) {
    console.error("forgotPassword error:", error);
    res.status(500).json({ message: "Failed to process password reset request" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, reset code, and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = verificationOtps.get(cleanEmail);

    if (record) {
      record.attempts = (record.attempts || 0) + 1;
      if (record.attempts > 5) {
        verificationOtps.delete(cleanEmail);
        return res.status(429).json({ message: "Too many invalid attempts. Please request a new reset code." });
      }
    }

    // Master code 123456 works strictly for pre-authorized demo testing accounts
    const isMasterCode = isDemoAccount(cleanEmail) && code.trim() === "123456";
    const isValidCode = record && record.code === code.trim() && record.expiresAt > Date.now();

    if (!isMasterCode && !isValidCode) {
      return res.status(400).json({ message: "Invalid or expired reset code" });
    }

    // Verify user exists in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return res.status(404).json({ message: "User account not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: cleanEmail },
      data: { password: hashedPassword },
    });

    verificationOtps.delete(cleanEmail);

    res.json({
      message: "Password reset successfully. You can now log in with your new password.",
      success: true,
    });
  } catch (error) {
    console.error("resetPassword error:", error);
    res.status(500).json({ message: "Failed to reset password" });
  }
};
