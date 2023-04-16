import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    lowercase: true,
    required: true,
    trim: true,
  },
  gender: {
    type: String,
    lowercase: true,
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
  email: {
    type: String,
    trim: true,
    lowercase: true,
    unique: true,
    required: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      "Please fill a valid email address",
    ],
  },
  password: {
    type: String,
    required: true,
  },
  patients: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Patients",
    default: [],
  },
  emergencies: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: "Patients",
    default: [],
  },
  player_id: {
    type: String,
    default: "",
  },
});

const Admins = mongoose.model("Admins", adminSchema);

export default Admins;
