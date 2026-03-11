import express from "express";
import multer from "multer";
import path from "path";
import {
  createComplaint,
  editComplaint,
  deleteComplaint,
  getUserComplaints,
  getAllComplaints,
  getNearbyComplaints,
  assignComplaint,
  unassignComplaint,
  updateComplaintStatus,
  getAssignedComplaints,
  getDashboardStats,
  addComment,
  upvoteComplaint,
  downvoteComplaint,
  getAnalytics,
  getAdminOverview,
  getMonthlyStats,
  generateMonthlyReport,
  updateUserRole,
  getAdminLogs,
  changeComplaintStatus,
  getNearbyVolunteers,
  selfAssignComplaint
} from "../controllers/complaintController.js";
import { verifyToken } from "../middleware/authMiddleware.js"; // 🔐 JWT auth check

const router = express.Router();

//  Multer setup for image uploads
const storage = multer.memoryStorage(); // direct buffer -> Cloudinary
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error("Only JPEG/PNG image files are allowed!"), false);
};
const upload = multer({ storage, fileFilter });


// ✅ Update user role (matches FE URL: /api/complaints/updateRole)
router.put("/updateRole", verifyToken, updateUserRole);

// ✅ Update complaint status (matches FE URL: /api/complaints/update-status/:id)
router.put("/update-status/:id", verifyToken, updateComplaintStatus);

// ✅ Change complaint status (Admin only - alternate route)
router.put("/:id/change-status", verifyToken, changeComplaintStatus);


// 📝 Create complaint (supports multiple photos)
router.post("/", verifyToken, upload.array("photos", 5), createComplaint);

// 👤 Get user's own complaints
router.get("/my", verifyToken, getUserComplaints);

// 🧍 Volunteer - Get assigned complaints
router.get("/assigned", verifyToken, getAssignedComplaints);

// 📍 Volunteer - Get nearby complaints
router.get("/nearby", verifyToken, getNearbyComplaints);

// 🧑‍💼 Admin - Get all complaints
router.get("/all", verifyToken, getAllComplaints);

// 🟢 Assign complaint to volunteer
router.put("/:id/assign", verifyToken, assignComplaint);

// 🚫 Unassign complaint
router.put("/:id/unassign", verifyToken, unassignComplaint);

// Fetch nearby volunteers
router.get("/:id/nearby-volunteers", verifyToken, getNearbyVolunteers);


// Assign volunteer

router.put("/:id/self-assign", verifyToken, selfAssignComplaint);

//  Add comment
router.post("/:id/comment", verifyToken, addComment);

//  Upvote &  Downvote
router.post("/:id/upvote", verifyToken, upvoteComplaint);
router.post("/:id/downvote", verifyToken, downvoteComplaint);

//  DASHBOARD & ANALYTICS

router.get("/stats", verifyToken, getDashboardStats);
router.get("/admin-overview", verifyToken, getAdminOverview);
router.get("/analytics", verifyToken, getAnalytics);
router.get("/monthly-stats", verifyToken, getMonthlyStats);
router.get("/monthly-report", verifyToken, generateMonthlyReport);
router.get("/admin/logs", verifyToken, getAdminLogs);

//  Edit complaint
router.put("/:id", verifyToken, upload.single("image"), editComplaint);

//  Delete complaint
router.delete("/:id", verifyToken, deleteComplaint);

export default router;