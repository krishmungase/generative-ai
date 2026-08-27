import "dotenv/config";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { ChatGroq } from "@langchain/groq";
import {
  AIMessage,
  BaseMessage,
  HumanMessage,
  ToolMessage,
} from "@langchain/core/messages";
import { StdioClientTransport } from "@modelcontextprotocol/client/stdio";
import readline from "readline/promises";

const GROQ_API_KEY = process.env.GROQ_API_KEY;
if (!GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is not set");
}
const GROQ_MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";

type GroqTool = {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
};

class MCPClient {
  private mcp: Client;
  private groq: ChatGroq;
  private transport:
    | StdioClientTransport
    | StreamableHTTPClientTransport
    | null = null;
  private tools: GroqTool[] = [];

  constructor() {
    this.groq = new ChatGroq({
      apiKey: GROQ_API_KEY,
      model: GROQ_MODEL,
      temperature: 0,
    });
    this.mcp = new Client({ name: "mcp-client-cli", version: "1.0.0" });
  }

  async connectToServer(serverScriptPath: string) {
    try {
      const isJs = serverScriptPath.endsWith(".js");
      const isPy = serverScriptPath.endsWith(".py");
      if (!isJs && !isPy) {
        throw new Error("Server script must be a .js or .py file");
      }
      const command = isPy
        ? process.platform === "win32"
          ? "python"
          : "python3"
        : process.execPath;

      this.transport = new StdioClientTransport({
        command,
        args: [serverScriptPath],
      });
      await this.mcp.connect(this.transport);

      const toolsResult = await this.mcp.listTools();

      this.tools = toolsResult.tools.map((tool) => {
        return {
          type: "function" as const,
          function: {
            name: tool.name,
            description: tool.description ?? "",
            parameters: (tool.inputSchema ?? {
              type: "object",
              properties: {},
            }) as Record<string, unknown>,
          },
        };
      });
      console.log(
        "Connected to server with tools:",
        this.tools.map(({ function: fn }) => fn.name),
      );
    } catch (e) {
      console.error("Failed to connect to MCP server: ", e);
      throw e;
    }
  }

  async processQuery(query: string) {
    const messages: BaseMessage[] = [new HumanMessage(query)];

    const groqWithTools = this.tools.length
      ? this.groq.bindTools(this.tools)
      : this.groq;

    const finalText: string[] = [];

    // Groq answers, may ask for tools, then answers again with the results.
    for (let turn = 0; turn < 5; turn++) {
      const response = await groqWithTools.invoke(messages);
      messages.push(response as AIMessage);

      const text = this.textOf(response.content);
      if (text) {
        finalText.push(text);
      }

      const toolCalls = response.tool_calls ?? [];
      if (toolCalls.length === 0) {
        break;
      }

      for (const toolCall of toolCalls) {
        const toolName = toolCall.name;
        const toolArgs = toolCall.args as { [x: string]: unknown };

        finalText.push(
          `[Calling tool ${toolName} with args ${JSON.stringify(toolArgs)}]`,
        );

        let content: string;
        try {
          const result = await this.mcp.callTool({
            name: toolName,
            arguments: toolArgs,
          });
          content = this.textOf(result.content);
        } catch (e) {
          content = `Tool call failed: ${e instanceof Error ? e.message : String(e)}`;
        }

        messages.push(
          new ToolMessage({
            content,
            tool_call_id: toolCall.id ?? toolName,
            name: toolName,
          }),
        );
      }
    }

    return finalText.join("\n");
  }

  /** Flatten Groq / MCP content (a string or content blocks) into plain text. */
  private textOf(content: unknown): string {
    if (typeof content === "string") return content;
    if (Array.isArray(content)) {
      return content
        .filter((block: any) => typeof block === "string" || block?.type === "text")
        .map((block: any) => (typeof block === "string" ? block : block.text))
        .join("\n");
    }
    return content == null ? "" : JSON.stringify(content);
  }

  async chatLoop() {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    try {
      console.log("\nMCP Client Started!");
      console.log("Type your queries or 'quit' to exit.");

      while (true) {
        let message: string;
        try {
          message = await rl.question("\nQuery: ");
        } catch {
          break; // stdin closed (Ctrl-D or piped input ended)
        }
        if (message.trim().toLowerCase() === "quit") {
          break;
        }
        const response = await this.processQuery(message);
        console.log("\n" + response);
      }
    } finally {
      rl.close();
    }
  }

  async cleanup() {
    await this.mcp.close();
  }
}

async function main() {
  if (process.argv.length < 3) {
    console.error("Usage: node index.js <path_to_server_script>");
    process.exit(1);
  }
  const mcpClient = new MCPClient();
  try {
    await mcpClient.connectToServer(process.argv[2]);
    await mcpClient.chatLoop();
  } finally {
    await mcpClient.cleanup();
  }
}

main().catch((e) => {
  console.error("Error:", e);
  process.exit(1);
});
