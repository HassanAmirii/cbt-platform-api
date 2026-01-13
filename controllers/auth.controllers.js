const mongoose = require("mongoose");
const User = require("../models/user.model");
exports.register = async (req, res) => {
  try {
    const { username, password, email, level, dept } = req.body;
    const newUser = new User({ username, password, email, level, dept });
    await newUser.save();
    res.status(201).json({ message: "Registration successful", user: newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
