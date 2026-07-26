import mongoose from "mongoose";

const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  category: { type: String, required: true, trim: true },
  dailyPrice: { type: Number, required: true, min: 0 },
  availableQuantity: { type: Number, required: true, min: 0, validate: Number.isInteger },
}, { timestamps: true });

export default mongoose.model("Equipment", equipmentSchema);
