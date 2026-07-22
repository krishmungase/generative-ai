import { z } from "zod";
import { Hono } from "hono";
import { STUDENTS } from "./constant.js";
import { serve } from '@hono/node-server'
import { StreamableHTTPTransport } from "@hono/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { GetPromptResult } from "@modelcontextprotocol/sdk/types";

// Create server instance
const server = new McpServer({
    name: "cg_mcp",
    version: "1.0.0",
});


server.registerResource(
    'refund-policy',
    'https://codersgyan.com/refund-policy',
    {
        title: "Codersgyan Refund Policies",
        mimeType: 'text/plainn',
        description: 'Refund policy of the website'
    },
    async uri => ({
        contents: [{
            uri: uri.href,
            mimeType: 'text/plain',
            text:
                `
            At Coder's Gyan, we are committed to providing high-quality, valuable programming courses and materials to our learners. To ensure your complete satisfaction and confidence in your purchase, we now offer a 100% risk-free, 23-day money-back guarantee. Your satisfaction is our priority.

            1. 23 Day Money-Back Guarantee
            We believe in the value of our courses, and we want you to feel confident in your decision. If you’re not satisfied with your purchase for any reason, you can request a full refund within 23 days of your purchase — no risk, no questions asked.

            2. How to Request a Refund
            To initiate a refund request within the 23-day window, simply contact us at hello@codersgyan.com with your order details, and our team will process your refund promptly.

            3. Important Notes:
            Some importent points related to our Refund Policy:

            ✔󠀿 Request Period: Refunds are only available within 23 days from the original purchase date.

            ✔󠀿 No Late Refunds: Refund requests will not be accepted after 23 days.

            ✔󠀿 One-Time Refund: Each course is eligible for a one-time refund per user only to prevent misuse.

            ✔󠀿 Content Usage Limit: Refunds are not applicable if a significant portion of the course has already been consumed. To maintain fairness, users who have watched more than 3 hours of content or have downloaded a notable amount of course material will not be eligible for a refund during the 23-day window.

            4. Commitment to Quality
            We want you to be confident in what you’re buying. That’s why we offer:

            ✔󠀿 Detailed Course Descriptions: Each course page outlines what you’ll learn, what’s included, and the skills you'll gain by the end of the course.

            ✔󠀿 Module Breakdown: We show the structure of our courses, including the lessons and topics covered in each section, so you know exactly what to expect.

            ✔󠀿 Preview Content: Access sample videos or introductory lessons for free, so you can evaluate our teaching style before making a purchase.

            ✔󠀿 Free Modules (when available): Some courses include complete modules available at no cost, giving you hands-on exposure to the learning experience.

            5. Contact us
            If you have any questions regarding our courses or need further information before purchasing, please feel free to contact us at hello@codersgyan.com
            `
        }]
    })
);

// server.registerResource(
//     'greeting',
//     new ResourceTemplate('greeting://{name}', { list: undefined }),
//     {
//         title: "Greeting Resource",
//         description: 'A greeting for the named subject',
//         mimeType: 'text/plainn',
//     },
//     async (uri, vars) => ({ contents: [{ uri: uri.href, text: `Hello, ${vars.name}!` }] })
// );

server.registerPrompt(
    "greeting-example",
    {
        title: "Greeting Template",
        description: "A Simple Greeting prompt",
        argsSchema: {
            name: z.string().describe("Name of the user"),
        }
    },
    async ({ name }): Promise<GetPromptResult> => {
        return {
            messages: [
                {
                    role: 'user',
                    content: { type: 'text', text: `Please greet ${name} in friendly manner and say this Namaste and mention your name also who is giving the greeting` }
                }
            ]
        }
    }
);

server.registerPrompt(
    "student-list",
    {
        title: "Student List",
        description: "A Simple Prompt to get the all student datas",
        argsSchema: {
            limit: z
                .string()
                .describe("Limit the number of students (as a string)"),
        }
    },
    async ({ limit }): Promise<GetPromptResult> => {
        const numericLimit = Number(limit); // convert here
        return {
            messages: [
                {
                    role: 'user',
                    content: {
                        type: 'text',
                        text: `Give me the list of the students enrolled. Give only ${numericLimit} students`
                    }
                }
            ]
        }
    }
);

server.registerTool(
    "get_all_students",
    {
        description: "Get list of all the students with their enrollment information",
        inputSchema: {
            limit: z
                .number()
                .optional()
                .describe("Limit the number of students"),
        },
    },
    async ({ limit }) => {

        return {
            content: [
                {
                    type: "text",
                    text: JSON.stringify(STUDENTS.slice(0, limit)),
                },
            ],
        };
    },
);


const main = () => {
    const app = new Hono();
    const transport = new StreamableHTTPTransport();

    app.all('/mcp', async (c) => {
        if (!server.isConnected()) {
            await server.connect(transport)
        }

        return transport.handleRequest(c)
    })

    serve({
        fetch: app.fetch,
        port: 8080
    });
}

main();