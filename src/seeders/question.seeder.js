require("dotenv").config;
const mongoose = require("mongoose");
const Question = require("../models/question.model");
const questions = require("../../data/questions.json");

mongoose.connect(process.env.MONGO_URI).then(() => console.log("DB Connected"));

const importData = async function () {
  try {
    await Question.deleteMany();
    await Question.insertMany(questions);
    console.log("data imported succesfully");
    process.exit();
  } catch (error) {
    console.error("error importing data", error);
    process.exit(1);
  }
};

if (process.argv[2] === "-i") {
  importData();
}
