import mongoose from "mongoose";
import env from "@/config/env";

const db = mongoose.connection;
db.on("error", () => {
	console.log("DB: mongo db connection is not open");
});

db.once("open", () => {
	console.log("DB: mongo db connection is established");
});
export default class Database {
	url = env.MongoUrl;
	constructor() {
		console.log(`DB: DATABASE URL: ${this.url}`);
	}
	connect() {
		try {
			return mongoose.connect(this.url);
		} catch (err) {
			console.log(`DB: CONNECTION ERR: ${err}`);
			process.exit(1);
		}
	}
}
