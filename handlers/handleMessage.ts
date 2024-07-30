import { ExtWebSocket } from "../types/cutomTypes";
import jwt from "jsonwebtoken";
import json, { errorMsg } from "../utils/jsonFunctions";
import { addNewPlayer, playerInRoom } from "../utils/dbFunctions";
import Room from "../models/room";
import User from "../models/user";
import { broadcastRoom } from "../utils/broadCastUtils";

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
        const { token, role } = parsedMessage;
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
        break;
      }
      case "create-room": {
        const { room_id }: { room_id: string } = parsedMessage;
        // Check if client is quiz owner
        const isOwner = await User.find({
          _id: ws.client_id,
          created_quizzes: { $in: [room_id] },
        });
        // Find if room exists
        const room = await Room.find({ room_id: room_id });

        // Not quiz owner
        if (isOwner.length == 0) {
          ws.send(errorMsg("You can't start the quiz"));
        }
        // Room doesn't exist
        else if (room.length == 0) {
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
          broadcastRoom(wss, room_id);
        }
        break;
      }
      case "join-room": {
        const { room_id }: { room_id: string } = parsedMessage;
        // Find if room exists
        const room = await Room.findOne({ room_id: room_id });
        // Room doesn't exist
        if (!room) {
          ws.send(errorMsg("Invalid room_id"));
        } else if (room.quiz_status == "published") {
          await addNewPlayer(room_id, ws.client_id!, ws.user_name!);
          ws.room_id = room_id;
          await broadcastRoom(wss, room_id);
        } else if (room.quiz_status == "started") {
          if (await playerInRoom(room_id, ws.client_id!)) {
            ws.room_id = room_id;
          } else {
            ws.send(errorMsg("Can't join, quiz started"));
          }
        } else {
          ws.send(errorMsg("Can't join, quiz ended"));
        }
        break;
      }
    }
  } catch (err: any) {
    ws.send(json({ error: err.message }));
  }
};

export default handleMessage;
