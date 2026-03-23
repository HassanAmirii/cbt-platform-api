require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const port = process.env.PORT || 3000;
const options = {
  autoIndex: false,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 30000,
  family: 4,
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function connectWithRetry() {
  let delay = 1000;
  for (let retry = 0; retry < 5; retry++) {
    try {
      await mongoose.connect(process.env.MONGO_URI, options);
      console.log("succesfully connected to the database");
      app.listen(port, () => console.log(`Server running on port ${port}`));
      return;
    } catch (error) {
      console.error("error connecting to the database:", error);
      await wait(delay);
      delay *= 2;
    }
  }
  process.exit(1);
}

connectWithRetry();
