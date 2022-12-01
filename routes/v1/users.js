import express from "express";
import { insertUser } from "../../controllers/users.js";

const usersRoutes = express.Router();

usersRoutes.route("/users").post(insertUser);

export default usersRoutes;
