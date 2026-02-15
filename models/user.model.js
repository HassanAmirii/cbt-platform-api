const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
      minlength: 4,
      trim: true,
    },
    email: {
      trim: true,
      type: String,
      unique: true,
      required: true,
    },
    password: {
      select: false,
      type: String,
      required: true,
      minlength: 6,
    },
    level: {
      required: true,
      type: String,
      enum: ["100", "200", "300", "400"],
    },
    department: {
      required: true,
      type: String,
      enum: ["computer science"],
    },

    deptSlug: {
      required: true,
      type: String,
      lowercase: true,
    },
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
    if (this.isModified("department") && this.department) {
      this.deptSlug = this.department
        .toLowerCase()
        .trim()
        .split(/\s+/)
        .join("-");
    }
  } catch (error) {
    console.error("error in userSchema presave function", error);
    throw error;
  }
});
module.exports = mongoose.model("User", userSchema);
