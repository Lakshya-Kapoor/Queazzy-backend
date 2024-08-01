import { Request, Response } from "express";
import Room from "../models/room";

export const getRoom = async (req: Request, res: Response) => {
  const { room_id } = req.params;

  const room = await Room.findOne({ room_id: room_id });

  res.json(room);
};
