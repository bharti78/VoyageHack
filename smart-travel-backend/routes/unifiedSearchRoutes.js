const express = require("express");
const router = express.Router();
const { unifiedSearch } = require("../controllers/unifiedSearchController");

// POST /api/unified-search
// Body: { query, fromCity, toCity, startDate, endDate, adults, budget, ... }
router.post("/", unifiedSearch);

module.exports = router;
