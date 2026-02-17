import { google } from "googleapis";
import { join } from "path";

const auth = new google.auth.GoogleAuth({
  keyFile: join(process.cwd(), "service-account-key.json"),
  scopes: [
    "https://www.googleapis.com/auth/spreadsheets.readonly",
    "https://www.googleapis.com/auth/documents.readonly",
  ],
});

export const sheets = google.sheets({ version: "v4", auth });
export const docs = google.docs({ version: "v1", auth });
