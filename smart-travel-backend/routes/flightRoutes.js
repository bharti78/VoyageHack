const express = require("express");
const router = express.Router();
const { authenticate, searchFlights, fareQuote, fareRule, ssrAvailability, bookFlight } = require("../controllers/flightController");

router.post("/authenticate", authenticate);
router.post("/search", searchFlights);
router.post("/farequote", fareQuote);
router.post("/farerule", fareRule);
router.post("/ssr", ssrAvailability);
router.post("/book", bookFlight);

module.exports = router;
