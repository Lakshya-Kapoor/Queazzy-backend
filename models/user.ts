import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  user_name: {
    type: String,
    required: true,
  },
  phone_no: {
    type: Number,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model("User", userSchema);
export default User;
