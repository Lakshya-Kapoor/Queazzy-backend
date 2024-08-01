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
import User from "../models/user";
import {
  broadCastQuizStarted,
  broadcastRoom,
  sendPlayers,
  sendPlayersAndOwner,
} from "../utils/broadCastUtils";

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
