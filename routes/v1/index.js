import express from "express";
import usersRoutes from "./users.js";
import devicesRoutes from "./devices.js";

const v1Routes = express.Router();

v1Routes.use("/v1", usersRoutes, devicesRoutes);

export default v1Routes;
