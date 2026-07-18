import * as z from "zod"
import { tool } from "langchain";
import { TavilySearch } from "@langchain/tavily";
import { google } from "googleapis";
import fs from "fs";
import "dotenv/config";

const TOKEN_PATH = "./token.json";

function getOAuthClient() {
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

const calendar = google.calendar({
    version: "v3",
    auth: getOAuthClient(),
});


// Google Calendar Events

// 1. Create Event
import { randomUUID } from "crypto";

export const createCalendarEventTool = tool(
    async ({ summary, start, end, attendees }) => {
        const event = {
            summary,
            start: {
                dateTime: start,
            },
            end: {
                dateTime: end,
            },
            attendees,
            guestsCanSeeOtherGuests: true,
            guestsCanInviteOthers: false,
            reminders: {
                useDefault: false,
                overrides: [
                    { method: "email", minutes: 60 },
                    { method: "popup", minutes: 10 },
                ],
            },
            conferenceData: {
                createRequest: {
                    requestId: randomUUID(),
                    conferenceSolutionKey: {
                        type: "hangoutsMeet",
                    },
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: "all",          // emails invitations to attendees
            sendNotifications: true,     // ensures notifications are dispatched
        });

        return response.data;
    },
    {
        name: "create_calendar_event",
        description: "Create a calendar event with an optional Google Meet link",
        schema: z.object({
            summary: z.string().describe("Summary of the event"),
            start: z.string().describe("RFC3339 start time"),
            end: z.string().describe("RFC3339 end time"),
            attendees: z
                .array(
                    z.object({
                        email: z.string().describe("Email address of the attendee"),
                    })
                )
                .optional(),
        }),
    }
);

// 2. List Events 
export const listCalendarEventTool = tool(
    async ({ date }) => {

        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: `${date}T00:00:00Z`,
            timeMax: `${date}T23:59:59Z`,
            singleEvents: true,
            orderBy: "startTime",
        });

        return JSON.stringify(response.data.items);
    },
    {
        name: "list_calendar_events",
        description: "Lists all events for a date.",
        schema: z.object({
            date: z.string(),
        }),
    }
);

// 3. Delete Event
export const deleteCalendarEventTool = tool(
    async ({ eventId }) => {

        await calendar.events.delete({
            calendarId: "primary",
            eventId,
        });

        return "Deleted";
    },
    {
        name: "delete_calendar_event",
        schema: z.object({
            eventId: z.string(),
        }),
    }
);


// Web Search Tool
const tavilySearchTool = new TavilySearch({
    tavilyApiKey: process.env.TAVILY_API_KEY,
    maxResults: 5,
    topic: "general"
})

export const webSearch = tool(({ query }) => {
    return tavilySearchTool.invoke({ query })
}, {
    name: 'websearch',
    description: "this tools of the searching web",
    schema: z.object({ query: z.string().describe("Search terms to look for") }),
})