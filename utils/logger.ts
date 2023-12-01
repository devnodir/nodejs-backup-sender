import chalk from "chalk";

interface Logger {
	warn: (...message: any) => void;
	error: (...message: any) => void;
	info: (...message: any) => void;
	success: (...message: any) => void;
}

const warn = (...message: any) => {
	console.log(chalk.yellow(message));
};
const error = (...message: any) => {
	console.log(chalk.red(message));
};
const info = (...message: any) => {
	console.log(chalk.blue(message));
};
const success = (...message: any) => {
	console.log(chalk.green(message));
};

const logger: Logger = { warn, error, info, success };
export default logger;
