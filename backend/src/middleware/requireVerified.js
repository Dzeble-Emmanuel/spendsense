const prisma = require("../config/database");

const PRE_VERIFIED_ACCOUNTS = ["demo@spendsense.app", "test@spendsense.app"];

/**
 * Middleware to enforce email verification on protected financial endpoints
 * Blocks unverified users (including demo2@spendsense.app) with HTTP 403 Forbidden
 */
module.exports = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const email = req.user.email ? req.user.email.toLowerCase().trim() : "";

    // Pre-verified demo account bypass
    if (PRE_VERIFIED_ACCOUNTS.includes(email)) {
      return next();
    }

    // Lookup user verification status in database
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isEmailVerified: true, email: true },
    });

    if (!user || !user.isEmailVerified) {
      return res.status(403).json({
        message: "Email verification is required to create or modify budget limits.",
        code: "EMAIL_VERIFICATION_REQUIRED",
      });
    }

    next();
  } catch (error) {
    console.error("requireVerified middleware error:", error);
    return res.status(500).json({ message: "Security authorization error" });
  }
};
