const bcrypt = require("bcrypt");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    username: {
      unique: true,
      lowercase: true,
      type: String,
      required: true,
      minlength: 4,
      trim: true,
    },
    email: {
      required: true,
      lowercase: true,
      unique: true,
      type: String,
      trim: true,
    },
    password: {
      minlength: 6,
      required: true,
      trim: true,
    },
    isAdmin: { type: Boolean, default: false },
    dept: {
      enum: ["computer_science"],
      required: true,
    },
    level: {
      enum: [100, 200, 300, 400],
      required: true,
    },
  },
  { timestamps: true },
);
