import { ExtWebSocket } from "../types/cutomTypes";
import json, { errorMsg } from "../utils/jsonFunctions";
import { findRoom, addNewPlayer, playerInRoom } from "../utils/dbFunctions";
import { sendPlayersAndOwner } from "../utils/broadCastUtils";

export default async function handleJoinRoom(
  wss: any,
  ws: ExtWebSocket,
  message: any
) {
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
