import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  track: { type: String },

  question_type: {
    type: String,
    required: true,
    enum: ["mcq", "fillInTheBlank"],
  },

  time_limit: {
    type: String,
    default: "30s",
    enum: ["20s", "30s", "45s", "1m"],
  },

  points: { type: Number, default: 1 },

  question: { type: String, required: true },

  answer: { type: String, required: true },

  options: [{ text: { type: String, required: true } }],
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },

  max_teams: { type: Number, required: true },

  max_members: { type: Number, required: true },

  questions: [questionSchema],
});

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
