import type { Plugin } from "vite";
import path from "path";
import { google } from "googleapis";
import { loadEnv } from "vite";

interface Options {
	creds: string
}

export default (options: Options): Plugin => {
	const env = loadEnv("", process.cwd(), "");
	const regex = new RegExp(`%sheets\.(.+?)%`, "g");
	const creds = path.join(process.cwd(), options.creds);
	const auth = new google.auth.GoogleAuth({
		keyFile: creds,
		scopes: "https://www.googleapis.com/auth/spreadsheets.readonly"
	});


	return {
		name: "vite-plugin-sheets",
		async transform(code, id) {
			const client = await auth.getClient();
			const sheets = google.sheets({ version: "v4", auth: client });
			const { data } = await sheets.spreadsheets.values.get({
				auth,
				spreadsheetId: env.SPREADSHEET_ID,
				range: env.SHEET ?? "Sheet1"
			});
			data.values?.shift();
			const slots = new Map(data.values?.map(v => [v[0], v[1]]));
			const result = { code };
			const matches = code.matchAll(regex);
			for (const match of matches) {
				if (slots.has(match[1])) {
					result.code = result.code.replace(match[0], slots.get(match[1]));
				} else {
					result.code = result.code.replace(match[0], `Error: ${match[1]} missing slot from sheet`);
				}
			}

			return result;
		}
	};
};
