// controllers/complaintController.js
import Complaint from "../models/complaintModel.js";
import User from "../models/userModel.js";
import AdminLog from "../models/adminLogModel.js";

import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import PDFDocument from "pdfkit"; // for generating PDF
import moment from "moment";

dotenv.config();

// Cloudinary setup
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = (fileBuffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error) reject(error);
      else resolve(result);
    });
    stream.end(fileBuffer);
  });


// ------------------------- Helper: log admin actions -------------------------
const logAdminAction = async (req, action, complaint = null) => {
  if (req.user.role === "admin") {
    const log = await AdminLog.create({
      adminName: req.user.username || req.user.name || "Unknown Admin",
      action,
      complaintId: complaint?._id || null,
      complaintTitle: complaint?.title || null, 
      volunteerName: complaint?.volunteerName || null,
      userName: complaint?.userName || null,
    });

    const io = req.app.get("io");
    io?.emit?.("adminLogUpdated", log);
  }
};


// ------------------------- Complaint CRUD & Voting -------------------------

export const createComplaint = async (req, res) => {
  try {
    const io = req.app.get("io");
    const { title, description, latitude, longitude, address, category } = req.body;

    let photoUrls = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, "cleanstreet_complaints");
        photoUrls.push(result.secure_url);
      }
    }

    let finalAddress = address || "";
    if (!finalAddress && latitude && longitude) {
      try {
        const fetch = (await import("node-fetch")).default;
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const geoData = await geoRes.json();
        finalAddress = geoData.display_name || "";
      } catch (geoErr) {
        console.warn("⚠️ Reverse geocoding failed:", geoErr.message);
      }
    }

    const complaint = await Complaint.create({
      user: req.user._id || req.user.id,
      title,
      description,
      category: category || "",
      photos: photoUrls,
      location: finalAddress,
      latitude,
      longitude,
      status: "Pending",
    });

    io?.emit?.("complaintCreated", complaint);
    res.status(201).json({ message: "Complaint created successfully", complaint });
  } catch (err) {
    console.error("❌ Error creating complaint:", err);
    res.status(500).json({ message: "Error creating complaint" });
  }
};

export const editComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (complaint.user.toString() !== (req.user._id || req.user.id))
      return res.status(403).json({ message: "Unauthorized" });

    let photoUrl = complaint.photo;
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, "cleanstreet_complaints");
      photoUrl = result.secure_url;
    }

    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { ...req.body, photo: photoUrl },
      { new: true }
    );

    res.json({ message: "Complaint updated successfully", complaint: updated });
  } catch (err) {
    console.error("❌ Error editing complaint:", err);
    res.status(500).json({ message: "Error editing complaint" });
  }
};

export const deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    if (complaint.user.toString() !== (req.user._id || req.user.id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Unauthorized" });

    await complaint.deleteOne();

    // --- LOG ADMIN ACTION ---
await logAdminAction(req, "deleted complaint", complaint);

    res.json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting complaint:", err);
    res.status(500).json({ message: "Error deleting complaint" });
  }
};

export const getUserComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user._id || req.user.id }).sort({
      createdAt: -1,
    });
    res.json(complaints);
  } catch (err) {
    console.error("❌ Error fetching user complaints:", err);
    res.status(500).json({ message: "Error fetching user complaints" });
  }
};

export const getAssignedComplaints = async (req, res) => {
  try {
    const volunteerId = req.user._id || req.user.id;
    const complaints = await Complaint.find({ volunteer: volunteerId })
      .populate("user volunteer", "username email role")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("❌ Error fetching assigned complaints:", err);
    res.status(500).json({ message: "Error fetching assigned complaints" });
  }
};

export const getNearbyComplaints = async (req, res) => {
  try {
    const lat = parseFloat(req.query.latitude);
    const lng = parseFloat(req.query.longitude);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: "Missing or invalid coordinates" });
    }

    const complaints = await Complaint.find({ volunteer: null });
    const toRad = (v) => (v * Math.PI) / 180;

    const nearby = complaints.filter((c) => {
      if (!c.latitude || !c.longitude) return false;
      const R = 6371;
      const dLat = toRad(c.latitude - lat);
      const dLng = toRad(c.longitude - lng);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat)) * Math.cos(toRad(c.latitude)) * Math.sin(dLng / 2) ** 2;
      const distance = 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return distance <= 50;
    });

    res.status(200).json(nearby);
  } catch (err) {
    console.error("⚠️ Error in getNearbyComplaints:", err);
    res.status(500).json({ message: "Server error fetching nearby complaints" });
  }
};

