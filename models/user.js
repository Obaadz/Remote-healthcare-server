import mongoose, { Mongoose } from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  gender: {
    type: String,
    required: true,
  },
  phone_number: {
    type: String,
    required: true,
  },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    unique: true,
    ref: "Devices",
  },
  password: { type: String, required: true },
});

const Users = mongoose.model("Users", userSchema);

export default Users;
