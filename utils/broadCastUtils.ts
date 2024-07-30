import Room from "../models/room";
import { ExtWebSocket } from "../types/cutomTypes";
import json from "./jsonFunctions";
import WebSocket from "ws";

export async function broadcastRoom(wss: any, room_id: string) {
  const room = await Room.findOne({ room_id: room_id });

  const { owner, players } = room!;

  wss.clients.forEach((client: ExtWebSocket) => {
    if (client.readyState === WebSocket.OPEN && client.client_id === owner) {
      client.send(json({ type: "player-data", players }));
    }
  });
}

export async function broadCastQuizStarted(wss: any, room_id: string) {
  const room = await Room.findOne({ room_id: room_id });

  const { players } = room!;

  players.forEach((player) => {
    wss.clients.forEach((client: ExtWebSocket) => {
      if (
        client.readyState === WebSocket.OPEN &&
        client.client_id === player.player_id
      ) {
        client.send(json({ type: "quiz-started" }));
      }
    });
  });
}
