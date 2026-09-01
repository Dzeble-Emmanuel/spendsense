const express = require("express");
const router = express.Router();
const predictionController = require("../controllers/predictionController");
const authMiddleware = require("../middleware/auth");

router.use(authMiddleware);

router.get("/", predictionController.getPredictions);

module.exports = router;
