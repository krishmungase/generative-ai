import * as z from "zod";
import { tool } from "langchain";
import { google } from "googleapis";
import { getOAuthClient } from "./auth.js";

const gmail = google.gmail({
    version: "v1",
    auth: getOAuthClient(),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function findBody(payload, mimeType = "text/plain") {
    if (payload.mimeType === mimeType && payload.body?.data) {
        return payload.body.data;
    }
    if (payload.parts) {
        for (const part of payload.parts) {
            const result = findBody(part, mimeType);
            if (result) return result;
        }
    }
    return null;
}

function encodeSubject(subject) {
    if (/^[\x00-\x7F]*$/.test(subject)) return subject;
    return `=?UTF-8?B?${Buffer.from(subject, "utf8").toString("base64")}?=`;
}

// ─── 1. Send Email ────────────────────────────────────────────────────────────

export const sendEmail = tool(
    async ({ to, subject, body, cc }) => {
        try {
            const headers = [
                `To: ${to.join(", ")}`,
                ...(cc?.length ? [`Cc: ${cc.join(", ")}`] : []),
                "Content-Type: text/html; charset=utf-8",
                "MIME-Version: 1.0",
                `Subject: ${encodeSubject(subject)}`,
            ];

            // RFC 2822: headers and body MUST be separated by a blank line
            const message = [...headers, "", body].join("\r\n");

            const encodedMessage = Buffer.from(message)
                .toString("base64")
                .replace(/\+/g, "-")
                .replace(/\//g, "_")
                .replace(/=+$/, "");

            const response = await gmail.users.messages.send({
                userId: "me",
                requestBody: { raw: encodedMessage },
            });

            return response.data;
        } catch (err) {
            return {
                success: false,
                error: err.message ?? "Unknown error sending email",
            };
        }
    },
    {
        name: "send_email",
        description: "Send an email via Gmail API. Requires properly formatted addresses.",
        schema: z.object({
            to: z.array(z.string()).min(1).describe("recipient email addresses (e.g. user@example.com)"),
            subject: z.string().min(1),
            body: z.string(),
            cc: z.array(z.string()).optional().describe("CC email addresses"),
        }),
    }
);

// ─── 2. Read Emails ───────────────────────────────────────────────────────────

export const readEmail = tool(
    async ({ query, maxResults }) => {
        try {
            const { data } = await gmail.users.messages.list({
                userId: "me",
                ...(query ? { q: query } : {}),
                maxResults,
            });

            if (!data.messages?.length) return [];

            const emails = await Promise.all(
                data.messages.map(async ({ id }) => {
                    const { data: message } = await gmail.users.messages.get({
                        userId: "me",
                        id,
                        format: "full",
                    });

                    const headers = message.payload?.headers ?? [];
                    const getHeader = (name) =>
                        headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
                            ?.value ?? "";

                    // Try plain text first, then fall back to HTML
                    const rawBody =
                        findBody(message.payload, "text/plain") ??
                        findBody(message.payload, "text/html") ??
                        "";

                    return {
                        id: message.id,
                        threadId: message.threadId,
                        from: getHeader("From"),
                        to: getHeader("To"),
                        subject: getHeader("Subject"),
                        date: getHeader("Date"),
                        snippet: message.snippet,
                        body: rawBody
                            ? Buffer.from(rawBody, "base64").toString("utf8")
                            : "",
                    };
                })
            );

            return emails;
        } catch (err) {
            return { success: false, error: err.message ?? "Unknown error reading email" };
        }
    },
    {
        name: "read_email",
        description:
            "Read emails from Gmail. Supports Gmail search queries like from:, subject:, is:unread, newer_than:7d, etc.",
        schema: z.object({
            query: z
                .string()
                .optional()
                .describe(
                    "Gmail search query (e.g. 'is:unread', 'from:alice@example.com', 'subject:invoice')"
                ),
            maxResults: z.number().min(1).max(100).default(10),
        }),
    }
);
