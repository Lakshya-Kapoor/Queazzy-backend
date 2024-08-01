import Room from "../models/room";
import User from "../models/user";

export async function addNewPlayer(
  room_id: string,
  player_id: string,
  player_name: string
) {
  const newPlayer = { player_id, player_name };

  const res = await Room.findOneAndUpdate(
    { room_id: room_id },
    { $push: { players: newPlayer } },
    { new: true }
  );

  return res!;
}

export async function removePlayer(
  room_id: string,
  player_id: string,
  player_name: string
) {
  const player = { player_id, player_name };

  const res = await Room.findOneAndUpdate(
    { room_id: room_id },
    { $pull: { players: player } },
    { new: true }
  );
  return res!;
}

export async function playerInRoom(room_id: string, player_id: string) {
  const res = await Room.findOne(
    { "players.player_id": player_id, room_id: room_id },
    { "players.$": 1, _id: 0 }
  );

  return res;
}

export async function findRoom(room_id: string) {
  return await Room.findOne({ room_id: room_id });
}

export async function isRoomOwner(client_id: string, room_id: string) {
  return await User.findOne({
    _id: client_id,
    created_quizzes: { $in: [room_id] },
  });
}

export async function startQuiz(room_id: string) {
  await Room.findOneAndUpdate({ room_id: room_id }, { quiz_status: "started" });
}
