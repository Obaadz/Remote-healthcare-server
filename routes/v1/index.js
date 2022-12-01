import express from "express";
import usersRoutes from "./users.js";

const v1Routes = express.Router();

v1Routes.use("/v1", usersRoutes);

export default v1Routes;
