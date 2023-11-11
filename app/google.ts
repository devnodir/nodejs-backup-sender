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
		return jwtClient
			.authorize()
			.then((res) => {
				console.log("Google auth done");
				return res;
			})
			.catch((err) => {
				console.error("Google auth failed");
				return err.response.data;
			});
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
						console.log(`${((parseInt(e.bytesRead) / size) * 100).toFixed(0)}`);
					}
				}
			)
			.then((res) => {
				console.log("File uploading done");
				return res;
			})
			.catch((err) => {
				console.error("File uploading failed");
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
				if (file.id)
					await drive.files
						.delete({ fileId: file.id })
						.then((res) => {
							console.log("Deleting file done:", file.name);
							return res;
						})
						.catch((err) => {
							console.error("Deleting file failed:", file.name);
							return err;
						});
			}
		}
	};
}

export default Google;
