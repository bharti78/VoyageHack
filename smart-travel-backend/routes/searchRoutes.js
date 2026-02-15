const express = require("express")
const router = express.Router()
const { searchTrip } = require("../controllers/searchController")

router.post("/", searchTrip)

module.exports = router
