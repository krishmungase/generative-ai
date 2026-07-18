// Run this ONCE: node authorize.js
// It opens your browser automatically, captures the code, and saves token.json

import "dotenv/config";
import fs from "fs";
import http from "http";
import { google } from "googleapis";

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } = process.env;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error("❌ Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in .env");
    process.exit(1);
}

const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI   // http://localhost:3000
);

const authUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/gmail.modify",
    ],
    prompt: "consent",
});

console.log("\n🔗 Open this URL in your browser to authorize:\n");
console.log(authUrl);
console.log("\n⏳ Waiting for Google to redirect back...\n");

// Start local server to capture the auth code from Google's redirect
const server = http.createServer(async (req, res) => {
    const url = new URL(req.url, "http://localhost:3000");
    const code = url.searchParams.get("code");

    if (!code) {
        res.end("Waiting for auth code...");
        return;
    }

    res.writeHead(200, { "Content-Type": "text/html" });
    res.end(`
        <html><body style="font-family:sans-serif;text-align:center;padding:50px;background:#0f0f0f;color:#fff;">
            <h2>✅ Authorization successful!</h2>
            <p>You can close this tab and return to your terminal.</p>
        </body></html>
    `);

    try {
        const { tokens } = await oAuth2Client.getToken(code);
        fs.writeFileSync("./token.json", JSON.stringify(tokens, null, 2));
        console.log("✅ token.json saved! You can now run: node agent.js");
    } catch (err) {
        console.error("❌ Error getting token:", err.message);
    }

    server.close();
});

server.listen(3000, () => {
    // Auto-open browser on mac
    import("child_process").then(({ exec }) => exec(`open "${authUrl}"`));
});
