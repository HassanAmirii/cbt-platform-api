const mongoose = require("mongoose");
const Mentor = require("../models/mentor.model");
const User = require("../models/user.model");

exports.registerMentor = async ({
  userId,
  department,
  nickname,
  whatsapp,
  bio,
}) => {
  const existingMentor = await Mentor.findOne({ user: userId });
  if (existingMentor) {
    const error = new Error("mentor profile already exists");
    error.status = 409;
    throw error;
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [mentor] = await Mentor.create(
      [{ user: userId, nickname, whatsapp, bio, department }],
      { session },
    );

    await User.findByIdAndUpdate(userId, { role: "mentor" }, { session });

    await session.commitTransaction();
    session.endSession();

    return mentor;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

exports.getDepartmentMentors = async (department) => {
  return Mentor.find({ department }).populate("user", "username -_id");
};

exports.updateMentorProfile = async ({ userId, updates }) => {
  const allowedFields = ["nickname", "whatsapp", "bio"];
  const filteredUpdates = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      filteredUpdates[field] = updates[field];
    }
  });

  const mentor = await Mentor.findOneAndUpdate(
    { user: userId },
    { $set: filteredUpdates },
    { new: true, runValidators: true },
  );

  if (!mentor) {
    const error = new Error("mentor profile not found");
    error.status = 403;
    throw error;
  }

  return mentor;
};
exports.getMentorProfile = async (userId) => {
  const mentor = await Mentor.findOne({ user: userId });
  if (!mentor) {
    const error = new Error("Mentor profile not found");
    error.status = 404;
    throw error;
  }
  return mentor;
};
