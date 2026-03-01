const express = require("express")
const router = express.Router()
const {
  countryList,
  searchCities,
  hotelCodeList,
  tboHotelCodeList,
  hotelDetails,
  hotelSearch,
  calendarFares,
  proxyHotelImage,
  preBook,
  book,
  bookingDetail,
  bookingDetailsByDate,
  cancel,
  fxRate,
} = require("../controllers/hotelController")

router.get("/countries", countryList)
router.post("/cities", searchCities)
router.get("/hotelcodes", hotelCodeList)
router.post("/hotelcodelist", tboHotelCodeList)
router.post("/hoteldetails", hotelDetails)
router.post("/search", hotelSearch)
router.post("/calendar-fares", calendarFares)
router.get("/image", proxyHotelImage)
router.post("/prebook", preBook)
router.post("/book", book)
router.post("/detail", bookingDetail)
router.post("/detail-by-date", bookingDetailsByDate)
router.post("/cancel", cancel)
router.get("/fx-rate", fxRate)

module.exports = router
