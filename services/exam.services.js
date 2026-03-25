const examQuestions = require("../data/questions.json"); //mock data

exports.getExamQuestions = function (courseCode, level, limit) {
  const processQuestion = examQuestions
    .filter((item) => item.level === level && item.courseCode === courseCode)
    .sort(() => Math.random() - 0.5)
    .slice(0, limit)
    .map((item) => ({
      questionId: item.id,
      questionText: item.questionText,
      options: item.options.map((opt) => {
        return {
          optionsText: opt.text,
          optionsLabel: opt.label,
        };
      }),
    }));
  return processQuestion;
};

exports.submitExam = function (answers) {
  if (!Array.isArray(answers) || answers.length === 0) {
    throw new Error("Invalid answers format");
  }
  /*
frontend sends payload: 
{
  "answers": [
    { "questionId": 5, "selected": "C" },
    { "questionId": 2, "selected": "A" }
  ]
}
*/
  const correct = answers.filter(function (ans) {
    const question = examQuestions.find(function (item) {
      return item.id === ans.questionId;
    });
    return question && question.correctOption === ans.selected;
  });

  const score = (correct.length / answers.length) * 100;

  const explanation = answers.map(function (exp) {
    const question = examQuestions.find(function (item) {
      return item.id === exp.questionId;
    });
    if (!question) {
      return {
        questionId: exp.questionId,
        error: "could not find question in database",
      };
    }
    return {
      courseCode: question.courseCode,
      questionText: question.questionText,
      correctOption: question.correctOption,
      explanation: question.explanation,
      picked: exp.selected,
      isCorrect: question.correctOption === exp.selected,
    };
  });

  return {
    score: score,
    explanation: explanation,
  };
};
