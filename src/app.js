const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());

/*
cors setup
*/
const allowedOrigins =
  process.env.APP_ENV === "production"
    ? [process.env.FRONTEND_URL]
    : [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
      ];
app.use(
  cors({
    origin: allowedOrigins,
    credential: true,
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

/*
swagger api documentation
*/
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");

const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/*
health checks
*/
app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "CBT API is running",
  });
});

app.get("/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "healthy",
  });
});

/*
routes mount
*/
const authRoutes = require("./routes/v1/auth.routes");
const examRoutes = require("./routes/v1/exam.routes");
const userRoutes = require("./routes/v1/user.routes");
app.use("/api/v1", userRoutes);
app.use("/api/v1", authRoutes);
app.use("/api/v1", examRoutes);

/*
global error handler
*/
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
    const field = Object.keys(err.keyValue)[0];
    statusCode = 409;
    message = `${field} already exists.`;
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

  return res.status(statusCode).json({
    success: false,
    message: message,
    stack: process.env.APP_ENV === "development" ? err.stack : undefined,
  });
});

module.exports = app;
