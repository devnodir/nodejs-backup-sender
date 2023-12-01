import { google } from "googleapis";
import { createReadStream } from "fs";
import env from "../config/env";
import apikeys from "../config/apikey.json";
import debounce from "../utils/debounce";
import logger from "../utils/logger";

class Google {
	oauth2Client = new google.auth.OAuth2(env.ClientId, env.ClientSecret, env.RedirectUri);
	scope = ["https://www.googleapis.com/auth/drive"];
	parents = [env.FolderId];

	private authorize = async () => {
		const jwtClient = new google.auth.JWT(apikeys.client_email, undefined, apikeys.private_key, this.scope);
		jwtClient
			.authorize()
			.then((res) => {
				logger.success("Google auth done");
				return res;
			})
			.catch((err) => {
				logger.error(`Google auth failed: ${err.message}`);
				return err.response.data;
			});
		return jwtClient;
	};

	private getDrive = async () => {
		const authClient = await this.authorize();
		return google.drive({ version: "v3", auth: authClient });
	};

	uploadFile = async (path: string, name: string, size: number) => {
		const drive = await this.getDrive();
		return drive.files
			.create(
				{
					requestBody: {
						parents: this.parents,
						name
					},
					media: { body: createReadStream(path), mimeType: "application/octet-stream" }
				},
				{
					onUploadProgress: (e) => {
						logger.info(`${((parseInt(e.bytesRead) / size) * 100).toFixed(0)}`);
					}
				}
			)
			.then((res) => {
				logger.success("File uploading done");
				return res;
			})
			.catch((err) => {
				logger.error(`File uploading failed: ${err.message}`);
				return err;
			});
	};

	generatePublicUrl = async (fileId: any) => {
		const drive = await this.getDrive();
		await drive.permissions.create({
			fileId: fileId,
			requestBody: {
				role: "reader",
				type: "anyone"
			}
		});
		return drive.files
			.get({
				fileId: fileId,
				fields: "webViewLink, webContentLink"
			})
			.then((res) => {
				logger.success("Generate file link done");
				return res;
			})
			.catch((err) => {
				logger.error(`Generate file link failed: ${err.message}`);
				return err;
			});
	};

	deleteOlderFiles = async () => {
		const drive = await this.getDrive();
		const files = await drive.files.list().then((res) => res.data.files);
		if (files) {
			files?.splice(0, 11);
			for (let file of files) {
				if (file.id)
					await drive.files
						.delete({ fileId: file.id })
						.then((res) => {
							logger.success(`Deleting file done: ${file.name}`);
							return res;
						})
						.catch((err) => {
							logger.error(`Deleting file failed: ${err.response?.data}`);
							return err;
						});
			}
		}
	};
}

export default Google;
