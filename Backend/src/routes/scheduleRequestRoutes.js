import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  createScheduleRequest,
  getMyScheduleRequests,
  approveScheduleRequest,
  rejectScheduleRequest,
} from "../controllers/scheduleRequestController.js";

const router = Router();

router.post("/", verifyToken, createScheduleRequest);
router.get("/my", verifyToken, getMyScheduleRequests);
router.post("/approve/:requestId", verifyToken, approveScheduleRequest);
router.post("/reject/:requestId", verifyToken, rejectScheduleRequest);

export default router;
