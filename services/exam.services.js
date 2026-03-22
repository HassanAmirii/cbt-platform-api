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
  console.log(processQuestion);
};

exports.submitExam = function (answers) {
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
  return score;
};
