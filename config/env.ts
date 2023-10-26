import dotenv from "dotenv";
import getEnv from "../utils/getEnv";

dotenv.config();

interface IEnv {
	HttpPort: string;
	NodeEnv: string;
	PathOfFolder: string;
	SenderToEmail: string;
	SenderFromEmail: string;
	SenderAuthUser: string;
	SenderAuthPass: string;
	TelegramBotToken: string;
	ClientId: string;
	ClientSecret: string;
	RedirectUri: string;
	FolderId: string;
}

const env: IEnv = {
	HttpPort: getEnv("PORT", "4000"),
	NodeEnv: getEnv("NODE_ENV", "development"),
	PathOfFolder: getEnv("PATH_OF_FOLDER", ""),
	SenderToEmail: getEnv("SENDER_TO_EMAIL", ""),
	SenderFromEmail: getEnv("SENDER_FROM_EMAIL", ""),
	SenderAuthUser: getEnv("SENDER_AUTH_USER", ""),
	SenderAuthPass: getEnv("SENDER_AUTH_PASS", ""),
	TelegramBotToken: getEnv("TELEGRAM_BOT_API_TOKEN", ""),
	ClientId: getEnv("CLIENT_ID", ""),
	ClientSecret: getEnv("CLIENT_SECRET", ""),
	RedirectUri: getEnv("REDIRECT_URI", ""),
	FolderId: getEnv("FOLDER_ID", "")
};

export default env;
