const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const authMiddleware = require("../middleware/auth");
const requireVerified = require("../middleware/requireVerified");

router.use(authMiddleware);

router.get("/", budgetController.getBudgets);
router.post("/", requireVerified, budgetController.setBudget);
router.delete("/:category", requireVerified, budgetController.deleteBudget);

module.exports = router;
