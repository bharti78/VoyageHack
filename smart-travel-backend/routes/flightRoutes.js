const express = require("express");
const router = express.Router();
const {
  authenticate,
  airports,
  searchFlights,
  fareQuote,
  fareRule,
  ssrAvailability,
  bookFlight,
  calendarFares,
} = require("../controllers/flightController");

router.post("/authenticate", authenticate);
router.get("/airports", airports);
router.post("/search", searchFlights);
router.post("/calendar-fares", calendarFares);
router.post("/farequote", fareQuote);
router.post("/farerule", fareRule);
router.post("/ssr", ssrAvailability);
router.post("/book", bookFlight);

module.exports = router;
