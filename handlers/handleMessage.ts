import { ExtWebSocket } from "../types/cutomTypes";
import json from "../utils/jsonFunctions";
import handleInit from "./handleInit";
import handleCreateRoom from "./handleCreateRoom";
import handleJoinRoom from "./handleJoinRoom";
import handleQuizStart from "./handleQuizStart";
import handleSendQuestion from "./handleSendQuestion";
import handleSendAnswer from "./handleSendAnswer";

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
        handleQuizStart(wss, ws);
        break;
      }
      case "send-question": {
        handleSendQuestion(wss, ws, parsedMessage);
        break;
      }
      case "answer": {
        handleSendAnswer(wss, ws, parsedMessage);
        break;
      }
    }
  } catch (err: any) {
    ws.send(json({ error: err.message }));
  }
};

export default handleMessage;
