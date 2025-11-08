const express = require("express");

const aiTokenBnbCombinedController = require("../controllers/aiTokenBnbCombinedController.js");
const aiTokenBnbNewpairs = require("../controllers/aiTokenBnbNewpairs.js");

const router = express.Router();

// Routes - BNB Combined (gabungkan semua data BNB)
router.get("/", aiTokenBnbCombinedController.getCombinedData);

// Routes - BNB Individual tables
router.get("/newPairs", aiTokenBnbNewpairs.getNewPairsData);

module.exports = router;

