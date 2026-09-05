const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authMiddleware, authController.getProfile);
router.post("/send-verification-otp", authController.sendVerificationOtp);
router.post("/verify-otp", authController.verifyOtp);

module.exports = router;
