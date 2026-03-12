import { Router } from "express";
const router = Router();
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizeClubOwnership, authorizeClubMemberManagement } from "../middleware/authorize.js";
import upload from "../middleware/upload.js";
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
  leaveClub,
  uploadClubLogo,
} from "../controllers/clubController.js";

router.post("/", verifyToken, upload.single('logo'), createClub);
router.get("/me", verifyToken, getMyClubs);
router.get("/admin", verifyToken, getAdminClubs);
router.get("/search", searchClubs);
router.get("/", getAllClubs);
router.get("/:id", getClubById);
router.put("/:id", verifyToken, authorizeClubOwnership, updateClub);
router.post("/:id/upload-logo", verifyToken, authorizeClubOwnership, upload.single('logo'), uploadClubLogo);
router.delete("/:id", verifyToken, authorizeClubOwnership, deleteClub);

// Club members management
router.get("/:id/members", verifyToken, getClubMembers);
router.post("/:id/members", verifyToken, authorizeClubMemberManagement, addClubMember);
router.delete("/:id/members/:userId", verifyToken, authorizeClubMemberManagement, removeClubMember);
router.put("/:id/members/:userId", verifyToken, authorizeClubMemberManagement, updateMemberRole);
router.delete("/:id/leave", verifyToken, leaveClub);

export default router;
