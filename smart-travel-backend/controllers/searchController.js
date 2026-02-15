const Hotel = require("../models/Hotel")
const Driver = require("../models/Driver")


exports.searchTrip = async (req, res) => {
  try {
    const { city, budget, persona } = req.body

    let hotels = await Hotel.find({
      city: city,
      price: { $lte: budget }
    })

    if (persona === "solo") {
      hotels = hotels.filter(h => h.female_safe && h.safety > 4)
    }

    let drivers = await Driver.find({ verified: true })

    if (persona === "solo") {
      drivers = drivers.filter(d => d.gender === "female")
    }

    res.json({
      hotels,
      drivers
    })

  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
}
