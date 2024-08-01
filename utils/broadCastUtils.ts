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
    sendClient(wss, player.player_id, { type: "quiz-started" });
  });
}

function sendClient(wss: any, client_id: string, message: Object) {
  wss.clients.forEach((client: ExtWebSocket) => {
    if (
      client.readyState === WebSocket.OPEN &&
      client.client_id === client_id
    ) {
      client.send(json(message));
    }
  });
}

export async function sendPlayers(wss: any, room_id: string, message: Object) {
  const room = await Room.findOne({ room_id: room_id });

  const { players } = room!;

  players.forEach((player) => {
    sendClient(wss, player.player_id, message);
  });
}

export async function sendOwner(wss: any, room_id: string, message: Object) {
  const room = await Room.findOne({ room_id: room_id });

  const { owner } = room!;
  sendClient(wss, owner!, message);
}

export async function sendPlayersAndOwner(
  wss: any,
  room_id: string,
  message: Object
) {
  const room = await Room.findOne({ room_id: room_id });

  const { owner, players } = room!;

  sendClient(wss, owner!, message);

  players.forEach((player) => {
    sendClient(wss, player.player_id, message);
  });
}
