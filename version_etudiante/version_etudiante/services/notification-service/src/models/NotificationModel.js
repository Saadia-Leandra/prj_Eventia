import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true, trim: true },
  message: { type: String, required: true, trim: true },
  type: { type: String, required: true, trim: true, default: "GENERAL" },
  createdAt: { type: Date, required: true, default: Date.now },
});

export default mongoose.model("Notification", notificationSchema);