export const assignComplaint = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Only admin can assign complaints" });
    }

    const { volunteerId } = req.body;
    if (!volunteerId) return res.status(400).json({ message: "volunteerId is required" });

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== "volunteer") {
      return res.status(400).json({ message: "Invalid volunteer" });
    }

    complaint.volunteer = volunteer._id;
    complaint.status = "Assigned";
    await complaint.save();

    await logAdminAction(req, `Assigned complaint to ${volunteer.username}`, complaint);

    const populatedComplaint = await Complaint.findById(complaint._id)
      .populate("volunteer", "username email")
      .populate("user", "username email");

    req.app.get("io")?.emit("complaintAssigned", populatedComplaint);

    res.json({ message: "Complaint assigned successfully", complaint: populatedComplaint });
  } catch (err) {
    console.error("❌ Error assigning complaint:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const unassignComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const io = req.app.get("io");

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.volunteer = null;
    complaint.status = "Pending";
    await complaint.save();

    // --- LOG ADMIN ACTION ---
    await logAdminAction(req, "unassigned complaint", complaint);

    io?.emit?.("complaintUnassigned", complaint);

    res.status(200).json({ message: "Complaint unassigned successfully", complaint });
  } catch (err) {
    console.error("❌ Error unassigning complaint:", err);
    res.status(500).json({ message: "Error unassigning complaint" });
  }
};

export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    await complaint.save();

    // --- LOG ADMIN ACTION ---
    //await logAdminAction(req, `updated status to ${status}`, complaint._id.toString());
    await logAdminAction(req, `updated status to ${status}`, complaint);

    res.json({ message: "Status updated successfully", complaint });
  } catch (err) {
    console.error("❌ Error updating status:", err);
    res.status(500).json({ message: "Error updating status" });
  }
};

// ------------------------- Dashboard Stats & Analytics -------------------------

export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;

    let total = 0, pending = 0, resolved = 0, inProgress = 0;

    if (role === "user") {
      total = await Complaint.countDocuments({ user: userId });
      pending = await Complaint.countDocuments({ user: userId, status: "Pending" });
      resolved = await Complaint.countDocuments({ user: userId, status: "Resolved" });
      inProgress = await Complaint.countDocuments({ user: userId, status: "In Progress" });
    } else if (role === "volunteer") {
      total = await Complaint.countDocuments({ volunteer: userId });
      pending = await Complaint.countDocuments({ volunteer: userId, status: "Assigned" });
      resolved = await Complaint.countDocuments({ volunteer: userId, status: "Resolved" });
      inProgress = await Complaint.countDocuments({ volunteer: userId, status: "In Progress" });
    } else if (role === "admin") {
      total = await Complaint.countDocuments();
      pending = await Complaint.countDocuments({ status: "Pending" });
      resolved = await Complaint.countDocuments({ status: "Resolved" });
      inProgress = await Complaint.countDocuments({ status: "In Progress" });
    }

    res.json({ total, pending, resolved, inProgress });
  } catch (err) {
    console.error("❌ Error fetching dashboard stats:", err);
    res.status(500).json({ message: "Error fetching dashboard stats" });
  }
};

// ------------------------- Comments & Voting -------------------------

export const addComment = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.comments.push({ user: req.user._id || req.user.id, text: req.body.text });
    await complaint.save();

    res.json({ message: "Comment added", comments: complaint.comments });
  } catch (err) {
    console.error("❌ Error adding comment:", err);
    res.status(500).json({ message: "Error adding comment" });
  }
};

export const upvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const userId = req.user._id || req.user.id;

    if (complaint.upvotes.includes(userId)) {
      complaint.upvotes.pull(userId);
    } else {
      complaint.upvotes.push(userId);
      complaint.downvotes.pull(userId);
    }

    await complaint.save();
    res.json({ upvotes: complaint.upvotes.length, downvotes: complaint.downvotes.length });
  } catch (err) {
    console.error("❌ Error upvoting complaint:", err);
    res.status(500).json({ message: "Error upvoting complaint" });
  }
};

