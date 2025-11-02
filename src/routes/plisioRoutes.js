const express = require("express")
const plisioController = require("../controllers/plisioController")

const router = express.Router()

// Routes
router.get("/currencies", plisioController.getCurrencies)

module.exports = router

