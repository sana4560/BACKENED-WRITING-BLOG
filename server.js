require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const serverless = require("serverless-http");

const app = express();
const userRoutes = require("./routes/UserRoutes");
const postRoutes = require("./routes/PostRoutes");
const connectDB = require("./config/db");

app.use(cors());

// Connect to the database
connectDB();

// Middleware to parse JSON requests
app.use(express.json());

// Routes
app.use("/users", userRoutes);
app.use("/post", postRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Default route (just in case you want to check if everything is working)
app.get("/", (req, res) => {
  res.send("Backend server is working");
});

// Wrap the Express app using serverless-http
module.exports = serverless(app);
