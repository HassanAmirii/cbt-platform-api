const mongoose = require("mongoose");

const attemptSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    duration: { type: Number, required: true },
    courseCode: { type: String, required: true },
    level: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["ongoing", "submitted", "expired"],
      default: "ongoing",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Attempt", attemptSchema);
