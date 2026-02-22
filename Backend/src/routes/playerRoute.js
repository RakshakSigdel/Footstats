import { Router } from "express";
const router = Router();
// import { verifyToken } from "../middleware/verifyToken";
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizeOwnership } from "../middleware/authorize.js";
import {
  getAllPlayers,
  getPlayerById,
  updatePlayerById,
  deletePlayerById,
  getMyProfile,
  getPlayersByClubId,
} from "../controllers/playerController.js";

//GET api/players/
router.get("/", getAllPlayers);
router.get("/me", verifyToken, getMyProfile);
router.get("/club/:clubId", getPlayersByClubId);
router.get("/:id", verifyToken, getPlayerById);
router.put("/:id", verifyToken, authorizeOwnership, updatePlayerById);
router.delete("/:id", verifyToken, authorizeOwnership, deletePlayerById);

export default router;
