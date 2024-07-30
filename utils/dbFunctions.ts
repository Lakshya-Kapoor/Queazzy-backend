import Room from "../models/room";

export async function addNewPlayer(
  room_id: string,
  player_id: string,
  player_name: string
) {
  const newPlayer = { player_id, player_name };

  await Room.findOneAndUpdate(
    { room_id: room_id },
    { $push: { players: newPlayer } }
  );
}

export async function removePlayer(
  room_id: string,
  player_id: string,
  player_name: string
) {
  const player = { player_id, player_name };

  await Room.findOneAndUpdate(
    { room_id: room_id },
    { $pull: { players: player } }
  );
}

export async function playerInRoom(room_id: string, player_id: string) {
  const res = await Room.findOne(
    { "players.player_id": player_id, room_id: room_id },
    { "players.$": 1, _id: 0 }
  );

  return res;
}
