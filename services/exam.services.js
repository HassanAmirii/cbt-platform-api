const { options } = require("../app");
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

// exports.submitExam = function () {
//   /*

// list of selected options.labels
// list of correct labels

// filter the right to wrong , get the length ,
// return total length of correct/ total length of option x 100

// */
// };
