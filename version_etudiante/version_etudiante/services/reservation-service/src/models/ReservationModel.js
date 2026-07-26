import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema({
  clientId: { type: mongoose.Schema.Types.ObjectId, required: true },
  equipmentId: { type: mongoose.Schema.Types.ObjectId, required: true },
  clientName: { type: String, required: true, trim: true },
  clientEmail: { type: String, required: true, trim: true, lowercase: true },
  equipmentName: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 1, validate: Number.isInteger },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalPrice: { type: Number, required: true, min: 0 },
  status: { type: String, required: true, enum: ["CONFIRMED", "CANCELLED"], default: "CONFIRMED" },
}, { timestamps: true });

export default mongoose.model("Reservation", reservationSchema);
