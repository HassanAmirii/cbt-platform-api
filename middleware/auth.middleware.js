const jwt = require("jsonwebtoken");
require("dotenv").config();

//handle token verification:
exports.verifyToken = async (req, res, next) => {
  //1. check if authorization header exist
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res
        .status(401)
        .json({ message: "Authentication required but missing !" });
    }
    //2. extract the token from the jwt envelope
    const token = authHeader.split(" ")[1];
    //3. recompute a new signatire and see if it matched / valid compare with the extracted token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "bad request, invalid token." });
  }
};
