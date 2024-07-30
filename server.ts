import express from "express";
import { createServer } from "http";
import WebSocket from "ws";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { errorHandler } from "./utils/middleware";
import quizRouter from "./routes/quizRouter";
import userRouter from "./routes/userRouter";
import cors from "cors";
import handleClose from "./handlers/handleClose";
import handleMessage from "./handlers/handleMessage";
import { ExtWebSocket } from "./types/cutomTypes";

dotenv.config();

/* http and ws setup */
const app = express();
const server = createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 8080;

/* Mongoose setup */
async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/Queazzy");
}

main()
  .then(() => {
    console.log("Connected to db");
  })
  .catch((err) => console.log(err));

/* Middlewares */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/user", userRouter);
app.use("/quiz", quizRouter);

/* Error handling middleware */
app.use(errorHandler);

server.listen(PORT, () => {
  console.log(`Http server is listening on port: ${PORT}`);
});

wss.on("connection", (ws: ExtWebSocket) => {
  console.log("Client has connected");
  ws.on("message", (message: string) => handleMessage(wss, ws, message));
  ws.on("error", (err) => console.log(err.message));
  ws.on("close", () => handleClose(wss, ws));
});
wss.on("error", (err) => console.log(err.message));
wss.on("listening", () =>
  console.log(`Ws server is listening on PORT: ${PORT}`)
);
