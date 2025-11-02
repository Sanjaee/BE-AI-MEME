const express = require("express");
const authController = require("../controllers/authController.js");

const router = express.Router();

// Auth routes
router.post("/login", authController.login);
router.post("/verify-token", authController.verifyToken);
router.post("/refresh", authController.refreshToken);

module.exports = router;

