import { NextFunction,Request,Response } from "express";
import Joi from "joi";

import { UserRole } from "../entities";


export const signUpSchema = Joi.object({
    firstName: Joi.string().trim().required().messages({
        "string.empty": "firstName is required",
    }),
    lastName: Joi.string().trim().required().messages({
        "string.empty": "lastName is required",
    }),
    email: Joi.string().email().required().messages({
    "string.email": "Invalid email format",
    "string.empty": "Email is required",
    }),
    password: Joi.string().min(6).required().messages({
        "string.min": "Password must be at least 6 characters",
        "string.empty": "Password is required",
    }),
    location:Joi.string().min(2).optional(),
    role: Joi.string()
        .valid(...Object.values(UserRole))
        .default(UserRole.USER),
    favouriteGenres: Joi.array().items(Joi.string()).optional(),
    favouriteArtists: Joi.array().items(Joi.string().uuid()).optional(),
})

export const validate =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      return res.status(400).json({
        status: "error",
        code: 400,
        message: "Validation error",
        details: error.details.map((err) => err.message),
      });
    }

    next();
  };