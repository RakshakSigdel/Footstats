import { Router } from "express";
const router = Router();
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizeClubOwnership, authorizeClubMemberManagement } from "../middleware/authorize.js";
import {
  createClub,
  getMyClubs,
  getAllClubs,
  getClubById,
  updateClub,
  deleteClub,
  getClubMembers,
  addClubMember,
  removeClubMember,
  updateMemberRole,
  getAdminClubs,
  searchClubs,
} from "../controllers/clubController.js";

router.post("/", verifyToken, createClub);
router.get("/me", verifyToken, getMyClubs);
router.get("/admin", verifyToken, getAdminClubs);
router.get("/search", searchClubs);
router.get("/", getAllClubs);
router.get("/:id", getClubById);
router.put("/:id", verifyToken, authorizeClubOwnership, updateClub);
router.delete("/:id", verifyToken, authorizeClubOwnership, deleteClub);

// Club members management
router.get("/:id/members", verifyToken, getClubMembers);
router.post("/:id/members", verifyToken, authorizeClubMemberManagement, addClubMember);
router.delete("/:id/members/:userId", verifyToken, authorizeClubMemberManagement, removeClubMember);
router.put("/:id/members/:userId", verifyToken, authorizeClubMemberManagement, updateMemberRole);

export default router;
