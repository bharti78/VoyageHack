const mongoose = require("mongoose")

const driverSchema = new mongoose.Schema({
  name: String,
  gender: String,
  verified: Boolean,
  rating: Number,
  vehicle_type: String,
  experienceYears: {
    type: Number,
    default: 0,
  }
})

module.exports = mongoose.model("Driver", driverSchema)
