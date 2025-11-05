const express = require("express");
const aiChatController = require("../controllers/aiChatController.js");

const router = express.Router();

// Route - Chat completion
router.post("/chat", aiChatController.chatCompletion);

module.exports = router;

