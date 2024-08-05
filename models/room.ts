import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    player_id: { type: String, required: true },
    player_name: { type: String, required: true },
    player_score: { type: Number, default: 0 },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    question_id: { type: String, required: true },
    correct: [String],
    wrong: [String],
    answer_by: { type: Number, required: true },
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
  questions: [questionSchema],
  quiz_status: {
    type: String,
    required: true,
    enum: ["published", "started", "ended"],
  },
});

const Room = mongoose.model("Room", roomSchema);
export default Room;
