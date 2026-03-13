const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
    },
    topic: {
      required: true,
      type: String,
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

    // OPTIONS FIELD
    options: {
      type: [
        {
          text: {
            type: String,
            required: true,
          },
          label: {
            required: true,
            type: String,
            enum: ["A", "B", "C", "D"],
          },
        },
      ],
      required: true,
      validate: {
        validator: function(value) {
          return value.length === 4;
        },
        message: "Options list must have exactly 4 items",
      },
    },

    correctOption: {
      enum: ["A", "B", "C", "D"],
      type: String,
      required: true,
      validate: {
        validator: function(value) {
          return this.options.some((opt) => opt.label === value);
        },
        message: "Correct option must match one of the option labels",
      },
    },
  },
  { timestamps: true },
);

questionSchema.index({
  level: 1,
  courseCode: 1,
});

module.exports = mongoose.model("Question", questionSchema);

