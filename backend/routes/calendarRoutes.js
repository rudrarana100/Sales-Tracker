import express from "express";
import { createMeeting } from "../controllers/calendarController.js";

const router = express.Router();

router.post("/create", createMeeting);

export default router;