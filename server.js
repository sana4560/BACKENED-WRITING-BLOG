require("dotenv").config();

const express = require("express");
const cors = require("cors"); // Import CORS
const mongoose = require("mongoose");
const path = require("path");

const app = express();
const userRoutes = require("./routes/UserRoutes");
const PostRoutes = require("./routes/PostRoutes");
const connectDB = require("./config/db");

app.use(cors());

connectDB();

app.use(express.json());
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

// Use the user routes for requests to /users
app.use("/users", userRoutes);
app.use("/post", PostRoutes);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
