import express from "express";
import { isAuthenticated } from "../utils/middleware";
import catchAsync from "../utils/catchAsync";
import { getRoom } from "../controllers/roomController";
const router = express.Router();

/* Get room */
router.get("/:room_id", isAuthenticated, catchAsync(getRoom));

export default router;
