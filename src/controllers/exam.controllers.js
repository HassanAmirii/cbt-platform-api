const examServices = require("../services/exam.services");
const Result = require("../models/result.model");

exports.startExam = async function (req, res, next) {
  try {
    const { courseCode, limit } = req.body;
    const level = req.user.level;
    const student = req.user.id;
    if (!courseCode || !level || !limit || !student) {
      return res.status(400).json({
        message: "bad request: courseCode, level or limit is missing",
      });
    }
    const examData = await examServices.getExamQuestions(
      courseCode,
      level,
      limit,
      student,
    );
    if (!examData.questions.length) {
      return res
        .status(404)
        .json({ message: "No questions found for this course/level." });
    }
    res.status(200).json({
      questions: examData.questions,
      attemptId: examData.AttemptId,
    });
  } catch (err) {
    next(err);
  }
};

exports.submitExam = async function (req, res, next) {
  try {
    const { answers, attemptId } = req.body;
    if (!answers || !attemptId) {
      return res.status(400).json({
        message: "bad request: could not find answers payload or attemptId",
      });
    }
    const { score, explanation } = await examServices.submitExam(
      answers,
      attemptId,
    );
    res.status(200).json({ score, explanation });
  } catch (err) {
    next(err);
  }
};
