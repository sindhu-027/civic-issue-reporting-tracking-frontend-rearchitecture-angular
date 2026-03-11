import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config();

// ✅ Generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};


// ✅ Register User (with location & profile pic)
export const registerUser = async (req, res) => {
  try {
    const { username, email, password, role, address, lat, lng, profilePic } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "User already exists" });

    // Default profile image
    let profilePicUrl = profilePic || "https://res.cloudinary.com/demo/image/upload/v1720000000/default_avatar.png";

    // ✅ Create user with full location info
    const user = await User.create({
      username,
      email,
      password,
      role,
      address: address || "Not specified",
      lat: lat || 0,
      lng: lng || 0,
      profilePic: profilePicUrl,
    });

    // ✅ Generate token
    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    });

    res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        address: user.address,
        lat: user.lat,
        lng: user.lng,
      },
    });
  } catch (err) {
    console.error("❌ Register Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");

    if (!user)
      return res.status(404).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid email or password" });

    const token = generateToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "none",
      secure: true,
    });

    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Get Profile
export const getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Update Profile (with Cloudinary)
// export const updateProfile = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     const { username, address } = req.body;

//     if (username) user.username = username;
//     if (address) user.address = address;

//     // Handle image upload (if sent)
//     if (req.file) {
//       const result = await cloudinary.uploader.upload_stream(
//         { folder: "cleanstreet_users" },
//         (error, result) => {
//           if (error)
//             return res.status(500).json({ message: "Image upload failed" });
//           user.profilePic = result.secure_url;
//           user.save();
//           res.json({
//             message: "Profile updated successfully",
//             user,
//           });
//         }
//       );
//       req.file.stream.pipe(result);
//     } else {
//       await user.save();
//       res.json({
//         message: "Profile updated successfully",
//         user,
//       });
//     }
//   } catch (err) {
//     console.error("❌ Update Error:", err.message);
//     res.status(500).json({ message: "Server Error" });
//   }
// };


export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { username, address } = req.body;

    if (username) user.username = username;
    if (address) user.address = address;

    if (req.file) {
      const uploadToCloudinary = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "cleanstreet_users" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });

      const result = await uploadToCloudinary();
      user.profilePic = result.secure_url;
    }

    await user.save();

    res.json({
      message: "Profile updated successfully",
      user,
    });
  } catch (err) {
    console.error("❌ Update Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};





// ✅ Change Password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select("+password");

    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Old password is incorrect" });

    user.password = newPassword;
    await user.save();
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("❌ Password Change Error:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};

// ✅ Logout
export const logoutUser = (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Logged out successfully" });
};

// ✅ Get All Users (for Admin Dashboard)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error("❌ Error fetching users:", err.message);
    res.status(500).json({ message: "Server Error" });
  }
};