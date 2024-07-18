import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { errorHandler } from "./utils/middleware";
import quizRouter from "./routes/quizRouter";
import userRouter from "./routes/userRouter";

dotenv.config();

/* Express setup */
const app = express();
const PORT = 8080;

/* Mongoose setup */
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Queazzy");
}

main()
  .then(() => {
    console.log("Connection successful");
  })
  .catch((err) => console.log(err));

/* Middlewares */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/user", userRouter);
app.use("/quiz", quizRouter);

/* Error handling middleware */
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Sever is listening on port: ${PORT}`);
});
