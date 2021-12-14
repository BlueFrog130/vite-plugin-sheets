import path from 'path';
import { google } from 'googleapis';
import { loadEnv } from 'vite';

var index = (options) => {
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
            var _a, _b, _c;
            const client = await auth.getClient();
            const sheets = google.sheets({ version: "v4", auth: client });
            const { data } = await sheets.spreadsheets.values.get({
                auth,
                spreadsheetId: env.SPREADSHEET_ID,
                range: (_a = env.SHEET) !== null && _a !== void 0 ? _a : "Sheet1"
            });
            (_b = data.values) === null || _b === void 0 ? void 0 : _b.shift();
            const slots = new Map((_c = data.values) === null || _c === void 0 ? void 0 : _c.map(v => [v[0], v[1]]));
            const result = { code };
            const matches = code.matchAll(regex);
            for (const match of matches) {
                if (slots.has(match[1])) {
                    result.code = result.code.replace(match[0], slots.get(match[1]));
                }
                else {
                    result.code = result.code.replace(match[0], `Error: ${match[1]} missing slot from sheet`);
                }
            }
            return result;
        }
    };
};

export { index as default };
//# sourceMappingURL=index.mjs.map
