const mongoose = require("mongoose")

const driverSchema = new mongoose.Schema({
  name: String,
  gender: String,
  verified: Boolean,
  rating: Number,
  totalTrips: {
    type: Number,
    default: 0,
  },
  vehicle_type: String,
  experienceYears: {
    type: Number,
    default: 0,
  },
  safety: {
    backgroundCheckStatus: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    lastPoliceVerificationAt: Date,
    womenSafetyTrainingCompleted: {
      type: Boolean,
      default: false,
    },
    panicButtonEnabled: {
      type: Boolean,
      default: false,
    },
    sosEnabled: {
      type: Boolean,
      default: false,
    },
  },
  availability: {
    isOnline: {
      type: Boolean,
      default: true,
    },
    preferredShift: {
      type: String,
      enum: ["day", "night", "both"],
      default: "both",
    },
  },
})

module.exports = mongoose.model("Driver", driverSchema)
