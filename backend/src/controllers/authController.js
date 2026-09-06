const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/database");

const VALID_CURRENCIES = ["GHS", "USD", "EUR", "GBP", "NGN", "KES"];

exports.register = async (req, res) => {
  try {
    const { fullName, email, password, currencyPreference } = req.body;

    if (!fullName || !email || !password) {
      return res.status(400).json({ message: "Please provide all required fields" });
    }

    const preferredCurrency = VALID_CURRENCIES.includes(currencyPreference)
      ? currencyPreference
      : "GHS";

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        password: hashedPassword,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        createdAt: true,
      },
    });

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "spendsense-jwt-secret-key-change-in-production-2026",
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

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
      process.env.JWT_SECRET || "spendsense-jwt-secret-key-change-in-production-2026",
      { expiresIn: "30d" }
    );

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
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
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        ...user,
        currencyPreference: "GHS",
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ message: "Server error fetching profile" });
  }
};

const { sendVerificationEmail } = require("../utils/emailService");

const verificationOtps = new Map();

exports.sendVerificationOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otpCode = code || Math.floor(100000 + Math.random() * 900000).toString();
    verificationOtps.set(email.toLowerCase(), {
      code: otpCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    console.log(`[SpendSense Verification] 6-digit OTP code for ${email}: ${otpCode}`);

    // Deliver real email to inbox via Gmail SMTP
    const emailResult = await sendVerificationEmail(email.toLowerCase(), otpCode);

    res.json({
      message: "Verification code generated and dispatched successfully",
      code: otpCode,
      emailDelivered: emailResult.success,
    });
  } catch (error) {
    console.error("sendVerificationOtp error:", error);
    res.status(500).json({ message: "Failed to dispatch verification code" });
  }
};

const DEMO_ACCOUNTS = ["demo@spendsense.app", "demo2@spendsense.app", "test@spendsense.app"];
const isDemoAccount = (email) => Boolean(email && DEMO_ACCOUNTS.includes(email.toLowerCase().trim()));

exports.verifyOtp = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: "Email and code are required" });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = verificationOtps.get(cleanEmail);
    // Master code 123456 works strictly for pre-authorized demo testing accounts
    const isMasterCode = isDemoAccount(cleanEmail) && code.trim() === "123456";
    const isValidCode = record && record.code === code.trim() && record.expiresAt > Date.now();

    if (isMasterCode || isValidCode) {
      verificationOtps.delete(cleanEmail);
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
      return res.status(404).json({ message: "No account found with this email address" });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    verificationOtps.set(cleanEmail, {
      code: otpCode,
      expiresAt: Date.now() + 15 * 60 * 1000,
    });

    console.log(`[SpendSense Password Reset] 6-digit OTP code for ${cleanEmail}: ${otpCode}`);

    const emailResult = await sendVerificationEmail(cleanEmail, otpCode);

    res.json({
      message: "Password reset code sent to your email",
      code: otpCode,
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

