import { ExtWebSocket } from "../types/cutomTypes";
import jwt from "jsonwebtoken";
import json, { errorMsg } from "../utils/jsonFunctions";
import {
  addNewPlayer,
  findRoom,
  isRoomOwner,
  playerInRoom,
  startQuiz,
} from "../utils/dbFunctions";
import Room from "../models/room";
import {
  sendOwner,
  sendPlayers,
  sendPlayersAndOwner,
} from "../utils/broadCastUtils";
import Quiz from "../models/quiz";

const handleMessage = async (wss: any, ws: ExtWebSocket, message: string) => {
  try {
    const parsedMessage = JSON.parse(message);
    console.log("Received: ", parsedMessage);

    switch (parsedMessage.type) {
      case "temp-init": {
        const { client_id, role, user_name } = parsedMessage;
        ws.client_id = client_id;
        ws.user_name = user_name;
        ws.role = role;
        ws.room_id = null;
        break;
      }
      case "init": {
        handleInit(ws, parsedMessage);
        break;
      }
      case "create-room": {
        handleCreateRoom(wss, ws, parsedMessage);
        break;
      }
      case "join-room": {
        handleJoinRoom(wss, ws, parsedMessage);
        break;
      }
      case "start-quiz": {
        handleStartQuiz(wss, ws);
        break;
      }
      case "question": {
        handleQuestion(wss, ws, parsedMessage);
        break;
      }
      case "answer": {
        handleAnswer(wss, ws, parsedMessage);
        break;
      }
    }
  } catch (err: any) {
    ws.send(json({ error: err.message }));
  }
};

export default handleMessage;

function handleInit(ws: ExtWebSocket, message: any) {
  const { token, role } = message;
  jwt.verify(token, process.env.TOKEN!, (err: any, user: any) => {
    if (err) {
      ws.send(errorMsg("Invalid JWT token"));
    } else {
      ws.client_id = user.id;
      ws.user_name = user.user_name;
      ws.room_id = null;
      ws.role = role;
      ws.send(json({ type: "init-success" }));
    }
  });
}

async function handleCreateRoom(wss: any, ws: ExtWebSocket, message: any) {
  const { room_id }: { room_id: string } = message;

  const isOwner = isRoomOwner(ws.client_id!, room_id);

  // Not quiz owner
  if (!isOwner) {
    ws.send(errorMsg("You can't start the quiz"));
  }
  // Is the quiz owner
  else {
    // Find if room exists
    const room = await findRoom(room_id);
    if (!room) {
      const newRoom = new Room({
        room_id: room_id,
        owner: ws.client_id,
        quiz_status: "published",
      });
      await newRoom.save();
      ws.room_id = room_id;
    }
    // Room already exists
    else {
      ws.room_id = room_id;
      if (room.quiz_status === "started") {
        ws.send(json({ type: "quiz-started" }));
      }
      ws.send(json({ type: "player-data", players: room.players }));
    }
  }
}

async function handleJoinRoom(wss: any, ws: ExtWebSocket, message: any) {
  const { room_id }: { room_id: string } = message;
  const room = await findRoom(room_id);
  // Room doesn't exist
  if (!room) {
    ws.send(errorMsg("Invalid room_id"));
  } else if (room.quiz_status == "published") {
    const newRoom = await addNewPlayer(room_id, ws.client_id!, ws.user_name!);
    ws.room_id = room_id;
    await sendPlayersAndOwner(wss, room_id, {
      type: "player-data",
      players: newRoom.players,
    });
  } else if (room.quiz_status == "started") {
    if (await playerInRoom(room_id, ws.client_id!)) {
      ws.room_id = room_id;
      ws.send(json({ type: "quiz-started" }));
    } else {
      ws.send(errorMsg("Can't join, quiz started"));
    }
  } else {
    ws.send(errorMsg("Can't join, quiz ended"));
  }
}

async function handleStartQuiz(wss: any, ws: ExtWebSocket) {
  await startQuiz(ws.room_id!);

  // Tell players that quiz started
  await sendPlayers(wss, ws.room_id!, { type: "quiz-started" });
  // Tell the owner that quiz started
  ws.send(json({ type: "quiz-started" }));
}

async function handleQuestion(wss: any, ws: ExtWebSocket, message: any) {
  const { question_id, quiz_id }: { question_id: string; quiz_id: string } =
    message;

  const res = await Quiz.findById(quiz_id, { questions: 1 });
  const questionRes = res?.questions.id(question_id);

  const time_limit = Number(questionRes?.time_limit.slice(0, 2));
  const time = Date.now();

  // Add question to room
  const newQuestion = {
    question_id,
    correct: [],
    wrong: [],
    answer_by: time + time_limit,
  };

  await Room.findOneAndUpdate(
    { room_id: ws.room_id! },
    { $push: { questions: newQuestion } }
  );

  if (questionRes?.question_type === "mcq") {
    const { question_type, question, options, correct_option } = questionRes;
    await sendPlayers(wss, ws.room_id!, {
      type: "question",
      question_id,
      question_type,
      question,
      options,
      correct_option,
    });
  } else {
    const { question_type, question, answer } = questionRes!;
    await sendPlayers(wss, ws.room_id!, {
      type: "question",
      question_id,
      question_type,
      question,
      answer,
    });
  }

  ws.send(json({ type: "start-timer", time_limit }));
}

async function handleAnswer(wss: any, ws: ExtWebSocket, message: any) {
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
    }
  } else {
    const { answer }: { answer: string } = message;
    if (answer.toLowerCase() === questionRes?.answer.toLowerCase()) {
      ws.send(json({ type: "correct-answer" }));
    }
  }
}
