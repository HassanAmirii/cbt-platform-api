require("dotenv").config();
const mongoose = require("mongoose");
const Question = require("../models/question.model");

const fileName = process.argv[2];
if (!fileName) {
  console.error("❌ Please provide a filename as an argument.");
  process.exit(1);
}

const data = require(`../../data/COMP_SCI/100/2NDSEM/MTH102/${fileName}.json`);

const importData = async function () {
  try {
    // Insert new data
    await Question.insertMany(data);
    console.log("✅ New data imported successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error processing data:", error);
    process.exit(1);
  }
};

mongoose
  .connect(process.env.MONGO_ATLAS_URI)
  .then(async () => {
    console.log("DB Connected");
    await importData();
  })
  .catch((err) => {
    console.error("❌ DB Connection failed:", err.message);
    process.exit(1);
  });
