import  express  from "express";
import {
  getAllMatches,
  getMatchByScheduleId,
  createMatch,
  updateMatch,
  deleteMatch,
} from "../controllers/matchController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizeMatchModification } from "../middleware/authorizeMatchModification.js";
const router = express.Router();

// Get All Matches
router.get("/", verifyToken, getAllMatches);
// Get match by schedule
router.get("/:scheduleID", verifyToken, getMatchByScheduleId);
// create match
router.post("/", verifyToken, createMatch);
// update match
router.put("/:matchId", verifyToken, authorizeMatchModification, updateMatch);
// delete match
router.delete(
  "/:matchId",
  verifyToken,
  authorizeMatchModification,
  deleteMatch,
);

export default router;
