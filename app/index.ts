import express from "express";
import env from "../config/env";
import Main from "./main";

const app = express();
const main = new Main();

main.start();

// start listen port
(async () => {
	app.listen(env.HttpPort);
})();
