import express from "express";
import OptionController from "../../controllers/optionController.js";

const optionsRoutes = express.Router();

// Insert new Device ID
optionsRoutes.post("/options", OptionController.insert);
optionsRoutes.put("/options", OptionController.update);

export default optionsRoutes;
