const express = require("express");

const aiTokenCombinedController = require("../controllers/aiTokenCombinedController.js");
const aiTokenNewPairsController = require("../controllers/aiTokenNewPairsController.js");
const aiTokenFinalStretchController = require("../controllers/aiTokenFinalStretchController.js");
const aiTokenMigratedController = require("../controllers/aiTokenMigratedController.js");

const router = express.Router();

// Routes - Combined (gabungkan semua data)
router.get("/", aiTokenCombinedController.getCombinedData);

// Routes - Individual tables
router.get("/newPairs", aiTokenNewPairsController.getNewPairsData);
router.get("/finalStretch", aiTokenFinalStretchController.getFinalStretchData);
router.get("/migrated", aiTokenMigratedController.getMigratedData);

// Routes - Token management
router.get("/token", aiTokenCombinedController.getToken); // Get token yang sudah disensor
router.post("/update", aiTokenCombinedController.updateToken);

module.exports = router;
