import AppError from "@/utils/appError";
import { decodeToken } from "@/utils/token";
import { NextFunction, Request, Response } from "express";

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	const token = req.headers.authorization;
	if (!token) {
		return next(new AppError(401, "User unauthorized"));
	}
	try {
		res.locals._id = (await decodeToken(token))._id;
		next();
	} catch (error) {
		next(new AppError(500, error));
	}
};

export default authMiddleware;
