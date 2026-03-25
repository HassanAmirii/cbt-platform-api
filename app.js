const express = require("express");
require("dotenv").config();
const app = express();
app.use(express.json());
const authRoutes = require("./routes/v1/auth.routes");
const examRoutes = require("./routes/v1/exam.routes");
app.use("/api/v1", authRoutes);
app.use("/api/v1", examRoutes);

app.use((err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";

  // 1. Handle Mongoose/MongoDB Validation Errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
  }

  // 2. Handle MongoDB Duplicate Key (e.g., Email already exists)
  if (err.code === 11000) {
    statusCode = 400;
    message = "Duplicate field value entered";
  }

  // 3. Handle JWT Errors (Categorized by name)
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Your token has expired.";
  }

  res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.APP_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;
