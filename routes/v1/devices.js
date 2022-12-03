import express from "express";
import { updateFields } from "../../controllers/devices.js";

const devicesRoutes = express.Router();

devicesRoutes.put("/devices/update", updateFields);

export default devicesRoutes;
