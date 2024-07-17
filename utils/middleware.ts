import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { customError } from "./errorClass";

dotenv.config();

export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    next(new Error("Authorization header missing"));
  } else {
    jwt.verify(token, process.env.TOKEN!, (err, user) => {
      if (err) {
        next(new Error("Invalid JWT token"));
      } else {
        req.user = user;
        next();
      }
    });
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
