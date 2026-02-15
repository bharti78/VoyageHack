const mongoose = require("mongoose")

const hotelSchema = new mongoose.Schema({
  name: String,
  city: String,
  price: Number,
  rating: Number,
  safety: Number,
  family_friendly: Boolean,
  female_safe: Boolean,
  lat: Number,
  lng: Number,
  vibe: [String],
  amenities: [String]
})

module.exports = mongoose.model("Hotel", hotelSchema)
