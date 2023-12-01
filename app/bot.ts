import os from "os";
import TelegramBot from "node-telegram-bot-api";
import env from "../config/env";
import humanFileSize from "../utils/humanFileSize";
import { addId, deleteId, readFile } from "../utils/json";
import dayjs from "dayjs";
import logger from "../utils/logger";

class Bot {
	bot = new TelegramBot(env.TelegramBotToken, { polling: true });
	init() {
		this.bot.on("message", async (msg) => {
			const chatId = msg.chat?.id;
			const messageText = msg.text;
			await addId(chatId);
			switch (messageText) {
				case "/start":
					await this.bot.sendMessage(chatId, "Welcome to the bot!");
					break;
				case "/memory":
					await this.bot.sendMessage(
						chatId,
						`
Full: ${humanFileSize(os.totalmem())}

Free: ${humanFileSize(os.freemem())}
					`
					);
					break;
				default:
					break;
			}
		});
	}

	async sendMessage(content: string, url?: any) {
		const messageIds: any[] = [];
		try {
			const ids = await readFile("ids");
			for (let id of ids) {
				await this.bot
					.sendMessage(
						id,
						content,
						url
							? {
									reply_markup: {
										inline_keyboard: [
											[
												{
													text: "Скачать файл",
													url
												}
											]
										]
									}
									// parse_mode: "Markdown"
							  }
							: undefined
					)
					.then((res) => {
						logger.success("Bot send message done");
						messageIds.push({
							chatId: id,
							messageId: res.message_id
						});
					})
					.catch((err) => {
						logger.error(`Bot send message error ${err.message}`);
						if (err.message === "ETELEGRAM: 400 Bad Request: chat not found") {
							deleteId(id);
						}
					});
			}
		} catch (e: any) {
			logger.error(e.message);
		}
		return messageIds;
	}

	sendingFile(name: string, fileSize: string, status: "done" | "started" | "failed", url?: any) {
		const statusObj = {
			started: "🟠 Загрузка",
			done: "✅ Загружено",
			failed: "❌ Неуспешный"
		};

		return this.sendMessage(
			`
📁 ${name}

💾 ${fileSize}

🕔 ${dayjs().format("DD.MM.YYYY HH:mm")}

${statusObj[status]}
		`,
			url
		);
	}

	async deleteLastMessage(ids: any[]) {
		try {
			for (let id of ids) {
				await this.bot.deleteMessage(id.chatId, id.messageId);
				logger.success("Delete last message done");
			}
		} catch (e: any) {
			logger.error("Delete last message failed");
			logger.error(e.message);
		}
	}

	sendError(error: any) {
		return this.sendMessage(JSON.stringify(error));
	}
}

export default Bot;
