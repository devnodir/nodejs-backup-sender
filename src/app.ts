import "module-alias/register";
import express from "express";
import cors from "cors";
import env from "@/config/env";
import Database from "@/core/db";
import routes from "@/routes";
import getStatus from "@/utils/getStatus";

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/api", routes);
app.use("/status", getStatus);

// db connection
(async function () {
	const db = new Database();
	db.connect();
})();

// start listen port
(async () => {
	app.listen(env.HttpPort);
})();
