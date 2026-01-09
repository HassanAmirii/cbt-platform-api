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

    dept: {
      enum: ["computer_science"],
      required: true,
    },
    level: {
      enum: [100, 200, 300, 400],
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

questionSchema.index({ courseCode: 1, topic: 1, dept: 1, level: 1 });
module.exports = mongoose.model("Question", questionSchema);
