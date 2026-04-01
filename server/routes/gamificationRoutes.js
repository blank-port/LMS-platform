import express from "express";
import { 
    getSettings, 
    updateSettings, 
    getBadges, 
    createBadge, 
    deleteBadge, 
    getUserStats, 
    getPointHistory, 
    getAllPointHistory, 
    convertToWallet,
    getLeaderboard,
    getAdminStats
} from "../controllers/gamificationController.js";
import { adminAuth, studentAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin Routes
router.get("/settings", adminAuth, getSettings);
router.put("/settings", adminAuth, updateSettings);
router.post("/badges", adminAuth, createBadge);
router.delete("/badges/:id", adminAuth, deleteBadge);
router.get("/history-all", adminAuth, getAllPointHistory);
router.get("/admin-stats", adminAuth, getAdminStats);

// Student/User Routes
router.get("/badges", studentAuth, getBadges);
router.get("/stats", studentAuth, getUserStats);
router.get("/history", studentAuth, getPointHistory);
router.post("/redeem", studentAuth, convertToWallet);
router.get("/leaderboard", studentAuth, getLeaderboard);

export default router;
