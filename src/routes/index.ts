import express from "express";
import { ErrorController } from "@/contollers/error";

import user from "./user";
import auth from "./auth";
import authMiddleware from "@/middleware/auth";

const root = express();
const errorController = new ErrorController();

// routes
root.use("/auth", auth);
root.use("/user", authMiddleware, user);

// error handler
root.use(errorController.hanle);

export default root;
