import * as z from "zod";
import { randomUUID } from "crypto";
import { google } from "googleapis";
import { getOAuthClient } from "./auth.js";
import { tool } from "@langchain/core/tools";

const calendar = google.calendar({
    version: "v3",
    auth: getOAuthClient(),
});

// ─── 1. Create Event ──────────────────────────────────────────────────────────

export const createCalendarEventTool = tool(
    async ({ summary, start, end, attendees }) => {
        const event = {
            summary,
            start: { dateTime: start },
            end: { dateTime: end },
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
                    conferenceSolutionKey: { type: "hangoutsMeet" },
                },
            },
        };

        const response = await calendar.events.insert({
            calendarId: "primary",
            resource: event,
            conferenceDataVersion: 1,
            sendUpdates: "all",       // emails invitations to attendees
            sendNotifications: true,  // ensures notifications are dispatched
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
                .array(z.object({ email: z.string().describe("Email address of the attendee") }))
                .optional(),
        }),
    }
);

// ─── 2. List Events ───────────────────────────────────────────────────────────

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

// ─── 3. Delete Event ──────────────────────────────────────────────────────────

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
