require("dotenv").config();
const express = require("express");
const app = express();
app.use(express());

app.use("/auth", require("./routes/auth.routes"));

module.exports = app;
