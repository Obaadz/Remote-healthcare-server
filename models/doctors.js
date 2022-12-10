import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
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
});

const Doctors = mongoose.model("Doctors", doctorSchema);

export default Doctors;
