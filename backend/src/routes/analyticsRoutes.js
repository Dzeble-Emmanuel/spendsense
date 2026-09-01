const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/summary", analyticsController.getSummary);
router.get("/trends", analyticsController.getMonthlyTrends);

module.exports = router;
