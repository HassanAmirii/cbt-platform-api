const mongoose = require("mongoose");

const mentorSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    nickname: { type: String, required: true },
    whatsapp: { type: String, required: true },
    bio: { type: String, required: true },
    department: { type: String, required: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Mentor", mentorSchema);
