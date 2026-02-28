import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createBulkLineup,
  addPlayerToLineup,
  getMatchLineups,
  getLineupById,
  updateLineup,
  removeFromLineup,
} from "../controllers/matchLineupController.js";

const router = Router();

// Get all lineups for a match
router.get("/match/:matchId", verifyToken, getMatchLineups);

// Get lineup entry by ID
router.get("/:id", verifyToken, getLineupById);

// Create bulk lineup (multiple players at once)
router.post("/bulk", verifyToken, createBulkLineup);

// Add single player to lineup
router.post("/", verifyToken, addPlayerToLineup);

// Update lineup entry
router.put("/:id", verifyToken, updateLineup);

// Remove player from lineup
router.delete("/:id", verifyToken, removeFromLineup);

export default router;