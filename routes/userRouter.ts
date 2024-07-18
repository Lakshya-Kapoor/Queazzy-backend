import express from "express";
const router = express.Router();
import catchAsync from "../utils/catchAsync";
import { logInUser, signUpUser } from "../controllers/userController";

router.post("/signup", catchAsync(signUpUser));

router.post("/login", catchAsync(logInUser));

export default router;
