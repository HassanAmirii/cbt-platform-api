const mongoose = require("mongoose");
const User = require("../src/models/user.model");
const Question = require("../src/models/question.model");
const Result = require("../src/models/result.model");
const Attempt = require("../src/models/attempt.model");
require("dotenv").config();

async function createIndexes() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to database");

    await User.createIndexes();
    console.log("User indexes created");

    await Question.createIndexes();
    console.log("Question indexes created");

    await Result.createIndexes();
    console.log("Result indexes created");

    // Attempt has no explicit indexes in the schema currently,
    // but calling createIndexes() is safe and a no-op if none exist.
    await Attempt.createIndexes();
    console.log("Attempt indexes created (if any)");

    console.log("All indexes created successfully");
  } catch (error) {
    console.error("Error creating indexes:", error);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

createIndexes();
