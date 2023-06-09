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
  spo2: { type: Number, default: 97 },
  heartRate: { type: Number, default: 86 },
  temperature: { type: String, default: "37" },
  fall: {
    type: Boolean,
    default: false,
  },
  lat: { type: Number, default: 0 },
  lng: { type: Number, default: 0 },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
});

const Devices = mongoose.model("Devices", deviceSchema);

export default Devices;
