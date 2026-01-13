const mongoose = require("mongoose");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
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

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne(username);
    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized; invalid username." });
    }
    const isMatch = await bcrypt.compare(user.password, password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Unauthorized; invalid username." });
    }
    const payload = {
      id: user._id,
      username: user.username,
      admin: user.isAdmin,
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "user login succesful", token: token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Try again later, An internal server error occured " });
  }
};
