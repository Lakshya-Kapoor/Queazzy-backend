import { ExtWebSocket } from "../types/cutomTypes";
import Room from "../models/room";
import { removePlayer } from "../utils/dbFunctions";
import { broadcastRoom } from "../utils/broadCastUtils";

const handleClose = async (wss: any, ws: ExtWebSocket) => {
  if (ws.role === "Player" && ws.room_id) {
    const room = await Room.findOne({ room_id: ws.room_id });

    if (room!.quiz_status === "published") {
      await removePlayer(ws.room_id, ws.client_id!, ws.user_name!);

      broadcastRoom(wss, ws.room_id);
    }
  }
  console.log("Client has disconnected");
};

export default handleClose;
