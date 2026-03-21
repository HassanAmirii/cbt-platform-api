const jwt = require("jsonwebtoken");

//handle token verification:
exports.verifyToken = async (req, res, next) => {
  //1. check if authorization header exist
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer")) {
      return res.status(401).json({ message: "missing or invalid scheme!" });
    }
    //2. extract the token from the jwt envelope
    const token = authHeader.split(" ")[1];
    if (!token)
      return res.status(401).json({ message: "invalid or expired token" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (
      error.message === "TokenExpiredError" ||
      error.message === "JsonWebTokenError"
    ) {
      return res.status(401).json({ message: "invalid or expired token " });
    }
    res.status(500).json({ message: "internal server error" });
  }
};
