const express = require("express");

const router = express.Router();

const examController = require("../../controllers/exam.controllers");

router.post("/start-exam", examController.startExam);
router.post("/submit-exam", examController.submitExam);
module.exports = router;
