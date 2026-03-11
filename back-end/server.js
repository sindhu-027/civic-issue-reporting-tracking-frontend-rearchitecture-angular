
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";
import helmet from "helmet";

// Routes
import authRoutes from "./routes/authRoutes.js";
import complaintRoutes from "./routes/complaintRoutes.js";

dotenv.config();
const app = express();

// ✅ Security middleware
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginEmbedderPolicy: false,
}));

// ✅ CORS setup for React frontend + Socket.IO
const allowedOrigin = process.env.CLIENT_URL || "http://localhost:5173";
app.use(
  cors({
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ Middleware
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err.message));

// ✅ Create HTTP + WebSocket Server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    credentials: true,
    methods: ["GET", "POST"],
  },
  transports: ["websocket"], // ✅ Prevent polling issue
});

// ✅ Attach socket instance globally
app.set("io", io);

// ✅ Socket.IO events
io.on("connection", (socket) => {
  console.log("🟢 Socket connected:", socket.id);
  socket.on("disconnect", (reason) => {
    console.log("🔴 Socket disconnected:", socket.id, "Reason:", reason);
  });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);

// ✅ Health route
app.get("/", (req, res) => {
  res.send("🌍 CleanStreet Backend is running successfully!");
});

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("🌋 Global Error:", err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
  });
});

// ✅ Graceful Shutdown
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("🛑 MongoDB disconnected gracefully");
  process.exit(0);
});

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));