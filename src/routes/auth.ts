import { AuthController } from "@/contollers/auth";
import { AuthValidator } from "@/validators/auth";
import express from "express";

const router = express.Router();
const controller = new AuthController();
const validator = new AuthValidator();

router.post("/login", validator.login, controller.login);

export default router;
