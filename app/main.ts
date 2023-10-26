import chokidar from "chokidar";
import mailer from "nodemailer";
import path from "path";
import dayjs from "dayjs";
import { stat, unlink } from "fs/promises";
import env from "../config/env";
import Queue from "../utils/queue";
import humanFileSize from "../utils/humanFileSize";
import Bot from "./bot";
import Google from "./google";

class Main {
	queueManager = new Queue();
	bot = new Bot();
	google = new Google();

	async start() {
		this.bot.init();
		const watcher = chokidar.watch(env.PathOfFolder, { ignored: /(^|[\/\\])\../, persistent: true });
		watcher.on("add", (path) => {
			this.queueManager.enqueue(path);
			if (this.queueManager.size() === 1) {
				this.looper();
			}
		});
	}

	async looper() {
		while (this.queueManager.size() > 0) {
			const item = this.queueManager.peek();
			await this.sender(item);
			this.queueManager.dequeue();
		}
	}

	async sender(filePath: string) {
		const filename = path.basename(filePath);
		const fileSize = await stat(filePath).then((res) => res.size);
		const humanSize = humanFileSize(fileSize);

		try {
			await this.google.deleteOlderFiles();
		} catch {}

		try {
			const ids = await this.bot.sendingFile(filename, humanSize, "started");

			const fileId = await this.google.uploadFile(filePath, filename, fileSize).then((res) => res.data.id);

			const url = await this.google.generatePublicUrl(fileId).then((res) => res.data.webContentLink);

			await this.bot.deleteLastMessage(ids);

			await this.bot.sendingFile(filename, humanSize, "done", url);

			await this.sentToEmail(url);

			await this.deleteCurrentFile();
		} catch (e) {
			await this.bot.sendingFile(filename, humanSize, "failed");
			await this.bot.sendError(e);
		}
	}

	async sentToEmail(url: any) {
		const transporter = mailer.createTransport({
			host: "smtp.mail.ru",
			port: 587,
			secure: false,
			auth: {
				user: env.SenderAuthUser,
				pass: env.SenderAuthPass
			}
		});

		await transporter.sendMail({
			sender: env.SenderFromEmail,
			to: env.SenderToEmail,
			subject: "1C Backup",
			html: `
				Резервный файл: ${dayjs().format("DD.MM.YYYY  HH:mm")}
				<br/>
				<br/>
				<a href=${url}
					style="border:none;border-radius:6px;padding:8px 16px;background-color:#0088cc;color:white;text-decoration:unset;display:flex;width:fit-content"
				>Скачать файл</a>
			`
		});
	}

	deleteCurrentFile() {
		return unlink(this.queueManager.peek());
	}
}

export default Main;
