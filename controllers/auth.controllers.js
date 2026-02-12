const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

exports.register = async function (req, res, next) {
  try {
    const { username, email, password, level, department } = req.body;
    const newUser = await User.create({
      username,
      email,
      password,
      level,
      department,
    });
    const userSafe = newUser.toObject();
    delete userSafe.password;
    res.status(201).json({ message: "success", user: userSafe });
  } catch (error) {
    next(error);
  }
};
exports.login = async function (req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+passoword");
    if (!user) return res.status(401).json({ message: "invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "invalid credentials" });

    const payload = {
      id: user._id,
      username: user.username,
      admin: user.isAdmin,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "login successful", token: token });
  } catch (error) {
    next(error);
  }
};
