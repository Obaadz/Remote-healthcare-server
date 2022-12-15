import mongoose from "mongoose";

export const reportSchema = new mongoose.Schema({
  spo2: Number,
  heartRate: Number,
  temperature: Number,
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

export default reportSchema;
