const Question = require("../models/question.model");
const Attempt = require("../models/attempt.model");
const Result = require("../models/result.model");

const examMode = {
  35: 15, // 35 questions for 15 mins
  60: 25, // 60 questions for 25 mins
  100: 35, // 100 questions for 35 mins
};

exports.getExamQuestions = async (courseCode, level, limit, student) => {
  const duration = examMode[limit];
  if (!duration) {
    const error = new Error("invalid duration: choose 35, 60 or 100 ");
    error.status = 400;
    throw error;
  }
  const examQuestions = await Question.find({ courseCode, level }).lean();

  const selectedQuestions = examQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);

  const questionsID = selectedQuestions.map((q) => q._id);

  const processQuestion = selectedQuestions.map((item) => ({
    questionId: item._id,
    questionText: item.questionText,
    options: item.options.map((opt) => {
      return {
        optionsText: opt.text,
        optionsLabel: opt.label,
      };
    }),
  }));
  const newAttempt = await Attempt.create({
    student,
    questions: questionsID,
    duration: duration,
    courseCode,
    level,
    expiresAt: Date.now() + duration * 60000,
    status: "ongoing",
  });

  return {
    questions: processQuestion,
    AttemptId: newAttempt._id,
  };
};

/*
frontend sends payload: 
{
  "answers": [
    { "questionId": 5, "selected": "C" },
    { "questionId": 2, "selected": "A" }
  ]
}
*/

exports.submitExam = async (student, answers, attemptId) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error("invalid answer format ");
  }

  const attempt = await Attempt.findById(attemptId).populate("questions");
  if (!attempt) {
    throw new Error(" Attempt not found");
  }
  const isOwner = attempt.student.toString() === student.toString();
  if (!isOwner) {
    const error = new Error("attemptId does not belong to current user");
    error.statusCode = 403;
    throw error;
  }
  const isActive = attempt.status === "ongoing";
  const isNotExpired = Date.now() < attempt.expiresAt;

  if (!isActive) {
    const error = new Error("Attempt already submitted");
    error.statusCode = 410;
    throw error;
  }

  if (!isNotExpired) {
    const error = new Error("Session expired");
    error.statusCode = 410;
    throw error;
  }

  const attemptedQuestions = attempt.questions;

  let correctCount = 0;
  const computedResults = answers.map((ans) => {
    const question = attemptedQuestions.find(
      (item) => item._id.toString() === ans.questionId.toString(),
    );

    if (!question) {
      return {
        questionId: ans.questionId,
        error: "Question not found in this attempt",
      };
    }

    const isCorrect = question.correctOption === ans.selected;
    if (isCorrect) correctCount++;

    const correctOpt = question.options.find(
      (opt) => opt.label === question.correctOption,
    );

    const correctOptionText = correctOpt ? correctOpt.text : null;

    const selectedOpt = question.options.find(
      (opt) => opt.label === ans.selected,
    );
    const selectedOptionText = selectedOpt ? selectedOpt.text : null;
    return {
      questionId: question._id,
      questionText: question.questionText,
      correctOption: question.correctOption,
      correctOptionText,
      selectedOptionText,
      explanation: question.explanation,
      picked: ans.selected,
      isCorrect: isCorrect,
    };
  });
  const score = Math.round((correctCount / attemptedQuestions.length) * 100);
  await Result.create({
    student: attempt.student,
    courseCode: attempt.courseCode,
    level: attempt.level,
    score,
    explanation: computedResults,
  });

  attempt.status = "submitted";
  await attempt.save();

  return { score, explanation: computedResults };
};
