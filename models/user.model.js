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
  //handles created_At and updated_AT...
  { timestamps: true },
);

//dont save raw password text--hash before entering DB
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (err) {
    next(err);
  }
});
module.exports = mongoose.model("User", userSchema);
