import mongoose from "mongoose";

export const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    imutable: true,
    unique: true,
    minLength: 12,
    maxLength: 12,
  },
  spo2: Number,
  heartRate: Number,
  temperature: Number,
  fall: {
    type: Boolean,
    default: false,
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Devices = mongoose.model("Devices", deviceSchema);

export default Devices;
