const Joi = require("joi");
let passed = true;
const fileName = process.argv[2];

if (!fileName) {
  console.error("❌ Provide a fileName: node scripts/validateDate.js PHY102");
  process.exit(1);
}

// curently validating compsci / 100 / cos102
const data = require(`../data/COMP_SCI/100/2NDSEM/MTH102/${fileName}.json`);

const optionSchema = Joi.object({
  text: Joi.string().required(),
  label: Joi.string().valid("A", "B", "C", "D").required(),
});

const singleQuestionSchema = Joi.object({
  questionText: Joi.string().lowercase().required(),
  topic: Joi.string().lowercase().required(),
  level: Joi.string().valid("100", "200", "300", "400").required(),
  department: Joi.string().required(),
  week: Joi.number().integer().min(1).max(15).required(),
  semester: Joi.number().valid(1, 2).required(),
  courseCode: Joi.string().uppercase().required(),
  options: Joi.array().items(optionSchema).length(4).required(),
  correctOption: Joi.string().valid("A", "B", "C", "D").required(),
  explanation: Joi.string().required(),
});

// Validates an array of individual flat question documents
const fileSchema = Joi.array().items(singleQuestionSchema).max(100).required();

const { error } = fileSchema.validate(data, { abortEarly: false });

if (error) {
  error.details.forEach((e) => {
    console.log(`total doc: ${data.length}`);
    console.error(`❌ ${e.message}`);
  });
  passed = false;
  console.log(`❌ PASSED: ${passed}`);
  console.log(`total doc: ${data.length}`);
} else {
  console.log("✅ ALL GOOD, READY FOR SEEDING");
  console.log(`✅ PASSED: ${passed}`);
  console.log(`total doc: ${data.length}`);
}
