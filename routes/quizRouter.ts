import express from "express";
const router = express.Router();
import { isAuthenticated, isQuizCreator } from "../utils/middleware";
import catchAsync from "../utils/catchAsync";
import {
  addQuestion,
  createQuiz,
  deleteQuiz,
  getQuizzes,
} from "../controllers/quizController";

/* Create quiz */
router.post("/", isAuthenticated, catchAsync(createQuiz));

/* Get all quizzes of user */
router.get("/", isAuthenticated, catchAsync(getQuizzes));

/* Adding questions to quiz */
router.patch(
  "/:quiz_id",
  isAuthenticated,
  isQuizCreator,
  catchAsync(addQuestion)
);

/* Deleting a quiz */
router.delete(
  "/:quiz_id",
  isAuthenticated,
  isQuizCreator,
  catchAsync(deleteQuiz)
);

export default router;
