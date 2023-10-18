import express from "express";
import env from "config/env";
import Database from "core/db";

const app = express();

// db connection
(async function () {
	const db = new Database();
	db.connect();
})();

// start listen port
(async () => {
	app.listen(env.HttpPort);
})();
