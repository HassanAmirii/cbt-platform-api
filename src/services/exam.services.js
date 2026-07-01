const Question = require("../models/question.model");
const Attempt = require("../models/attempt.model");
const Result = require("../models/result.model");

const examMode = {
  35: 15,
  60: 25,
  100: 35,
};

// to solve timing issue, if client is submitting session at exactly the time it ends & the request couldnt get  to the server immidiately
// such session get flag as expired or submitted, which isnt true- so added 1 min extra time
const extraTime = 1000;

exports.getExamQuestions = async (
  department,
  level,
  semester,
  courseCode,
  weeks, // Expects an array: [1, 2]
  limit,
  student,
) => {
  const duration = examMode[limit];
  if (!duration) {
    const error = new Error("invalid duration: choose 35, 60 or 100 ");
    error.status = 400;
    throw error;
  }

  const examQuestions = await Question.find({
    department,
    level,
    semester,
    courseCode,
    week: { $in: weeks },
  }).lean();

  const selectedQuestions = examQuestions
    .sort(() => Math.random() - 0.5)
    .slice(0, limit);

  const questionsID = selectedQuestions.map((q) => q._id);

  const uniqueTopics = [
    ...new Set(selectedQuestions.map((q) => q.topic).filter(Boolean)),
  ];

  const processQuestion = selectedQuestions.map((item) => ({
    questionId: item._id,
    department: item.department,
    level: item.level,
    semester: item.semester,
    questionText: item.questionText,
    topic: item.topic,
    week: item.week,
    options: item.options.map((opt) => ({
      optionsText: opt.text,
      optionsLabel: opt.label,
    })),
  }));

  const newAttempt = await Attempt.create({
    student,
    questions: questionsID,
    duration,
    courseCode,
    level,
    department,
    semester,
    weeks,
    topics: uniqueTopics,
    expiresAt: Date.now() + extraTime + duration * 60000,
    status: "ongoing",
  });

  return {
    metadata: {
      attemptId: newAttempt._id,
      totalQuestions: processQuestion.length,
      duration: newAttempt.duration,
      expiresAt: newAttempt.expiresAt,
      courseCode: newAttempt.courseCode,
      level: newAttempt.level,
      department: newAttempt.department,
      semester: newAttempt.semester,
      weeks: newAttempt.weeks,
      topics: newAttempt.topics,
    },
    questions: processQuestion,
  };
};

exports.submitExam = async (student, answers, attemptId) => {
  if (!Array.isArray(answers) || answers.length === 0) {
    const error = new Error("invalid answer format");
    error.status = 400;
    throw error;
  }

  const attempt = await Attempt.findById(attemptId).populate("questions");
  if (!attempt) {
    const error = new Error("Attempt not found");
    error.status = 404;
    throw error;
  }

  const isOwner = attempt.student.toString() === student.toString();
  if (!isOwner) {
    const error = new Error("attemptId does not belong to current user");
    error.status = 403;
    throw error;
  }

  if (attempt.status === "submitted") {
    const error = new Error("Attempt already submitted");
    error.status = 410;
    throw error;
  }

  const isNotExpired = Date.now() < attempt.expiresAt;
  if (attempt.status === "expired" || !isNotExpired) {
    if (attempt.status !== "expired") {
      attempt.status = "expired";
      await attempt.save();
    }
    const error = new Error("Quiz session expired");
    error.status = 410;
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

    const picked = ans.selected || null;
    const isCorrect = question.correctOption === picked;
    if (isCorrect) correctCount++;

    const correctOpt = question.options.find(
      (opt) => opt.label === question.correctOption,
    );
    const correctOptionText = correctOpt ? correctOpt.text : null;

    const selectedOpt = question.options.find((opt) => opt.label === picked);
    const selectedOptionText = selectedOpt ? selectedOpt.text : null;

    return {
      questionId: question._id,
      questionText: question.questionText,
      correctOption: question.correctOption,
      correctOptionText,
      selectedOptionText,
      explanation: question.explanation,
      picked,
      isCorrect,
    };
  });

  const score = Math.ceil((correctCount / attemptedQuestions.length) * 100);

  // AI Feedback
  let aiFeedback = null;
  try {
    const Groq = require("groq-sdk");
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

    const weakAreas = computedResults
      .filter((item) => !item.isCorrect)
      .map((item) => item.hint || item.questionText)
      .slice(0, 5);

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      max_tokens: 300,
      messages: [
        {
          role: "user",
          content: `A KWASU student just completed a ${attempt.courseCode} quiz and scored ${score}%.
Weak areas based on wrong answers: ${weakAreas.join(", ") || "none identified"}.
Give short, direct, actionable study advice in 3-4 sentences. No fluff.`,
        },
      ],
    });

    aiFeedback = completion.choices[0].message.content;
  } catch (err) {
    console.error("AI feedback failed:", err.message);
  }

  await Result.create({
    student: attempt.student,
    courseCode: attempt.courseCode,
    level: attempt.level,
    semester: attempt.semester,
    department: attempt.department,
    weeks: attempt.weeks,
    topics: attempt.topics,
    score,
    explanation: computedResults,
    aiFeedback,
  });

  attempt.status = "submitted";
  await attempt.save();

  return { score, explanation: computedResults, aiFeedback };
};
