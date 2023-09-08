import jwt from "jsonwebtoken";
import env from "@/config/env";
import { IUser } from "@/models/User";

type Payload = {
	_id: IUser["_id"];
	phone_number: IUser["phone_number"];
};

export const signToken = async (payload: Payload): Promise<string> => {
	return jwt.sign(payload, env.JwtSecret);
};

export const decodeToken = async (token: string): Promise<Payload> => {
	return jwt.verify(token, env.JwtSecret) as Payload;
};
