const express = require("express")
const router = express.Router()
const { searchTrip, smartPlan } = require("../controllers/searchController")

router.post("/", searchTrip)
router.post("/plan", smartPlan)

module.exports = router
