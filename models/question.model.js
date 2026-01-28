const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      unique: true,
      required: true,
    },
    topic: {
      required: true,
      type: String,
    },
    department: {
      required: true,
      type: String,
    },
    level: {
      type: [String],
      enum: ["100", "200", "300", "400"],
      required: true,
    },
    courseCode: {
      required: true,
      type: String,
    },
    option: {
      type: [String],
      required: true,
    },
    correctOptionIndex: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true },
);
questionSchema.index({ department: 1, level: 1, courseCode: 1, topic: 1 });
module.exports = mongoose.model("Question", questionSchema);
