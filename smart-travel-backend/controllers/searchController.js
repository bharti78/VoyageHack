const Hotel = require("../models/Hotel")
const Driver = require("../models/Driver")


exports.searchTrip = async (req, res) => {
  try {
    const { city, budget, persona, userGender = "", travelTime = "" } = req.body

    let hotels = await Hotel.find({
      city: city,
      price: { $lte: budget }
    })

    if (persona === "solo") {
      hotels = hotels.filter(h => h.female_safe && h.safety > 4)
    }

    let drivers = await Driver.find({ verified: true })

    const isFemaleSolo = persona === "solo" && String(userGender).toLowerCase() === "female"
    const hour = Number(String(travelTime || "").split(":")[0])
    const isNight = Number.isFinite(hour) && (hour >= 20 || hour < 5)

    if (isFemaleSolo) {
      const femaleDrivers = drivers.filter(d => String(d.gender).toLowerCase() === "female")
      if (femaleDrivers.length > 0) {
        drivers = femaleDrivers
      } else if (isNight) {
        drivers = drivers.filter(d =>
          Number(d.rating || 0) >= 4 &&
          Number(d.experienceYears || 0) >= 5
        )
      }
    }

    res.json({
      hotels,
      drivers
    })

  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
}
