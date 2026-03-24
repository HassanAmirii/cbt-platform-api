const express = require("express");

const router = express.Router();
const auth = require("../../middleware/auth.middleware");
const examController = require("../../controllers/exam.controllers");

router.post("/start-exam", auth, examController.startExam);
router.post("/submit-exam", auth, examController.submitExam);
module.exports = router;
