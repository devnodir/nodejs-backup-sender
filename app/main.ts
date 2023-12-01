import dayjs from "dayjs";
import fs, { stat, unlink } from "fs/promises";
import mailer from "nodemailer";
import path from "path";
import env from "../config/env";
import humanFileSize from "../utils/humanFileSize";
import logger from "../utils/logger";
import Queue from "../utils/queue";
import Bot from "./bot";
import Google from "./google";

class Main {
	queueManager = new Queue();
	bot = new Bot();
	google = new Google();
	folderPath = env.PathOfFolder;
	ignorePatter = /(^|[\/\\])\../;

	async start() {
		this.bot.init();
		setInterval(() => this.startLooper(), 1000 * 60 * 5);
	}

	async startLooper() {
		const filesPath = await this.getFiles();
		for (const filePath of filesPath) {
			if (filePath && this.queueManager.getAll().includes(filePath)) {
				logger.info(`Bu fayl queue da allaqachon bor: ${path.basename(filePath)}`);
				return;
			}
			if (filePath) {
				this.queueManager.enqueue(filePath);
				logger.success(`Bu fayl queue ga qo'shildi: ${path.basename(filePath)}`);
			}
			if (this.queueManager.size() === 1) {
				this.looper();
			}
		}
	}

	async looper() {
		while (this.queueManager.size() > 0) {
			const item = this.queueManager.peek();
			const result = await this.checkFile(item);
			if (result) await this.sender(item);
		}
	}

	async sender(filePath: string) {
		const filename = path.basename(filePath);
		const fileSize = await stat(filePath).then((res) => res.size);
		const humanSize = humanFileSize(fileSize);

		try {
			await this.google.deleteOlderFiles();
		} catch (e) {
			await this.bot.sendError(e);
		}

		try {
			const ids = await this.bot.sendingFile(filename, humanSize, "started");

			const fileId = await this.google.uploadFile(filePath, filename, fileSize).then((res) => res.data.id);

			const url = await this.google.generatePublicUrl(fileId).then((res) => res.data.webContentLink);

			await this.bot.deleteLastMessage(ids);

			await this.bot.sendingFile(filename, humanSize, "done", url);

			await this.sentToEmail(url);

			await this.deleteCurrentFile();
			logger.info("Operation finished at", dayjs().format("DD.MM.YYYY - HH:mm"));
		} catch (e) {
			logger.warn("Operation failed at", dayjs().format("DD.MM.YYYY - HH:mm"));
			await this.bot.sendingFile(filename, humanSize, "failed");
			await this.bot.sendError(e);
		} finally {
			this.queueManager.dequeue();
		}
	}

	sentToEmail(url: any) {
		const transporter = mailer.createTransport({
			host: "smtp.gmail.com",
			port: 587,
			secure: false,
			auth: {
				user: env.SenderAuthUser,
				pass: env.SenderAuthPass
			}
		});

		return transporter
			.sendMail({
				sender: env.SenderFromEmail,
				to: env.SenderToEmail,
				subject: "1C Backup",
				text: "Отправитель резервного файла",
				html: `
				Резервный файл: ${dayjs().format("DD.MM.YYYY  HH:mm")}
				<br/>
				<br/>
				<a href=${url}
					style="border:none;border-radius:6px;padding:8px 16px;background-color:#0088cc;color:white;text-decoration:unset;display:flex;width:fit-content"
				>Скачать файл</a>
			`
			})
			.then((res) => {
				logger.success("Message send to email successfully");
				return res;
			})
			.catch((err) => {
				logger.error("Message send to email successfully failed");
				return err;
			});
	}

	deleteCurrentFile() {
		return unlink(this.queueManager.peek());
	}

	async checkFile(path: string) {
		let isSuccess = false;
		try {
			await fs.open(path, "r+");
			isSuccess = true;
		} catch {}
		return isSuccess;
	}
	async getFiles() {
		const files: string[] = [];
		try {
			const fileList = await fs.readdir(this.folderPath);
			for (const file of fileList) {
				const filePath = `${this.folderPath}/${file}`;
				logger.info("Yangi fayl topildi: ", file);
				if (this.ignorePatter.test(file)) {
					logger.error(`Noto'g'ri formatdagi fayl: ${file}`);
					continue;
				}
				if (!(await fs.stat(filePath)).isFile()) {
					logger.error(`Bu fayl emas: ${file}`);
					continue;
				}
				if (!(await this.checkFile(filePath))) {
					logger.error(`Bu faylni o'qib bo'lmadi: ${file}`);
					continue;
				}
				files.push(filePath);
			}
		} catch {
			logger.error(`Fayllarni tekshirishda xatolik`);
		}
		return files;
	}
}

export default Main;
