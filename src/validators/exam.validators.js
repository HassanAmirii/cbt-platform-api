const Joi = require("joi");

const startExamSchema = Joi.object({
  courseCode: Joi.string().alphanum().uppercase().required(),
  limit: Joi.number().valid(35, 60, 100).required(),
});

const submitExamSchema = Joi.object({
  attemptId: Joi.string().hex().length(24).required().messages({
    "string.hex": "Invalid attempt ID format",
    "string.length": "Attempt ID must be exactly 24 characters",
  }),

  answers: Joi.array()
    .items(
      Joi.object({
        questionId: Joi.string().hex().length(24).required(),
        selected: Joi.string().required(),
      }),
    )
    .length(Joi.number().valid(35, 60, 100))
    .required(),
});

module.exports = {
  startExamSchema,
  submitExamSchema,
};
