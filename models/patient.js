import mongoose from "mongoose";
import reportSchema from "./schemas/report.js";

export const patientSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    required: true,
    trim: true,
  },
  phoneNumber: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    required: true,
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "Devices",
  },
  adminsRequests: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Admins",
    default: [],
  },
  reports: { type: [reportSchema], default: [] },
  password: {
    type: String,
    required: true,
  },
});

const Patients = mongoose.model("Patients", patientSchema);

export default Patients;
