const express = require("express");
const openRouterController = require("../controllers/openRouterController.js");

const router = express.Router();

// Routes - OpenRouter API Key management
router.get("/", openRouterController.getApiKey); // Get API key yang sudah disensor
router.post("/update", openRouterController.updateApiKey); // Update atau create API key

module.exports = router;

