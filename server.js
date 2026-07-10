require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// 1. Completely permissive CORS config to fix preflight 403 blocks
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json());

// Connect Database
connectDB();

// Application Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server executing seamlessly on port ${PORT}`),
);
