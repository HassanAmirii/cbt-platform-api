const express = require("express");
const app = express();
app.use(express.json());
const authRoutes = require("./routes/v1/auth.routes");
const examRoutes = require("./routes/v1/exam.routes");
app.use("/api/v1", authRoutes);
app.use("/api/v1", examRoutes);

module.exports = app;
