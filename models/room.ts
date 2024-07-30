import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    player_id: { type: String, required: true },
    player_name: { type: String, required: true },
  },
  { _id: false }
);

const roomSchema = new mongoose.Schema({
  room_id: {
    type: String,
    required: true,
  },
  owner: String,
  players: [playerSchema],
  quiz_status: {
    type: String,
    required: true,
    enum: ["published", "started", "ended"],
  },
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
