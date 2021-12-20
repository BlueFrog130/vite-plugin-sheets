import type { Plugin } from "vite";
import path from "path";
import { google, sheets_v4 } from "googleapis";

interface Options {
	creds: string;
	spreadsheetId: string;
	slotColumn?: number;
	contentColumn?: number;
	ignore?: boolean;
}

export default (options: Options): Plugin => {
	const name = "vite-plugin-sheets";
	const regex = new RegExp('%sheets\.([a-zA-Z0-9]+)\.([a-zA-Z0-9]+)%', "g");
	const creds = path.join(process.cwd(), options.creds);
	const auth = new google.auth.GoogleAuth({
		keyFile: creds,
		scopes: "https://www.googleapis.com/auth/spreadsheets.readonly"
	});
	const slotColumn = options.slotColumn || 0;
	const contentColumn = options.contentColumn || 1;
	const ignore = options.ignore || true;
	let slots: Map<string, Map<string, string>> | undefined = undefined;

	async function getSheetNames(api: sheets_v4.Sheets) {
		const { data } = await api.spreadsheets.get({
			spreadsheetId: options.spreadsheetId
		});
		if (!data.sheets)
			throw new Error(`${name}: No sheets from API`);
		return data.sheets.map(s => {
			if (!s.properties || !s.properties.title) {
				throw new Error(`${name}: No properties for sheets`);
			}
			return s.properties.title as string;
		});
	}

	async function getSheetMap(api: sheets_v4.Sheets) {
		const { data } = await api.spreadsheets.values.batchGet({
			spreadsheetId: options.spreadsheetId,
			ranges: await getSheetNames(api)
		});
		if (!data.valueRanges)
			throw new Error(`${name}: missing ValueRanges`);
		return data.valueRanges.reduce((sheets, vr) => {
			if (!vr.range || !vr.values)
				throw new Error(`${name}: ValueRange ${vr.range} missing range or values`);
			if (ignore)
				vr.values.shift();
			const values = new Map<string, string>(vr.values?.map(v => [v[slotColumn], v[contentColumn]]));
			sheets.set(vr.range.split("!")[0].toLowerCase(), values);
			return sheets;
		}, new Map<string, Map<string, string>>());
	}

	return {
		name,
		async transform(code, id) {
			const client = await auth.getClient();
			const sheets = google.sheets({ version: "v4", auth: client });
			if (!slots) {
				console.log("loading sheets data...");
				slots = await getSheetMap(sheets);
			}

			const result = { code };
			const matches = code.matchAll(regex);
			for (const match of matches) {
				const sheet = match[1];
				const slot = match[2];
				if (slots.has(sheet) && slots.get(sheet)?.has(slot)) {
					result.code = result.code.replace(match[0], slots.get(sheet)?.get(slot) || "Error");
				}
			}

			return result;
		}
	};
};
