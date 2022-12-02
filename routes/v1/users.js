import express from "express";
import { checkUserValidation, insertUser } from "../../controllers/users.js";

const usersRoutes = express.Router();

usersRoutes.route("/users").get(checkUserValidation).post(insertUser);

export default usersRoutes;
