const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: String, required: true },
  status: {
    type: String,
    enum: ["Present", "Absent", "Leave"],
    default: "Present",
  },
  geoFenceStatus: { type: String, enum: ["Inside", "Outside"], default: "Inside" },
  holiday: { type: Boolean, default: false },
  wfh: { type: Boolean, default: false },
});

module.exports = mongoose.model("Attendance", AttendanceSchema);