export const downvoteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const userId = req.user._id || req.user.id;

    if (complaint.downvotes.includes(userId)) {
      complaint.downvotes.pull(userId);
    } else {
      complaint.downvotes.push(userId);
      complaint.upvotes.pull(userId);
    }

    await complaint.save();
    res.json({ upvotes: complaint.upvotes.length, downvotes: complaint.downvotes.length });
  } catch (err) {
    console.error("❌ Error downvoting complaint:", err);
    res.status(500).json({ message: "Error downvoting complaint" });
  }
};

// ------------------------- Admin Analytics & Overview -------------------------

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("user volunteer", "username email role")
      .sort({ createdAt: -1 });
    res.json(complaints);
  } catch (err) {
    console.error("❌ Error fetching all complaints:", err);
    res.status(500).json({ message: "Error fetching complaints" });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const now = new Date();

    // --- Prepare last 6 months labels ---
    const months = [];
    const monthLabels = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
      monthLabels.push(d.toLocaleString("default", { month: "short", year: "numeric" }));
    }

    const startDate = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // --- Fetch complaints from last 6 months ---
    const complaints = await Complaint.find({ createdAt: { $gte: startDate } });

    // --- Count complaints per month ---
    const userData = [];
    const volunteerData = [];

    months.forEach((m) => {
      const userCount = complaints.filter(
        (c) => c.user &&
               c.createdAt.getFullYear() === m.year &&
               c.createdAt.getMonth() + 1 === m.month
      ).length;

      const volunteerCount = complaints.filter(
        (c) => c.volunteer &&
               c.createdAt.getFullYear() === m.year &&
               c.createdAt.getMonth() + 1 === m.month
      ).length;

      userData.push(userCount);
      volunteerData.push(volunteerCount);
    });

    // --- Status distribution ---
    const statusAgg = await Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const statusDistribution = {};
    statusAgg.forEach((s) => (statusDistribution[s._id || "Unknown"] = s.count));

    // --- Category distribution ---
    const categoryAgg = await Complaint.aggregate([
      { $group: { _id: { $ifNull: ["$category", "Unspecified"] }, count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);

    // --- Send Chart.js-ready response ---
    res.json({
      labels: monthLabels, 
      datasets: [
        {
          label: "User Complaints",
          data: userData,
          borderColor: "rgba(75,192,192,1)",
          backgroundColor: "rgba(75,192,192,0.2)",
          fill: false, // line chart visible
          tension: 0.3, // smooth line
        },
        {
          label: "Volunteer Complaints",
          data: volunteerData,
          borderColor: "rgba(153,102,255,1)",
          backgroundColor: "rgba(153,102,255,0.2)",
          fill: false,
          tension: 0.3,
        },
      ],
      statusDistribution,
      categoryDistribution: categoryAgg,
    });

  } catch (err) {
    console.error("❌ Error fetching analytics:", err);
    res.status(500).json({ message: "Error fetching analytics" });
  }
};



export const getAdminOverview = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const volunteers = await User.countDocuments({ role: "volunteer" });
    const admins = await User.countDocuments({ role: "admin" });

    const totalComplaints = await Complaint.countDocuments();
    const resolved = await Complaint.countDocuments({ status: "Resolved" });
    const pending = await Complaint.countDocuments({ status: "Pending" });
    const inProgress = await Complaint.countDocuments({ status: "In Progress" });
    const assigned = await Complaint.countDocuments({ status: "Assigned" });

    res.json({
      totalUsers,
      volunteers,
      admins,
      totalComplaints,
      resolved,
      pending,
      inProgress,
      assigned,
    });
  } catch (err) {
    console.error("❌ Error fetching admin overview:", err);
    res.status(500).json({ message: "Error fetching admin overview" });
  }
};

// ------------------------- Monthly Stats & PDF Reports -------------------------

