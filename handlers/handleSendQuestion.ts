import Quiz from "../models/quiz";
import Room from "../models/room";
import { ExtWebSocket } from "../types/cutomTypes";
import json from "../utils/jsonFunctions";
import { sendPlayers } from "../utils/broadCastUtils";

export default async function handleSendQuestion(
  wss: any,
  ws: ExtWebSocket,
  message: any
) {
  const { question_id, quiz_id }: { question_id: string; quiz_id: string } =
    message;

  const res = await Quiz.findById(quiz_id, { questions: 1 });
  const questionRes = res?.questions.id(question_id);

  const time_limit = Number(questionRes?.time_limit.slice(0, 2));
  const answer_by = Date.now() + time_limit * 1000;

  // Add question to room
  const newQuestion = {
    question_id,
    correct: [],
    wrong: [],
    answer_by,
  };

  await Room.findOneAndUpdate(
    { room_id: ws.room_id! },
    { $push: { questions: newQuestion } }
  );

  if (questionRes?.question_type === "mcq") {
    const { question_type, question, options } = questionRes;
    await sendPlayers(wss, ws.room_id!, {
      type: "new-question",
      question_id,
      question_type,
      question,
      options,
      answer_by,
    });
  } else {
    const { question_type, question } = questionRes!;
    await sendPlayers(wss, ws.room_id!, {
      type: "new-question",
      question_id,
      question_type,
      question,
      answer_by,
    });
  }

  ws.send(json({ type: "start-timer", time_limit }));
}
