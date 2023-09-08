import { Document, Schema, model } from "mongoose";
import { v4 as uuidv4 } from "uuid";

export interface IUser extends Document {
	_id: string;
	name: string;
	phone_number: number;
	password: string;
}

const userSchema = new Schema({
	_id: {
		type: String,
		default: uuidv4()
	},
	full_name: {
		type: String,
		required: true
	},
	phone_number: {
		type: Number,
		unique: true,
		required: true
	},
	password: {
		type: String,
		required: true
	}
});

export default model<IUser>("User", userSchema);
