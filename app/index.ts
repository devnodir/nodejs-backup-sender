import express from "express";
import env from "../config/env";
import Main from "./main";
import pino from "pino";

const app = express();
const main = new Main();
const logger = pino({ level: "info" });

main.start();

// start listen port
(async () => {
	app.listen(env.HttpPort);
})();

export { logger };
