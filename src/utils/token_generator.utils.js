const jwt = require("dotenv");
exports.generateToken = (payload) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      admin: user.isAdmin,
      level: user.level,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
};
