import { PASSWORD_PATTERN } from "@/utils/patters";
import { defaultAlter, validPhone } from "@/utils/validation";
import { NextFunction, Request, Response } from "express";
import Joi from "joi";

export class UserValidator {
	private passPattern = new RegExp(PASSWORD_PATTERN);
	private createSchema = Joi.object({
		full_name: Joi.string().min(3).alter(defaultAlter),
		phone_number: Joi.number().custom(validPhone).alter(defaultAlter),
		password: Joi.string().min(8).pattern(this.passPattern).alter(defaultAlter)
	});
	private updateSchema = this.createSchema.keys({
		new_password: Joi.string().pattern(this.passPattern).min(8).when("password", {
			is: Joi.exist(),
			then: Joi.required(),
			otherwise: Joi.forbidden()
		})
	});
	create = (req: Request, res: Response, next: NextFunction) => {
		const { error } = this.createSchema.tailor(req.method).validate(req.body);
		if (error) return next(error.details[0]);
		next();
	};
	update = (req: Request, res: Response, next: NextFunction) => {
		const { error } = this.updateSchema.tailor(req.method).validate(req.body);
		if (error) return next(error.details[0]);
		next();
	};
}
