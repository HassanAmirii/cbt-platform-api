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
    const { courseCode, limit, weeks } = req.body;
    const level = req.user.level;
    const student = req.user.id;
    const department = req.user.department;
    const semester = req.user.semester;

    if (!level || !student || !department || !semester)
      return res.status(400).json({
        message:
          "bad request, error in req.user importing :level, student, department and semester",
      });

    const examData = await examServices.getExamQuestions(
      department,
      level,
      semester,
      courseCode,
      weeks, // Expects an array: [1, 2]
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
      metadata: examData.metadata,
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

    const student = req.user.id;

    if (!student)
      return res
        .status(400)
        .json({ message: "bad request, student id missing in login payload" });
    const { answers, attemptId } = req.body;
    const { score, explanation } = await examServices.submitExam(
      student,
      answers,
      attemptId,
    );
    res.status(200).json({ score, explanation });
  } catch (err) {
    next(err);
  }
};
