const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication token required" });
  }

  const token = authHeader.split(" ")[1];

  const secret = process.env.JWT_SECRET || (process.env.NODE_ENV === "production" ? null : "spendsense-jwt-secret-key-change-in-production-2026");
  if (!secret) {
    return res.status(500).json({ message: "Server configuration error: JWT_SECRET not configured" });
  }

  try {
    const decoded = jwt.verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
