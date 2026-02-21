const express = require("express")
const router = express.Router()
const {
  searchCities,
  hotelSearch,
  preBook,
  book,
  bookingDetail,
  cancel,
} = require("../controllers/hotelController")

router.post("/cities", searchCities)
router.post("/search", hotelSearch)
router.post("/prebook", preBook)
router.post("/book", book)
router.post("/detail", bookingDetail)
router.post("/cancel", cancel)

module.exports = router
