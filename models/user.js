import mongoose from "mongoose";
import { deviceSchema } from "./device.js";

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  device: { type: deviceSchema, required: true, ref: "Devices" },
  password: { type: String, required: true },
});

const Users = mongoose.model("Users", userSchema);

export default Users;
