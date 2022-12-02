import express from "express";
import { getUserData, insertUser } from "../../controllers/users.js";

const usersRoutes = express.Router();

usersRoutes.route("/users").get(getUserData).post(insertUser);

export default usersRoutes;
