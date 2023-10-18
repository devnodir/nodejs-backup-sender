import { Response } from "express";

export default <Data = any>(res: Response, status: number, data: Data, message?: string) => {
	res.status(status).send({
		success: true,
		message,
		status,
		data
	});
};
