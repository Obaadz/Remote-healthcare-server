import express from "express";
import { getUserData, insertUser } from "../../controllers/users.js";

const usersRoutes = express.Router();

usersRoutes.post("/users/signup", insertUser);
usersRoutes.post("/users/signin", getUserData);

export default usersRoutes;
