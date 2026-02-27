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
  flightBookingDetail,
  cancelFlightBooking,
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
router.post("/detail", flightBookingDetail);
router.post("/cancel", cancelFlightBooking);

module.exports = router;
