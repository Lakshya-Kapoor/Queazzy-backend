import Joi from "joi";

export const signupSchema = Joi.object({
  user_name: Joi.string().required(),
  phone_no: Joi.number()
    .min(1e9)
    .max(1e10 - 1)
    .required(),
  password: Joi.string().required(),
});

export const loginSchema = Joi.object({
  phone_no: Joi.number()
    .min(1e9)
    .max(1e10 - 1)
    .required(),
  password: Joi.string().required(),
});

export const quizCreateSchema = Joi.object({
  title: Joi.string().required(),
  max_teams: Joi.number().min(2).required(),
  max_members: Joi.number().min(1).required(),
});

export const questionSchema = Joi.object({});
