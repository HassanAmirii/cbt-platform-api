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
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email address",
      ],
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
    isAdmin: { type: Boolean, required: true, default: false },
  },
  { timestamps: true },
);

userSchema.pre("save", async function () {
  try {
    if (this.isModified("password")) {
      this.password = await bcrypt.hash(this.password, 10);
    }
  } catch (error) {
    console.error("error in userSchema presave function", error);
    throw error;
  }
});
module.exports = mongoose.model("User", userSchema);
