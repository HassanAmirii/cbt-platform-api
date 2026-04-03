const mongoose = require("mongoose");
const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    level: {
      type: String,
      enum: ["100", "200", "300", "400"],
      required: true,
    },

    courseCode: {
      required: true,
      type: String,
    },
    score: {
      required: true,
      type: Number,
    },

    /*
     "explanation": [
         {
            "questionId": "strings"
            "questionText": "what is the primary function of an operating system?",
            "correctOption": "A",
            "correctOptionText": "the right optio" ,
            "selectedOptionText": "the one user picked",
            "explanation": "An operating system acts as an intermediary between the user and the computer hardware, coordinating CPU time, memory allocation, and storage.",
            "picked": "A",
            "isCorrect": true
        }
    ]
    */
    explanation: {
      type: [
        {
          questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Question",
          },
          questionText: {
            type: String,
            required: true,
          },
          correctOption: {
            required: true,
            type: String,
            enum: ["A", "B", "C", "D"],
          },
          correctOptionText: {
            type: String,
            required: true,
          },
          selectedOptionText: {
            type: String,
            require: true,
          },
          explanation: {
            type: String,
            required: true,
          },
          picked: {
            type: String,
            enum: ["A", "B", "C", "D", null],
            default: null,
          },
          isCorrect: { type: Boolean, required: true },
        },
      ],
      required: true,
    },
  },
  { timestamps: true },
);

resultSchema.index({ student: 1, courseCode: 1, createdAt: -1 });
module.exports = mongoose.model("Result", resultSchema);
