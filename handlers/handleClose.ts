import { ExtWebSocket } from "../types/cutomTypes";
import Room from "../models/room";
import { removePlayer } from "../utils/dbFunctions";
import { sendPlayersAndOwner } from "../utils/broadCastUtils";

const handleClose = async (wss: any, ws: ExtWebSocket) => {
  if (ws.role === "Player" && ws.room_id) {
    const room = await Room.findOne({ room_id: ws.room_id });

    if (room!.quiz_status === "published") {
      const newRoom = await removePlayer(
        ws.room_id,
        ws.client_id!,
        ws.user_name!
      );

      await sendPlayersAndOwner(wss, ws.room_id, {
        type: "player-data",
        players: newRoom.players,
      });
    }
  }
  console.log("Client has disconnected");
};

export default handleClose;
