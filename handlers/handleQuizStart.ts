import { ExtWebSocket } from "../types/cutomTypes";
import { startQuiz } from "../utils/dbFunctions";
import { sendPlayers } from "../utils/broadCastUtils";
import json from "../utils/jsonFunctions";

export default async function handleQuizStart(wss: any, ws: ExtWebSocket) {
  await startQuiz(ws.room_id!);

  // Tell players that quiz started
  await sendPlayers(wss, ws.room_id!, { type: "quiz-started" });
  // Tell the owner that quiz started
  ws.send(json({ type: "quiz-started" }));
}
