const express = require("express");

const aiTokenBnbCombinedController = require("../controllers/aiTokenBnbCombinedController.js");
const aiTokenBnbNewpairs = require("../controllers/aiTokenBnbNewpairs.js");
const aiTokenBnbFinalStretchController = require("../controllers/aiTokenBnbFinalStretchController.js");
const aiTokenBnbMigratedController = require("../controllers/aiTokenBnbMigratedController.js");

const router = express.Router();

// Routes - BNB Combined (gabungkan semua data BNB: newPairs, finalStretch, migrated)
router.get("/", aiTokenBnbCombinedController.getCombinedData);

// Routes - BNB Individual tables
router.get("/newPairs", aiTokenBnbNewpairs.getNewPairsData);
router.get("/finalStretch", aiTokenBnbFinalStretchController.getFinalStretchData);
router.get("/migrated", aiTokenBnbMigratedController.getMigratedData);

module.exports = router;

