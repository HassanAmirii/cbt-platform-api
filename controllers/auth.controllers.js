const User = require("../models/user.model");

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
    res.status(201).json({ message: "success", data: { user: newUser } });
  } catch (error) {
    next(error);
  }
};
