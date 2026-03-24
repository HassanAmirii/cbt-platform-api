const examServices = require("../services/exam.services");
const Result = require("../model/result.model");

exports.startExam = function (req, res) {
  try {
    const { courseCode, level = req.user.level, limit = 5 } = req.body;

    if (!courseCode || !level) {
      return res
        .status(400)
        .json({ message: "bad request: could not find courseCode or level" });
    }
    const questions = examServices.getExamQuestions(courseCode, level, limit);
    if (!questions.length) {
      return res
        .status(404)
        .json({ message: "No questions found for this course/level." });
    }

    res.status(200).json({ questions });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.submitExam = async function (req, res) {
  try {
    const { answers, courseCode } = req.body;
    const student = req.user.id;
    const level = req.user.level;
    if (!answers) {
      return res
        .status(400)
        .json({ message: "bad request: could not find answers payload" });
    }
    const { score, explanation } = examServices.submitExam(answers);
    if (!score && score !== 0) {
      return res.status(400).json({
        message: "missing answer or invalid question id or selected",
      });
    }
    const newResult = await Result.create({
      student,
      courseCode,
      level,
      answers,
      score,
      explanation,
    });
    res.status(200).json({ score, explanation });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
