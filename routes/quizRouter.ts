import express from "express";
const router = express.Router();
import {
  isAuthenticated,
  isQuizCreator,
  questionExistsInQuiz,
  reqBodyValidation,
} from "../utils/middleware";
import catchAsync from "../utils/catchAsync";
import {
  addQuestion,
  createQuiz,
  deleteQuestion,
  deleteQuiz,
  editQuestion,
  getQuiz,
  getQuizzes,
} from "../controllers/quizController";
import { quizCreateSchema } from "../utils/requestSchemas";

/* Create quiz */
router.post(
  "/",
  isAuthenticated,
  reqBodyValidation(quizCreateSchema),
  catchAsync(createQuiz)
);

/* Get all quizzes of user */
router.get("/", isAuthenticated, catchAsync(getQuizzes));

/* Get quiz */
router.get(
  "/:quiz_id",
  isAuthenticated,
  // catchAsync(isQuizCreator),
  catchAsync(getQuiz)
);

/* Deleting a quiz */
router.delete(
  "/:quiz_id",
  isAuthenticated,
  catchAsync(isQuizCreator),
  catchAsync(deleteQuiz)
);

/* Adding questions to quiz */
router.patch(
  "/:quiz_id",
  isAuthenticated,
  catchAsync(isQuizCreator),
  catchAsync(addQuestion)
);

/* Editing quiz questions */
router.patch(
  "/:quiz_id/question/:question_id",
  isAuthenticated,
  catchAsync(isQuizCreator),
  catchAsync(questionExistsInQuiz),
  catchAsync(editQuestion)
);

/* Deleting questions */
router.delete(
  "/:quiz_id/question/:question_id",
  isAuthenticated,
  catchAsync(isQuizCreator),
  catchAsync(questionExistsInQuiz),
  catchAsync(deleteQuestion)
);

export default router;
