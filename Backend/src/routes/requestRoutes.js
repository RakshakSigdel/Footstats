import { Router } from "express";
const router = Router();
import { verifyToken } from "../middleware/verifyToken.js";
import { authorizeClubAdmin, authorizeRequestAction } from "../middleware/authorize.js";
import {
  createJoinRequest,
  getClubRequests,
  approveJoinRequest,
  rejectJoinRequest,
} from "../controllers/requestController.js";

router.post("/join", verifyToken, createJoinRequest);
router.get("/club/:clubId", verifyToken, authorizeClubAdmin, getClubRequests);
router.post("/approve/:requestId", verifyToken, authorizeRequestAction, approveJoinRequest);
router.delete("/reject/:requestId", verifyToken, authorizeRequestAction, rejectJoinRequest);

export default router;
