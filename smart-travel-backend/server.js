const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const path = require("path")
require("dotenv").config({ path: path.join(__dirname, ".env") })

const app = express()

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (allowedOrigins.includes(origin)) return true;
  return allowedOrigins.some((entry) => {
    if (!entry.startsWith("*.")) return false;
    const base = entry.slice(1); // ".example.com"
    return origin.endsWith(base);
  });
}

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (isAllowedOrigin(origin)) return callback(null, true);
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
    const PORT = Number(process.env.PORT || 5000);
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  })
  .catch(err => console.log(err))
