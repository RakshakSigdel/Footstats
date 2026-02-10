import { Router } from "express";
const router = Router();
import { verifyToken } from "../middleware/verifyToken";
import { authorizeClubOwnership } from "../middleware/authorize";
import { createClub, getMyClubs, getAllClubs, getClubById, updateClub, deleteClub } from "../controllers/clubController";

router.post("/", verifyToken, createClub);
router.get("/me", verifyToken, getMyClubs);
router.get("/", getAllClubs);
router.get("/:id", verifyToken, getClubById);
router.put("/:id", verifyToken, authorizeClubOwnership, updateClub);
router.delete("/:id", verifyToken, authorizeClubOwnership, deleteClub);

export default router;