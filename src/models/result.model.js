const mongoose = require("mongoose");

const resultSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    aiFeedback: {
      type: String,
      default: null,
    },
    level: {
      type: String,
      enum: ["100", "200", "300", "400"],
      required: true,
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    courseCode: {
      type: String,
      required: true,
      uppercase: true,
    },
    topics: {
      type: [String],
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    explanation: {
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

            "isCorrect": true,

        }

    ]

    */
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
            type: String,
            enum: ["A", "B", "C", "D"],
            required: true,
          },
          correctOptionText: {
            type: String,
            required: true,
          },
          selectedOptionText: {
            type: String,
            default: null,
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
          isCorrect: {
            type: Boolean,
            required: true,
          },
        },
      ],
      required: true,
    },
  },
  { timestamps: true },
);

resultSchema.index({ student: 1, courseCode: 1, createdAt: -1 });

module.exports = mongoose.model("Result", resultSchema);
