const Joi = require("joi");
let passed = true;
const fileName = process.argv[2];
if (!fileName) {
  console.error("❌ Provide a fileName: node scripts/validateDate.js PHY102");
  process.exit(1);
}
const data = require(`../data/COMP_SCI/100/2NDSEM/${fileName}.json`);
const optionSchema = Joi.object({
  text: Joi.string().required(),
  label: Joi.string().required(),
});
const questionSchema = Joi.object({
  questionText: Joi.string().required(),
  options: Joi.array().items(optionSchema).length(4).required(),
  correctOption: Joi.string().valid("A", "B", "C", "D"),
  explanation: Joi.string().required(),
});

const weekSchema = Joi.object({
  semester: Joi.number().valid(1, 2).required(),
  week: Joi.number().min(1).max(15).required(),
  topic: Joi.string().required(),
  questions: Joi.array().items(questionSchema).length(100).required(),
});

const fileSchema = Joi.object({
  courseCode: Joi.string().required(),
  department: Joi.string().required(),
  level: Joi.string().valid("100").required(),
  weeks: Joi.object().pattern(Joi.string(), weekSchema).required(),
});

const { error } = fileSchema.validate(data, { abortEarly: false });
if (error) {
  error.details.forEach((e) => {
    console.error(`❌ ${e.message}`);
    passed = false;
    console.log(`❌ PASSED: ${passed}`);
  });
} else {
  console.log("✅ ALL GOOD, READY FOR SEEDING");
  console.log(`✅ PASSED: ${passed}`);
}
