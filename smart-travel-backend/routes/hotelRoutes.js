const express = require("express")
const router = express.Router()
const {
  countryList,
  searchCities,
  hotelCodeList,
  tboHotelCodeList,
  hotelDetails,
  hotelSearch,
  preBook,
  book,
  bookingDetail,
  bookingDetailsByDate,
  cancel,
} = require("../controllers/hotelController")

router.get("/countries", countryList)
router.post("/cities", searchCities)
router.get("/hotelcodes", hotelCodeList)
router.post("/hotelcodelist", tboHotelCodeList)
router.post("/hoteldetails", hotelDetails)
router.post("/search", hotelSearch)
router.post("/prebook", preBook)
router.post("/book", book)
router.post("/detail", bookingDetail)
router.post("/detail-by-date", bookingDetailsByDate)
router.post("/cancel", cancel)

module.exports = router
