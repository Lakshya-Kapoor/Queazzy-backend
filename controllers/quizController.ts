import { Request, Response } from "express";
import User from "../models/user";
import Quiz from "../models/quiz";
import { customError } from "../utils/errorClass";

export const createQuiz = async (req: Request, res: Response) => {
  const { title, max_members, max_teams } = req.body;

  // Create new quiz
  const newQuiz = new Quiz({ title, max_members, max_teams });
  const savedQuiz = await newQuiz.save();

  // Add new quiz to quiz list of user
  await User.findByIdAndUpdate(req.user.id, {
    $push: { created_quizzes: savedQuiz.id },
  });

  res.json({
    success: "New quiz created successfully",
    quizId: savedQuiz.id,
  });
};

export const getQuizzes = async (req: Request, res: Response) => {
  const user_id = req.user.id;

  const quiz_ids = await User.findById(user_id, {
    created_quizzes: 1,
    _id: 0,
  });

  let quizzes: any[] = [];
  for (let quiz_id of quiz_ids!.created_quizzes) {
    const { title, _id, max_members, max_teams, questions, created_at }: any =
      await Quiz.findById(quiz_id);
    quizzes.push({
      _id,
      title,
      max_members,
      max_teams,
      created_at,
      questions: questions.length,
    });
  }
  res.json(quizzes);
};

export const getQuiz = async (req: Request, res: Response) => {
  const { quiz_id } = req.params;

  const quiz = await Quiz.findById(quiz_id);

  if (!quiz) {
    throw new customError(404, "Quiz doesn't exist");
  }

  res.json(quiz);
};

export const deleteQuiz = async (req: Request, res: Response) => {
  const { quiz_id } = req.params;
  const user_id = req.user.id;

  /* Removing reference to the quiz from user data */
  await User.findByIdAndUpdate(user_id, {
    $pull: { created_quizzes: quiz_id },
  });

  /* Deleting the quiz */
  await Quiz.findByIdAndDelete(quiz_id);

  res.json({ success: `Deleted quiz with id: ${quiz_id}` });
};

export const addQuestion = async (req: Request, res: Response) => {
  const { quiz_id } = req.params;
  const { question } = req.body;

  const questionToAdd = { ...question };

  await Quiz.findByIdAndUpdate(quiz_id, {
    $push: { questions: questionToAdd },
  });

  res.json({ success: "Added question" });
};

export const deleteQuestion = async (req: Request, res: Response) => {
  const { quiz_id, question_id } = req.params;

  await Quiz.findByIdAndUpdate(quiz_id, {
    $pull: { questions: { _id: question_id } },
  });

  res.json({ success: "Deleted question" });
};

export const editQuestion = async (req: Request, res: Response) => {
  const { quiz_id, question_id } = req.params;
  const { question } = req.body;

  console.log(question);

  const quiz = await Quiz.findById(quiz_id);
  const questionData = quiz?.questions.id(question_id);
  Object.assign(questionData!, { ...question });
  await quiz?.save();

  res.json({ success: "Edited question" });
};
