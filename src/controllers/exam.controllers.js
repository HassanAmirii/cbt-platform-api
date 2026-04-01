const examServices = require("../services/exam.services");
const {
  startExamSchema,
  submitExamSchema,
} = require("../validators/exam.validators");

exports.startExam = async function (req, res, next) {
  try {
    const { error } = startExamSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });
    const { courseCode, limit } = req.body;
    const level = req.user.level;
    const student = req.user.id;

    if (!level || !student)
      return res
        .status(400)
        .json({ message: "bad request, level or student id missing " });

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
    const { error } = submitExamSchema.validate(req.body);
    if (error)
      return res.status(400).json({ message: error.details[0].message });

    const { answers, attemptId } = req.body;
    const { score, explanation } = await examServices.submitExam(
      answers,
      attemptId,
    );
    res.status(200).json({ score, explanation });
  } catch (err) {
    next(err);
  }
};
