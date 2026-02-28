import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizeMatchModification } from "../middleware/authorizeMatchModification.js";
import {
  createMatchEvent,
  getMatchEvents,
  getMatchEventById,
  updateMatchEvent,
  deleteMatchEvent,
} from "../controllers/matchEventController.js";

const router = Router();

// Get all events for a match
router.get("/match/:matchId", verifyToken, getMatchEvents);

// Get match event by ID
router.get("/:id", verifyToken, getMatchEventById);

// Create a new match event
router.post("/", verifyToken, createMatchEvent);

// Update existing match event
router.put("/:id", verifyToken, updateMatchEvent);

// Delete match event
router.delete("/:id", verifyToken, deleteMatchEvent);

export default router;