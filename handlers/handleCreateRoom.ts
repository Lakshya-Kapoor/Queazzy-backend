import json, { errorMsg } from "../utils/jsonFunctions";
import { ExtWebSocket } from "../types/cutomTypes";
import { isRoomOwner, findRoom } from "../utils/dbFunctions";
import Room from "../models/room";

export default async function handleCreateRoom(
  wss: any,
  ws: ExtWebSocket,
  message: any
) {
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
