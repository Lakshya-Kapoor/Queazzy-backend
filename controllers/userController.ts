import { Request, Response } from "express";
import User from "../models/user";
import bcrypt from "bcrypt";
import { SignupBody, loginBody } from "../types/cutomTypes";
import jwt from "jsonwebtoken";
import { customError } from "../utils/errorClass";

export const signUpUser = async (req: Request, res: Response) => {
  const { user_name, phone_no, password }: SignupBody = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  const samePhoneNoExists = await User.findOne({ phone_no });
  if (samePhoneNoExists) {
    throw new customError(400, "Phone number already exists");
  }

  const newUser = new User({
    user_name,
    phone_no,
    password: hashedPassword,
  });

  await newUser.save();

  res.json({ success: "New user created successfully" });
};

export const logInUser = async (req: Request, res: Response) => {
  const { phone_no, password }: loginBody = req.body;

  const user = await User.findOne({ phone_no });
  if (!user) {
    throw new customError(400, "User doesn't exist");
  }
  if (!(await bcrypt.compare(password, user.password))) {
    throw new customError(401, "Incorrect password");
  }

  const jwtPayload = {
    id: user.id,
    user_name: user.user_name,
    phone_no,
  };

  const token = jwt.sign(jwtPayload, process.env.TOKEN!);
  res.json({ token });
};
