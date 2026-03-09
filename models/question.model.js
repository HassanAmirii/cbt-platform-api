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
      enum: ["computer science"],
      type: String,
    },

    deptSlug: {
      type: String,
      lowercase: true,
    },
    university: {
      required: true,
      type: String,
      enum: ["kwara state univerity", "lasu tech"],
    },
    uniSlug: {
      type: String,
      lowercase: true,
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

try {
  if (this.isModified("department") && this.department) {
    this.deptSlug = this.department.toLowerCase().trim().split(/\s+/).join("-");
  }
  if (this.isModified("university") && this.university) {
    this.uniSlug = this.university.toLowerCase().trim().split(/\s+/).join("-");
  }
} catch (error) {
  console.error("error in userSchema presave function", error);
  throw error;
}
module.exports = mongoose.model("Question", questionSchema);
questionSchema.index({
  uniSlug: 1,
  deptSlug: 1,
  level: 1,
  courseCode: 1,
  topic: 1,
});
