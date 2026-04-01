const Joi = require("joi");

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
  level: Joi.string().valid("100", "200", "300", "400").required().messages({
    "any.only": 'level can only be either "100", "200", "300", "400"',
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
