const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/search", require("./routes/searchRoutes"))
app.use("/api/user", require("./routes/userRoutes"))
app.use("/api/hotels", require("./routes/hotelRoutes"))
app.use("/api/flights", require("./routes/flightRoutes"))
app.use("/api/unified-search", require("./routes/unifiedSearchRoutes"))

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected")
    app.listen(5000, () => console.log("Server running on port 5000"))
  })
  .catch(err => console.log(err))
