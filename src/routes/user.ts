import UserController from "@/contollers/user";
import { UserValidator } from "@/validators/user";
import express from "express";

const router = express.Router();

const controller = new UserController();
const validator = new UserValidator();

router.get("/all", controller.getAll);
router.post("/", validator.create, controller.create);

router.route("/:id").get(controller.getOne).patch(validator.update, controller.update).delete(controller.delete);

export default router;
