import json, { errorMsg } from "../utils/jsonFunctions";
import { ExtWebSocket } from "../types/cutomTypes";
import jwt from "jsonwebtoken";

export default function handleInit(ws: ExtWebSocket, message: any) {
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
