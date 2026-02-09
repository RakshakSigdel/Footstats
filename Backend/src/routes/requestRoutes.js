const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/verifyToken");
const { createJoinRequest, getClubRequests, approveJoinRequest, rejectJoinRequest } = require("../controllers/requestController");

router.post("/join", verifyToken, createJoinRequest);
router.get("/club/:clubId", verifyToken, getClubRequests);
router.post("/approve/:requestId", verifyToken, approveJoinRequest);
router.delete("/reject/:requestId", verifyToken, rejectJoinRequest);

module.exports = router;