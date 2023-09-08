import { PASSWORD_PATTERN } from "@/utils/patters";
import { validPhone } from "@/utils/validation";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export class AuthValidator {
	private loginSchema = Joi.object({
		phone_number: Joi.number().custom(validPhone).required(),
		password: Joi.string().min(8).pattern(new RegExp(PASSWORD_PATTERN)).required()
	});

	login = (req: Request, res: Response, next: NextFunction) => {
		const { error } = this.loginSchema.validate(req.body);
		if (error) {
			return next(error.details[0]);
		}
		next();
	};
}
