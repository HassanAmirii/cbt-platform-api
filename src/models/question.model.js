const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  /*

Example Question document:

{

  "questionText": "what is the primary function of an operating system?",

  "topic": "computer basics",

  "level": "100",

  "department": "COMP_SCI"

  "weeks": 1,

  "semester": 1,

  "courseCode": "CBT101",

  "options": [

    { "text": "manages hardware and software resources", "label": "A" },

    { "text": "creates internet connections", "label": "B" },

    { "text": "stores files only", "label": "C" },

    { "text": "designs web pages", "label": "D" }

  ],

  "correctOption": "A",

  "explanation": "An operating system manages hardware and software resources and provides common services for programs."

}

*/
  {
    questionText: {
      type: String,
      required: true,
      lowercase: true,
    },
    topic: {
      type: String,
      required: true,
      lowercase: true,
    },
    level: {
      type: String,
      enum: ["100", "200", "300", "400"],
      required: true,
    },
    department: { type: String, required: true },
    week: {
      type: Number,
      required: true,
      min: 1,
      max: 15,
    },
    semester: {
      type: Number,
      required: true,
      enum: [1, 2],
    },
    courseCode: {
      required: true,
      type: String,
      uppercase: true,
    },
    options: {
      type: [
        {
          text: { type: String, required: true },
          label: { type: String, enum: ["A", "B", "C", "D"], required: true },
        },
      ],
      required: true,
      validate: {
        validator: function (value) {
          return value.length === 4;
        },
        message: "Options list must have exactly 4 items",
      },
    },
    correctOption: {
      type: String,
      enum: ["A", "B", "C", "D"],
      required: true,
      validate: {
        validator: function (value) {
          return this.options.some((opt) => opt.label === value);
        },
        message: "Correct option must match one of the option labels",
      },
    },
    explanation: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

// This index now perfectly aligns with the fields above
questionSchema.index({
  department: 1,
  level: 1,
  semester: 1,
  courseCode: 1,
  week: 1,
});

module.exports = mongoose.model("Question", questionSchema);
