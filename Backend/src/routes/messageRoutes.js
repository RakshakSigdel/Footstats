import express from "express";
import {
    createMessage,
    getClubMessages,
    deleteMessage
} from "../controllers/messageController.js";
import { verifyToken } from "../middleware/verifyToken.js";
const router = express.Router();


router.get("/club/:clubId", verifyToken, getClubMessages);
router.post("/club/:clubId", verifyToken, createMessage);
router.delete("/:messageId", verifyToken, deleteMessage);

export default router;