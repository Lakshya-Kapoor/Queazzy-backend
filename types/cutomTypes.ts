import WebSocket from "ws";

export interface loginBody {
  phone_no: number;
  password: string;
}

export interface SignupBody extends loginBody {
  user_name: string;
}

export interface ExtWebSocket extends WebSocket {
  client_id: string | null;
  user_name: string | null;
  room_id: string | null;
  role: "Player" | "Owner" | null;
}

export type room = {
  owner: string | null;
  players: string[];
  started: boolean;
};
