// scheduleRoutes.js
import { Router } from "express";
import {
  createSchedule,
  getAllSchedules,
  getScheduleById,
  getMySchedules,
  getClubSchedules,
  getTournamentSchedules,
  updateSchedule,
  deleteSchedule,
} from "../controllers/scheduleController.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { 
  authorizeScheduleModification,
  authorizeScheduleCreation 
} from "../middleware/authorize.js";

const router = Router();

// Public/Member routes (no special authorization needed)
router.get("/me", verifyToken, getMySchedules);
router.get("/club/:id", verifyToken, getClubSchedules);
router.get("/tournament/:id", verifyToken, getTournamentSchedules);
router.get("/", verifyToken, getAllSchedules);
router.get("/:id", verifyToken, getScheduleById);

// Protected routes (require authorization)
router.post("/", verifyToken, authorizeScheduleCreation, createSchedule);
router.put("/:id", verifyToken, authorizeScheduleModification, updateSchedule);
router.delete("/:id", verifyToken, authorizeScheduleModification, deleteSchedule);

export default router;