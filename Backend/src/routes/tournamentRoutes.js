import { Router } from "express";
const router = Router();
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizeTournamentOwnership } from "../middleware/authorize.js";
import {
  createTournament,
  getAllTournaments,
  updateTournament,
  deleteTournament,
  getTournamentById,
  getMyTournaments,
} from "../controllers/tournamentController.js";

router.get("/me", verifyToken, getMyTournaments);
router.get("/", getAllTournaments);
router.get("/:id", getTournamentById);
router.post("/", verifyToken, createTournament);
router.put("/:id", verifyToken, authorizeTournamentOwnership, updateTournament);
router.delete(
  "/:id",
  verifyToken,
  authorizeTournamentOwnership,
  deleteTournament,
);

export default router;
