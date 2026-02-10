import { Router } from "express";
const router = Router();
import { verifyToken } from "../middleware/verifyToken";
import { createJoinRequest, getClubRequests, approveJoinRequest, rejectJoinRequest } from "../controllers/requestController";

router.post("/join", verifyToken, createJoinRequest);
router.get("/club/:clubId", verifyToken, getClubRequests);
router.post("/approve/:requestId", verifyToken, approveJoinRequest);
router.delete("/reject/:requestId", verifyToken, rejectJoinRequest);

export default router;