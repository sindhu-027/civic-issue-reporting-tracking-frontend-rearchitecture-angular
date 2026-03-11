import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      trim: true,
      minlength: [3, "Username must be at least 3 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Hide by default from queries
    },

    role: {
      type: String,
      enum: ["user", "volunteer", "admin"],
      default: "user",
    },

    profilePic: {
      type: String,
      default:
        "https://res.cloudinary.com/demo/image/upload/v1720000000/default_avatar.png",
    },

    address: { type: String, default: "Not specified" },
    lat: { type: Number, default: 0 },
    lng: { type: Number, default: 0 },

    joinDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.password; // remove password when sending response
        return ret;
      },
    },
  }
);

//  Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // hash only if changed
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

//  Compare password method
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;