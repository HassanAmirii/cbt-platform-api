//import data/question.json
//get 10 question base on selected ( unislug, deptslug, level, courcode)
//export a list of correct answers labels for questions to services dir

const level = "100";
const courseCode = "cos101";
const questionCount = 5;
if (level && courseCode && questionCount) {
  try {
    const getQuestions = require("../data/questions.json");
    const questions = getQuestions;
    console.log(questions);
    throw new Error("something broke");
  } catch (error) {
    console.error(error.message);
  }
}
