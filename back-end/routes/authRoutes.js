import express from "express";
import multer from "multer";
import {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  changePassword,
  logoutUser,
  getAllUsers
} from "../controllers/authController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

//  File upload (profile pic)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

//  Token check route (for LandingPage/Dashboard)
router.get("/check", verifyToken, (req, res) => {
  res.status(200).json({
    success: true,
    message: "User authenticated successfully",
    user: req.user,
  });
});

//  Protected routes
router.get("/profile", verifyToken, getProfile);
router.put("/profile/update", verifyToken, updateProfile);
router.put(
  "/profile/upload",
  verifyToken,
  upload.single("profilePic"),
  updateProfile
);
router.put("/change-password", verifyToken, changePassword);


//  Admin Route: Get All Users
router.get("/all", verifyToken, getAllUsers);

//  Logout route
router.post("/logout", logoutUser);
export default router;