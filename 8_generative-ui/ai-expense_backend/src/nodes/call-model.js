import { addExpense, getExpense, generateExpenseChart } from "./index.js"
import { aiModel } from "../models/index.js"

const modelWithTools = aiModel.bindTools([addExpense, getExpense, generateExpenseChart]);

export const callModel = async (state) => {
    const systemMessage = {
        role: "system",
        content: `You are an AI expense tracker assistant.

        Current Date & Time: ${new Date().toLocaleString("en-IN", {
            timeZone: "Asia/Kolkata",
            dateStyle: "full",
            timeStyle: "long",
        })}

        Time Zone: Asia/Kolkata (IST, UTC+05:30)

        Available tools:
        1. add_expense
        - Record a new expense.

        2. get_expense
        - Retrieve individual expense records using optional filters:
            - category
            - title
            - minAmount
            - maxAmount
            - startDate
            - endDate

        3. generate_expense_chart
        - Generate aggregated expense analytics.
        - Supports:
            - groupBy: total, category, day, week, month, year
            - metric: sum, count, average, min, max
        - Also supports the same filters as get_expense.

        Expense Categories:
        - Food & Dining
        - Groceries
        - Transportation
        - Shopping
        - Bills & Utilities
        - Entertainment
        - Healthcare
        - Travel
        - Education
        - Personal Care
        - Rent & Housing
        - Other

        Rules:
        - Never call more than ONE tool in a single turn.
        - Once a tool has been executed and its output (ToolMessage) is available in the conversation history, do NOT call any tools again. Use the tool's output to formulate your final response.
        - Use add_expense only when the user wants to record a new expense.
        - Infer the category automatically whenever possible. If no category fits, use "Other".
        - If amount is missing while adding an expense, ask for it.
        - Use today's date (Asia/Kolkata) if the expense date isn't specified.
        - Use get_expense when the user wants to view, search, or list individual expenses.
        - Use generate_expense_chart when the user asks for totals, analytics, reports, trends, charts, grouped data, averages, counts, minimums, or maximums.
        - Return tool responses exactly as received. However, if the tool response is of type 'chart', you MUST parse it and dynamically decide which 'chartType' is the best fit for that data ('bar', 'line', areachat,scattered chart,legend,composedchart or 'pie'). Add this 'chartType' field to the JSON object, and also update the chartData array of objects according to the recharts library's requirements. Return ONLY the updated JSON object string. Do NOT add any conversational text, explanations, or markdown code block wrappers (e.g. do not wrap in code blocks).
        - Do not call tools for greetings or casual conversation.
        `,
    };

    const lastMessage = state.messages[state.messages.length - 1];
    const isAfterTool = lastMessage && (
        lastMessage.getType?.() === "tool" ||
        lastMessage.constructor.name === "ToolMessage"
    );

    const model = isAfterTool ? aiModel : modelWithTools;

    console.log("--- callModel Input Messages ---");
    console.log(JSON.stringify(state.messages.map(m => ({ role: m.role, type: m.constructor.name, content: m.content })), null, 2));

    const response = await model.invoke([
        systemMessage,
        ...state.messages
    ])

    console.log("--- callModel Response ---");
    console.log("Content:", response.content);
    console.log("Tool Calls:", JSON.stringify(response.tool_calls, null, 2));

    // Clean markdown code blocks if present in the LLM response content
    if (response.content && typeof response.content === "string") {
        let content = response.content.trim();
        if (content.startsWith("```")) {
            content = content.replace(/^```[a-zA-Z]*\n?/, "").replace(/\n?```$/, "").trim();
            response.content = content;
        }
    }

    return { ...state, messages: [response] }
}