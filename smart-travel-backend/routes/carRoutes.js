const express = require("express");
const router = express.Router();
const { carSearch } = require("../controllers/carController");

// POST /api/car-search
router.post("/", carSearch);

module.exports = router;
