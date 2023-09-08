import bcrypt from "bcrypt";
import User from "@/models/User";
import AppError from "@/utils/appError";
import { NextFunction, Request, Response } from "express";
import appResponse from "@/utils/appResponse";
import { signToken } from "@/utils/token";

export class AuthController {
	private loginErroMessage = "Login or password incorrect";
	private validatePassword = async (data: string, encrypted: string) => await bcrypt.compare(data, encrypted);

	login = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await User.findOne(req.body);
			if (!user) {
				return next(new AppError(400, this.loginErroMessage));
			}
			const isValid = await this.validatePassword(req.body.password, user.password);
			if (isValid) {
				return next(new AppError(400, this.loginErroMessage));
			}
			const token = await signToken({ phone_number: user.phone_number, _id: user._id });
			appResponse(res, 200, { token, user });
		} catch (error) {
			next(new AppError(500, error));
		}
	};
}
