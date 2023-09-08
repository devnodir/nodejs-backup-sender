import dotenv from "dotenv";
import getEnv from "@/utils/getEnv";

dotenv.config();

interface IEnv {
	HttpPort: string;
	MongoUrl: string;
	NodeEnv: string;
	JwtSecret: string;
}

const env: IEnv = {
	HttpPort: getEnv("PORT", "4000"),
	MongoUrl: getEnv("MONGO_URL", "mongodb://localhost:27017/test"),
	NodeEnv: getEnv("NODE_ENV", "development"),
	JwtSecret: getEnv("JWT_SECRET_KEY", "MyJwtSecret")
};

export default env;
