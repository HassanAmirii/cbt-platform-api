require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

mongoose
  .connect(process.env.MONGO_URI)
  .then(function () {
    console.log("succesfully connected to the database");

    app.listen(3000, () => console.log("Server running on port 3000"));
  })
  .catch(function (err) {
    console.error("error connecting to the database:", err);
  });
