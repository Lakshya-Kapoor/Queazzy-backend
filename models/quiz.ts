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
    enum: ["10s", "20s", "30s", "45s", "60s"],
  },

  points: { type: Number, default: 1 },

  question: { type: String, required: true },

  answer: { type: String, default: "" },

  correct_option: { type: Number, default: -1 },

  options: { type: [String], default: ["", ""] },
});

const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },

  max_teams: { type: Number, required: true },

  max_members: { type: Number, required: true },

  created_at: { type: Date, default: Date.now },

  questions: [questionSchema],
});

const Quiz = mongoose.model("Quiz", quizSchema);
export default Quiz;
