require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const port = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(function () {
    console.log("succesfully connected to the database");

    app.listen(port, () => console.log(`Server running on port ${port}`));
  })
  .catch(function (err) {
    console.error("error connecting to the database:", err);
  });
