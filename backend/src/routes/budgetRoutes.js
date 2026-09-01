const express = require("express");
const router = express.Router();
const budgetController = require("../controllers/budgetController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/", budgetController.getBudgets);
router.post("/", budgetController.setBudget);

module.exports = router;
