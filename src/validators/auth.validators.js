const Joi = require("joi");
const Department = require("../config/departments");
const departmentList = Department.map((dept) => dept.code);

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(4).max(30).trim().required(),

  email: Joi.string().trim().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),

  password: Joi.string().required().min(6).messages({
    "string.min": "Password must be at least 6 characters long",
    "any.required": "Password is a required field",
  }),

  department: Joi.string()
    .valid(...departmentList)
    .required()
    .messages({
      "any.only": `department can only be either ${departmentList.join(", ")}`,
      "any.required":
        "department is a required field, please pick one and retry",
    }),

  semester: Joi.number().valid(1, 2).required().messages({
    "any.only": "semester can only be 1 or 2",
    "any.required": "semester is required",
  }),

  level: Joi.string()
    .valid("100", "200", "300", "400", "500")
    .required()
    .messages({
      "any.only": 'level can only be either "100", "200", "300", "400", "500"',
    }),
});

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required().messages({
    "string.email": "Please enter a valid email address",
    "any.required": "Email is required",
  }),
  password: Joi.string().required().min(6).messages({
    "string.min": "Password must be at least 8 characters long",
    "any.required": "Password is a required field",
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
