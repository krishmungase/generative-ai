import { google } from "googleapis";
import fs from "fs";
import "dotenv/config";

const TOKEN_PATH = "./token.json";

export function getOAuthClient() {
    const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        throw new Error("Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
    }
    if (!fs.existsSync(TOKEN_PATH)) {
        throw new Error("token.json not found. Run `node authorize.js` first to authenticate.");
    }

    const oAuth2Client = new google.auth.OAuth2(
        GOOGLE_CLIENT_ID,
        GOOGLE_CLIENT_SECRET,
        GOOGLE_REDIRECT_URI
    );

    const token = JSON.parse(fs.readFileSync(TOKEN_PATH, "utf8"));
    oAuth2Client.setCredentials(token);
    return oAuth2Client;
}
