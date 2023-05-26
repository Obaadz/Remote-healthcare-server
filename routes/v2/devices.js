import express from "express";
import DeviceController from "../../controllers/deviceController.js";

const devicesRoutes = express.Router();

// Update device data on the database and send it to client
devicesRoutes.put("/devices/update", DeviceController.update);

export default devicesRoutes;
