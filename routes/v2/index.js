import express from "express";
import devicesRoutes from "./devices.js";
import { patientsRoutes, adminsRoutes } from "./users.js";
import optionsRoutes from "./options.js";

const v2Routes = express.Router();

v2Routes.use("/v2", patientsRoutes, adminsRoutes, devicesRoutes, optionsRoutes);

export default v2Routes;
