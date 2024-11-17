const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // Directly use the connection string in the code
    await mongoose.connect(process.env.MONGO_URI, {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log("MongoDB connected to Atlas");

    // Check if connection is established
    const connectionState = mongoose.connection.readyState;
    if (connectionState === 1) {
      console.log("Connection is established successfully.");
    } else {
      console.log("Connection status: ", connectionState);
    }
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit the process with failure
  }
};

module.exports = connectDB;
