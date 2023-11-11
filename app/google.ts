import { google } from "googleapis";
import { createReadStream } from "fs";
import env from "../config/env";
import apikeys from "../config/apikey.json";

class Google {
	oauth2Client = new google.auth.OAuth2(env.ClientId, env.ClientSecret, env.RedirectUri);
	scope = ["https://www.googleapis.com/auth/drive"];
	parents = [env.FolderId];

	private authorize = async () => {
		const jwtClient = new google.auth.JWT(apikeys.client_email, undefined, apikeys.private_key, this.scope);
		await jwtClient.authorize();
		return jwtClient;
	};

	private getDrive = async () => {
		const authClient = await this.authorize().catch((err) => err.response.data);
		return google.drive({ version: "v3", auth: authClient });
	};

	uploadFile = async (path: string, name: string, size: number) => {
		const drive = await this.getDrive();
		return drive.files.create(
			{
				requestBody: {
					parents: this.parents,
					name
				},
				media: { body: createReadStream(path), mimeType: "application/octet-stream" }
			},
			{
				onUploadProgress: (e) => {
					console.log(`${((parseInt(e.bytesRead) / size) * 100).toFixed(0)}`);
				}
			}
		);
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
		return drive.files.get({
			fileId: fileId,
			fields: "webViewLink, webContentLink"
		});
	};

	deleteOlderFiles = async () => {
		const drive = await this.getDrive();
		const files = await drive.files.list().then((res) => res.data.files);
		if (files) {
			files?.splice(0, 11);
			for (let file of files) {
				if (file.id) await drive.files.delete({ fileId: file.id });
			}
		}
	};
}

export default Google;
