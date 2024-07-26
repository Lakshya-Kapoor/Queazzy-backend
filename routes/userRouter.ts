import express from "express";
const router = express.Router();
import catchAsync from "../utils/catchAsync";
import { logInUser, signUpUser } from "../controllers/userController";
import { reqBodyValidation } from "../utils/middleware";
import { loginSchema, signupSchema } from "../utils/requestSchemas";

router.post("/signup", reqBodyValidation(signupSchema), catchAsync(signUpUser));

router.post("/login", reqBodyValidation(loginSchema), catchAsync(logInUser));

export default router;
