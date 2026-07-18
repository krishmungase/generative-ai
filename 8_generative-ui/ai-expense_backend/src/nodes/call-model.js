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
        - Use add_expense only when the user wants to record a new expense.
        - Infer the category automatically whenever possible. If no category fits, use "Other".
        - If amount is missing while adding an expense, ask for it.
        - Use today's date (Asia/Kolkata) if the expense date isn't specified.
        - Use get_expense when the user wants to view, search, or list individual expenses.
        - Use generate_expense_chart when the user asks for totals, analytics, reports, trends, charts, grouped data, averages, counts, minimums, or maximums.
        - Return tool responses exactly as received.
        - Do not call tools for greetings or casual conversation.
        `,
    };

    console.log("--- callModel Input Messages ---");
    console.log(JSON.stringify(state.messages.map(m => ({ role: m.role, type: m.constructor.name, content: m.content })), null, 2));

    const response = await modelWithTools.invoke([
        systemMessage,
        ...state.messages
    ])

    console.log("--- callModel Response ---");
    console.log("Content:", response.content);
    console.log("Tool Calls:", JSON.stringify(response.tool_calls, null, 2));

    return { ...state, messages: [response] }
}