import { Router } from "express";
const router = Router();
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizeClubOwnership } from "../middleware/authorize.js";
import {
  createClub,
  getMyClubs,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub,
} from "../controllers/clubController.js";

router.post("/", verifyToken, createClub);
router.get("/me", verifyToken, getMyClubs);
router.get("/", getAllClubs);
router.get("/:id", getClubById);
router.put("/:id", verifyToken, authorizeClubOwnership, updateClub);
router.delete("/:id", verifyToken, authorizeClubOwnership, deleteClub);

export default router;
