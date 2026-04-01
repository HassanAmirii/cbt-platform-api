const User = require("../models/user.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {
  registerSchema,
  loginSchema,
} = require("../validators/auth.validators");

exports.register = async function (req, res, next) {
  try {
    const { error } = registerSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { username, email, password, level } = req.body;
    const newUser = await User.create({
      username,
      email,
      password,
      level,
    });
    const userSafe = newUser.toObject();
    delete userSafe.password;
    res.status(201).json({ message: "success", user: userSafe });
  } catch (err) {
    next(err);
  }
};
exports.login = async function (req, res, next) {
  try {
    const { error } = loginSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(401).json({ message: "invalid credentials" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "invalid credentials" });
    }

    const payload = {
      id: user._id,
      username: user.username,
      admin: user.isAdmin,
      level: user.level,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.status(200).json({ message: "login successful", token: token });
  } catch (err) {
    next(err);
  }
};
