import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { customError } from "./errorClass";
import User from "../models/user";

dotenv.config();

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next(new customError(401, "Authorization header missing"));
  } else {
    jwt.verify(token, process.env.TOKEN!, (err, user) => {
      if (err) {
        next(new customError(403, "Invalid JWT token"));
      } else {
        req.user = user;
        next();
      }
    });
  }
};

export const isQuizCreator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user_id = req.user.id;
    const { quiz_id } = req.params;

    const result = await User.find({
      _id: user_id,
      created_quizzes: { $in: [quiz_id] },
    });

    if (result.length == 0) {
      throw new customError(
        401,
        "You don't have authorization to change this quiz"
      );
    }

    next();
  } catch (err) {
    next(err);
  }
};

export const errorHandler = (
  err: customError | Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof customError) {
    const { status, errorMsg } = err;
    res.status(status).json({ error: errorMsg });
  } else {
    console.log(err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
