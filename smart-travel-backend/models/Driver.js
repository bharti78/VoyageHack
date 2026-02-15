const mongoose = require("mongoose")

const driverSchema = new mongoose.Schema({
  name: String,
  gender: String,
  verified: Boolean,
  rating: Number,
  vehicle_type: String
})

module.exports = mongoose.model("Driver", driverSchema)
