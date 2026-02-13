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
      type: String,
      unique: true,
      required: true,
      lowercase: true,
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
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    this.password = await bcrypt.hash(this.password, 10);
  } catch (error) {
    throw error;
  }
});
module.exports = mongoose.model("User", userSchema);
