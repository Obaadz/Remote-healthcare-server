import express from "express";
import devicesRoutes from "./devices.js";
import { patientsRoutes } from "./users.js";

const v2Routes = express.Router();

v2Routes.use("/v2", patientsRoutes, devicesRoutes);

export default v2Routes;
