import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import Joi from "joi";
import { loginBody, SignupBody } from "./types/cutomTypes";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "./models/user";
import dotenv from "dotenv";
import { customError } from "./utils/errorClass";
import { errorHandler } from "./utils/middleware";
dotenv.config();

/* Express setup */
const app = express();
const PORT = 8080;

/* Mongoose setup */
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Queazzy");
}

main()
  .then(() => {
    console.log("Connection successful");
  })
  .catch((err) => console.log(err));

/* Middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.post("/signup", async (req, res, next) => {
  try {
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
  } catch (err) {
    next(err);
  }
});

app.post("/login", async (req, res, next) => {
  try {
    const { phone_no, password }: loginBody = req.body;

    const user = await User.findOne({ phone_no });
    if (!user) {
      throw new customError(400, "User doesn't exist");
    }
    if (!(await bcrypt.compare(password, user.password))) {
      throw new customError(401, "Incorrect password");
    }

    const jwtPayload = {
      name: user.user_name,
      phone_no,
    };

    const token = jwt.sign(jwtPayload, process.env.TOKEN!);
    res.json({ token });
  } catch (err) {
    next(err);
  }
});

/* Error handling middleware */
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Sever is listening on port: ${PORT}`);
});
