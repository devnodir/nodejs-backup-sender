import express from "express";
import env from "../config/env";
import Main from "./main";

const app = express();
const main = new Main();

main.start();

// setInterval(() => main.start(), 1000);

// start listen port
(async () => {
	app.listen(env.HttpPort);
})();
