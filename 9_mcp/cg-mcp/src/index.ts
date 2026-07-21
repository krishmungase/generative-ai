import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

import { STUDENTS } from './constant.js'
import { GetPromptResult } from "@modelcontextprotocol/sdk/spec.types";

// Create server instance
const server = new McpServer({
    name: "cg_mcp",
    version: "1.0.0",
});

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

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Codersgyan MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});