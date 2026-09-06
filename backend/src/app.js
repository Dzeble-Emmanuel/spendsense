const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const predictionRoutes = require("./routes/predictionRoutes");
const budgetRoutes = require("./routes/budgetRoutes");

const app = express();

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));

// CORS Configuration
app.use(cors());

// General API rate limiter (prevents API flooding / DoS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // Limit each IP to 300 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many requests from this IP, please try again after 15 minutes.",
    code: "RATE_LIMIT_EXCEEDED",
  },
});

app.use("/api", globalLimiter);
app.use(express.json({ limit: "1mb" }));

// Root and Health check endpoints
app.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "SpendSense Backend API",
    version: "1.0.0",
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "SpendSense Backend API",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/predictions", predictionRoutes);
app.use("/api/budgets", budgetRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

module.exports = app;
