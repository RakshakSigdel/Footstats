import { Router } from "express";
const router = Router();
import { verifyToken } from "../middleware/verifyToken.js";
import {
  authorizeTournamentOwnership,
  authorizeTournamentAdmin,
  authorizeTournamentRegistrationReview,
} from "../middleware/authorize.js";
import {
  createTournament,
  getAllTournaments,
  updateTournament,
  deleteTournament,
  getTournamentById,
  getMyTournaments,
  getEnrolledTournaments,
  requestTournamentJoin,
  getTournamentRegistrations,
  reviewTournamentRegistration,
  updateTournamentStatus,
} from "../controllers/tournamentController.js";

router.get("/me", verifyToken, getMyTournaments);
router.get("/enrolled/me", verifyToken, getEnrolledTournaments);
router.get("/", getAllTournaments);
router.get("/:id", getTournamentById);
router.post("/", verifyToken, createTournament);
router.post("/:id/join", verifyToken, requestTournamentJoin);
router.get(
  "/:id/registrations",
  verifyToken,
  authorizeTournamentAdmin,
  getTournamentRegistrations,
);
router.patch(
  "/:id/status",
  verifyToken,
  authorizeTournamentAdmin,
  updateTournamentStatus,
);
router.patch(
  "/registrations/:registrationId/review",
  verifyToken,
  authorizeTournamentRegistrationReview,
  reviewTournamentRegistration,
);
router.put("/:id", verifyToken, authorizeTournamentOwnership, updateTournament);
router.delete(
  "/:id",
  verifyToken,
  authorizeTournamentOwnership,
  deleteTournament,
);

export default router;
