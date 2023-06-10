import mongoose, { Types } from "mongoose";

export const reportSchema = new mongoose.Schema({
  spo2: Number,
  heartRate: Number,
  temperature: String,
  createdAt: Date,
});

export default reportSchema;
