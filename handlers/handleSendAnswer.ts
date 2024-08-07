import { ExtWebSocket } from "../types/cutomTypes";
import json, { errorMsg } from "../utils/jsonFunctions";
import Room from "../models/room";
import Quiz from "../models/quiz";

export default async function handleSendAnswer(
  wss: any,
  ws: ExtWebSocket,
  message: any
) {
  const { question_id, quiz_id }: { question_id: string; quiz_id: string } =
    message;

  const submissionTime = Date.now();

  const room = await Room.findOne({ room_id: ws.room_id! });
  const roomQuestions = room!.questions;
  // No questions have been asked yet
  if (roomQuestions.length == 0) {
    ws.send(errorMsg("No questions asked yet"));
    return;
  }
  const latestQuestion = roomQuestions[roomQuestions.length - 1];

  // Some other question has been asked
  if (latestQuestion.question_id !== question_id) {
    ws.send(errorMsg("Answer the current question"));
    return;
  }
  // Time to answer question is up
  if (latestQuestion.answer_by < submissionTime) {
    ws.send(errorMsg("Time's up unfortunately"));
    return;
  }

  // Verifying correctness of answer
  const res = await Quiz.findById(quiz_id, { questions: 1 });
  const questionRes = res?.questions.id(question_id);

  if (questionRes?.question_type === "mcq") {
    const { correct_option }: { correct_option: number } = message;
    if (correct_option === questionRes.correct_option) {
      ws.send(json({ type: "correct-answer" }));
      // Update the leaderboard for players and owner
      // Send analytics to the owner
    } else {
      ws.send(errorMsg("Incorrect answer"));
    }
  } else {
    const { answer }: { answer: string } = message;
    if (answer.toLowerCase() === questionRes?.answer.toLowerCase()) {
      ws.send(json({ type: "correct-answer" }));
      // Update the leaderboard for players and owner
      // Send analytics to the owner
    } else {
      ws.send(errorMsg("Incorrect answer"));
    }
  }
}
