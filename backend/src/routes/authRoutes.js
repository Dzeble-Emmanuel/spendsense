const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

// Dedicated rate limiters for authentication and OTP flows (STX-05)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." },
});

const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many verification requests. Please wait 15 minutes before retrying." },
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);
router.get("/profile", authMiddleware, authController.getProfile);
router.post("/send-verification-otp", otpLimiter, authController.sendVerificationOtp);
router.post("/verify-otp", otpLimiter, authController.verifyOtp);
router.post("/forgot-password", otpLimiter, authController.forgotPassword);
router.post("/reset-password", otpLimiter, authController.resetPassword);
router.delete("/account", authMiddleware, authLimiter, authController.deleteAccount);

module.exports = router;
