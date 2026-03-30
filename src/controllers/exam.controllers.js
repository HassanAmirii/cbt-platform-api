const examServices = require("../services/exam.services");
const Result = require("../models/result.model");

exports.startExam = async function (req, res, next) {
  try {
    const { courseCode, limit } = req.body;
    const level = req.user.level;
    if (!courseCode || !level || !limit) {
      return res.status(400).json({
        message: "bad request: courseCode, level or limit is missing",
      });
    }
    const questions = examServices.getExamQuestions(courseCode, level, limit);
    if (!questions.length) {
      return res
        .status(404)
        .json({ message: "No questions found for this course/level." });
    }
    res.status(200).json({ questions });
  } catch (err) {
    next(err);
  }
};

exports.submitExam = async function (req, res, next) {
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
  } catch (err) {
    next(err);
  }
};
