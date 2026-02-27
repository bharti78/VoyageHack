const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ limit: '10mb', extended: true }))

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/search", require("./routes/searchRoutes"))
app.use("/api/user", require("./routes/userRoutes"))
app.use("/api/hotels", require("./routes/hotelRoutes"))
app.use("/api/flights", require("./routes/flightRoutes"))
app.use("/api/unified-search", require("./routes/unifiedSearchRoutes"))
app.use("/api/chat", require("./routes/chatRoutes"))
app.use("/api/car-search", require("./routes/carRoutes"))

app.use((err, req, res, next) => {
  console.error("[server] unhandled error", {
    path: req?.path,
    method: req?.method,
    message: err?.message,
  });
  if (res.headersSent) return next(err);
  return res.status(500).json({
    success: false,
    message: err?.message || "Internal server error",
  });
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected")
    app.listen(5000, () => console.log("Server running on port 5000"))
  })
  .catch(err => console.log(err))
