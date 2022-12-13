import mongoose from "mongoose";

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
  doctorsRequests: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Doctors",
    default: [],
  },
  password: {
    type: String,
    required: true,
  },
});

const Patients = mongoose.model("Patients", patientSchema);

export default Patients;
