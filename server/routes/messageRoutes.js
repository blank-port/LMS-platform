import express from "express";
import { 
  sendMessage, 
  getConversations, 
  getChatHistory, 
  markAsRead, 
  searchUsers 
} from "../controllers/messageController.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send", authMiddleware, sendMessage);
router.get("/conversations", authMiddleware, getConversations);
router.get("/history/:otherUserId", authMiddleware, getChatHistory);
router.patch("/read/:otherUserId", authMiddleware, markAsRead);
router.get("/search-users", authMiddleware, searchUsers);

export default router;
