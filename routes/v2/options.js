import express from "express";
import OptionController from "../../controllers/optionController.js";

const optionsRoutes = express.Router();

optionsRoutes.get("/options", OptionController.get);
optionsRoutes.get("/options/1", OptionController.insert);
optionsRoutes.put("/options", OptionController.update);

export default optionsRoutes;
