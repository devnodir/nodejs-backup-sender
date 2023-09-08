import { NextFunction, Request, Response } from "express";
import bcrypt from "bcrypt";
import User, { IUser } from "@/models/User";
import AppError from "@/utils/appError";
import appResponse from "@/utils/appResponse";
import Obj from "@/utils/object";

class UserController {
	private notFoundMessage = "User not found";
	private selectUser = "-password -__v";
	private omitUser = (user: IUser) => Obj.omit(user?.toObject(), ["password", "__v"]);

	private genSalt = async () => await bcrypt.genSalt();
	private hashPassword = async (password: string) => await bcrypt.hash(password, await this.genSalt());

	getAll = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const users = await User.find().select(this.selectUser);
			appResponse(res, 200, users);
		} catch (error) {
			next(new AppError(500, error));
		}
	};
	getOne = async (req: Request, res: Response, next: NextFunction) => {
		try {
			const user = await User.findById(req.params.id).select(this.selectUser);
			if (!user) {
				return next(new AppError(500, this.notFoundMessage));
			}
			appResponse(res, 200, user);
		} catch (error) {
			next(new AppError(500, error));
		}
	};
	create = async (req: Request, res: Response, next: NextFunction) => {
		try {
			let body = req.body;
			body.password = await this.hashPassword(body.password);
			let user = await User.create(body);
			appResponse(res, 200, this.omitUser(user), "User successfully created");
		} catch (error) {
			next(new AppError(500, error));
		}
	};
	update = async (req: Request, res: Response, next: NextFunction) => {
		try {
			let user = await User.findByIdAndUpdate({ _id: req.params.id }, req.body).select(this.selectUser);
			if (!user) {
				return next(new AppError(500, this.notFoundMessage));
			}
			appResponse(res, 200, user, "User successfully updated");
		} catch (error) {
			next(new AppError(500, error));
		}
	};
	delete = async (req: Request, res: Response, next: NextFunction) => {
		try {
			let user = await User.findByIdAndDelete({ _id: req.params.id }).select("-password -__v");
			if (!user) {
				return next(new AppError(500, this.notFoundMessage));
			}
			appResponse(res, 200, user, "User successfully deleted");
		} catch (error) {
			next(new AppError(500, error));
		}
	};
}

export default UserController;
