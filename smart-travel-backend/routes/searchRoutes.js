const express = require("express")
const router = express.Router()
const { searchTrip, smartPlan, parseQuery, suggestQueries } = require("../controllers/searchController")

router.post("/", searchTrip)
router.post("/plan", smartPlan)
router.post("/parse", parseQuery)
router.get("/suggestions", suggestQueries)

module.exports = router
