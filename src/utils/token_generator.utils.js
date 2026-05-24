const jwt = require("jsonwebtoken");
exports.generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      username: user.username,
      department: user.department,
      admin: user.isAdmin,
      level: user.level,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );
};
