import jsonfile from "jsonfile";
import logger from "./logger";

const filePath = "./config/data.json";

export const readFile = (key: string) => {
	return jsonfile.readFile(filePath).then((res) => res[key]);
};

export const writeFile = (key: string, data: number[]) => {
	return jsonfile.writeFile(filePath, { [key]: data });
};

export const addId = async (id: number) => {
	try {
		const ids = await readFile("ids");
		if (!ids.includes(id)) ids.push(id);
		await writeFile("ids", ids);
	} catch (e: any) {
		logger.error(e.message);
	}
};

export const deleteId = async (id: number) => {
	try {
		const ids: number[] = await readFile("ids");
		const index = ids.findIndex((el: number) => el === id);
		ids.splice(index, 1);
		await writeFile("ids", ids);
	} catch (e: any) {
		logger.error(e.message);
	}
};
