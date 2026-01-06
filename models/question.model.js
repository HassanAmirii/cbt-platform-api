const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
    },
    option: {
      type: [String],
      required: true,
    },
    correctOptionIndex: {
      required: true,
      type: Number,
    },
    level: {
      required: true,
      enum: [100, 200, 300, 400],
    },
    topic: {
      required: true,
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Question", questionSchema);