export const generateMonthlyReport = async (req, res) => {
  try {
    const complaints = await Complaint.find({}).populate("user volunteer");

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Monthly_Complaint_Report.pdf`
    );

    doc.fontSize(20).text("Monthly Complaint Report", { align: "center" });
    doc.moveDown();

    complaints.forEach((c, i) => {
      doc.fontSize(12).text(`${i + 1}. Title: ${c.title}`);
      doc.text(`   User: ${c.user?.username || "N/A"}`);
      doc.text(`   Volunteer: ${c.volunteer?.username || "Unassigned"}`);
      doc.text(`   Status: ${c.status}`);
      doc.text(
        `   Created At: ${moment(c.createdAt).format("DD MMM YYYY")}`
      );
      doc.moveDown();
    });

    doc.pipe(res);
    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error generating report" });
  }
};

// ------------------------- Admin Logs & Role Update -------------------------
export const getMonthlyStats = async (req, res) => {
  try {
    const now = new Date();
    const months = [];
    const monthLabels = [];

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ year: d.getFullYear(), month: d.getMonth() + 1 });
      monthLabels.push(d.toLocaleString("default", { month: "short" }));
    }

    const complaints = await Complaint.find({});

    const userVsVolunteer = {};
    monthLabels.forEach((label) => {
      userVsVolunteer[label] = { users: 0, volunteers: 0 };
    });

    complaints.forEach((c) => {
      const monthLabel = c.createdAt.toLocaleString("default", { month: "short" });
      if (userVsVolunteer[monthLabel]) {
        if (c.user) userVsVolunteer[monthLabel].users++;
        if (c.volunteer) userVsVolunteer[monthLabel].volunteers++;
      }
    });

    // Flat complaint count per month for line chart
    const complaintsPerMonth = {};
    monthLabels.forEach((label) => {
      complaintsPerMonth[label] =
        (userVsVolunteer[label]?.users || 0) + (userVsVolunteer[label]?.volunteers || 0);
    });

    res.json({ monthLabels, userVsVolunteer, complaints: complaintsPerMonth });
  } catch (err) {
    console.error("❌ Error fetching monthly stats:", err);
    res.status(500).json({ message: "Error fetching monthly stats" });
  }
};

export const getAdminLogs = async (req, res) => {
  try {
    const logs = await AdminLog.find()
      .sort({ createdAt: -1 })
      .populate({ path: "complaintId", select: "title" }); // ✅ populate title only
    res.json(logs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
};

// Update user role (Admin only)

export const updateUserRole = async (req, res) => {
  try {
    const adminId = req.user.id; // from verifyToken
    const { userId, role } = req.body; // ✅ match frontend key

    // Check if current user is admin
    const admin = await User.findById(adminId);
    if (!admin || admin.role !== "admin") {
      return res.status(403).json({ message: "Only admin can update roles" });
    }

    // Update user role
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Role updated successfully", user });
  } catch (error) {
    console.error("❌ Error updating user role:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const changeComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return res.status(400).json({ message: "Status is required" });

    const complaint = await Complaint.findById(id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.status = status;
    await complaint.save();

    res.json({ message: "Complaint status updated", complaint });
  } catch (err) {
    console.error("❌ Error changing complaint status:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Haversine distance
function calculateDistance(lat1, lon1, lat2, lon2) {
  const p = Math.PI / 180;
  const c = Math.cos;
  const a =
    0.5 - c((lat2 - lat1) * p) / 2 +
    (c(lat1 * p) * c(lat2 * p) * (1 - c((lon2 - lon1) * p))) / 2;

  return 12742 * Math.asin(Math.sqrt(a)); // Distance in KM
}

//  GET NEARBY VOLUNTEERS (10 KM RADIUS)

export const getNearbyVolunteers = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    const { latitude, longitude } = complaint;

    if (!latitude || !longitude)
      return res.status(400).json({ message: "Complaint has no location" });

    const volunteers = await User.find({ role: "volunteer" });

    const nearbyVolunteers = volunteers
      .map((v) => {
        const distance = calculateDistance(
          latitude,
          longitude,
          v.lat,
          v.lng
        );

        return {
          _id: v._id,
          username: v.username,
          address: v.address,
          lat: v.lat,
          lng: v.lng,
          distance: distance.toFixed(2),
        };
      })
      .filter((v) => v.distance <= 10) // ← UPDATED TO 10 KM
      .sort((a, b) => a.distance - b.distance);

    res.json(nearbyVolunteers);
  } catch (err) {
    console.error("Error fetching nearby volunteers:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ==================== ASSIGN VOLUNTEER ====================

export const selfAssignComplaint = async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ message: "Only volunteers can self-assign complaints" });
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    complaint.volunteer = req.user._id;
    complaint.status = "Assigned";
    await complaint.save();

    req.app.get("io")?.emit("complaintAssigned", complaint);

    res.json({ message: "Complaint self-assigned successfully", complaint });
  } catch (err) {
    console.error("❌ Error self-assigning complaint:", err);
    res.status(500).json({ message: "Server error" });
  }
};