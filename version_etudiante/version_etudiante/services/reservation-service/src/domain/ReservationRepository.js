export default class ReservationRepository {
  constructor(model) { this.model = model; }
  findAll() { return this.model.find().sort({ createdAt: -1 }).lean(); }
  findById(id) { return this.model.findById(id).lean(); }
  create(data) { return this.model.create(data); }
  delete(id) { return this.model.findByIdAndDelete(id).lean(); }
  cancelConfirmed(id) {
    return this.model.findOneAndUpdate(
      { _id: id, status: "CONFIRMED" },
      { $set: { status: "CANCELLED" } },
      { new: true, runValidators: true },
    ).lean();
  }
  restoreConfirmed(id) {
    return this.model.findByIdAndUpdate(id, { $set: { status: "CONFIRMED" } }, { new: true }).lean();
  }
}
