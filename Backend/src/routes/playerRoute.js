import { Router } from "express";
const router = Router();
// import { verifyToken } from "../middleware/verifyToken";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizeOwnership } from "../middleware/authorize.js";
import upload from "../middleware/upload.js";
import {
  getAllPlayers,
  getPlayerById,
  updatePlayerById,
  deletePlayerById,
  getMyProfile,
  getPlayersByClubId,
  getMyStats,
  uploadProfilePhoto,
} from "../controllers/playerController.js";

//GET api/players/
router.get("/", getAllPlayers);
router.get("/me", verifyToken, getMyProfile);
router.get("/me/stats", verifyToken, getMyStats);
router.post("/me/upload-photo", verifyToken, upload.single('profilePhoto'), uploadProfilePhoto);
router.get("/club/:clubId", getPlayersByClubId);
router.get("/:id", getPlayerById);
router.put("/:id", verifyToken, authorizeOwnership, updatePlayerById);
router.delete("/:id", verifyToken, authorizeOwnership, deletePlayerById);

export default router;
