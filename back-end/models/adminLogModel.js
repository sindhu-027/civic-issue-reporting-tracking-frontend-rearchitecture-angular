import mongoose from "mongoose";

const adminLogSchema = new mongoose.Schema(
  {
    adminName: {
      type: String,
      required: true,
      trim: true,
    },
    action: {
      type: String,
      required: true,
      trim: true,
    },
    volunteerName: {
      type: String,
      trim: true,
    },
    userName: {
      type: String,
      trim: true,
    },
    complaintId: {
      type: String,
      trim: true,
    },
     complaintTitle: { type: String },
  },
  { timestamps: true }
);

// Collection name will be "adminlogs"
export default mongoose.model("AdminLog", adminLogSchema);