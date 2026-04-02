const express = require("express");

const router = express.Router();
const { auth } = require("../../middleware/auth.middleware");
const userController = require("../../controllers/user.controllers");

router.get("/results", auth, userController.getStudentResult);

module.exports = router;
