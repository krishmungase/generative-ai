import * as z from "zod"
import { tool } from "@langchain/core/tools";
import { ExpenseModel } from "../models/index.js";
import { AvailableExpenseCategories } from "../constant/index.js"

export const addExpense = tool(
    async (args) => {
        const { title, amount, description, category } = args ?? {};
        const numericAmount = amount !== undefined ? Number(amount) : undefined;

        const expense = await ExpenseModel.create({
            title,
            amount: numericAmount,
            description,
            category
        })

        return {
            type: "expense",
            status: "success",
            message: "Expense added successfully",
            expense,
        };
    },
    {
        name: "add_expense",
        description: "Add an expense to the database.",
        schema: z.object({
            title: z.string().describe("title of the expense"),
            amount: z.number().describe("Amount of the expense"),
            description: z.string().describe("Description of the expense"),
            category: z.enum(AvailableExpenseCategories).optional()
        }),
    }
)

export const getExpense = tool(
    async (args) => {
        const {
            category,
            title,
            minAmount,
            maxAmount,
            startDate,
            endDate,
        } = args ?? {};

        const filter = {};
        if (category) {
            filter.category = category;
        }
        if (title) {
            filter.title = {
                $regex: title,
                $options: "i",
            };
        }
        if (minAmount !== undefined || maxAmount !== undefined) {
            filter.amount = {};
            if (minAmount !== undefined) {
                filter.amount.$gte = minAmount;
            }
            if (maxAmount !== undefined) {
                filter.amount.$lte = maxAmount;
            }
        }

        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }

            if (endDate) {
                filter.createdAt.$lte = new Date(endDate);
            }
        }

        const expenses = await ExpenseModel.find(filter).sort({
            createdAt: -1,
        });

        return {
            type: "expense_list",
            status: "success",
            message: "Expenses fetched successfully",
            expenses,
        };
    },
    {
        name: "get_expense",
        description: `
        Retrieve expenses using optional filters.

        Supports:
        - category
        - title
        - amount range
        - date range

        Examples:
        - Show all expenses
        - Show food expenses
        - Show expenses above ₹500
        - Show expenses between two dates
        - Show shopping expenses from last month
    `,
        schema: z.object({
            category: z.enum(AvailableExpenseCategories).optional(),

            title: z
                .string()
                .optional()
                .describe("Search by expense title"),

            minAmount: z
                .number()
                .optional()
                .describe("Minimum expense amount"),

            maxAmount: z
                .number()
                .optional()
                .describe("Maximum expense amount"),

            startDate: z
                .string()
                .optional()
                .describe("Start date in ISO format (YYYY-MM-DD)"),

            endDate: z
                .string()
                .optional()
                .describe("End date in ISO format (YYYY-MM-DD)"),
        }),
    }
);

export const generateExpenseChart = tool(
    async (args) => {
        const {
            category,
            title,
            minAmount,
            maxAmount,
            startDate,
            endDate,
            groupBy = "category",
            metric = "sum",
        } = args ?? {};

        const filter = {};

        if (category) {
            filter.category = category;
        }

        if (title) {
            filter.title = {
                $regex: title,
                $options: "i",
            };
        }

        if (minAmount !== undefined || maxAmount !== undefined) {
            filter.amount = {};

            if (minAmount !== undefined) {
                filter.amount.$gte = minAmount;
            }

            if (maxAmount !== undefined) {
                filter.amount.$lte = maxAmount;
            }
        }

        if (startDate || endDate) {
            filter.createdAt = {};

            if (startDate) {
                filter.createdAt.$gte = new Date(startDate);
            }

            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                filter.createdAt.$lte = end;
            }
        }

        let groupId;

        switch (groupBy) {
            case "total":
                groupId = null;
                break;

            case "category":
                groupId = "$category";
                break;

            case "day":
                groupId = {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: "$createdAt",
                    },
                };
                break;

            case "week":
                groupId = {
                    year: { $isoWeekYear: "$createdAt" },
                    week: { $isoWeek: "$createdAt" },
                };
                break;

            case "month":
                groupId = {
                    year: { $year: "$createdAt" },
                    month: { $month: "$createdAt" },
                };
                break;

            case "year":
                groupId = {
                    year: { $year: "$createdAt" },
                };
                break;

            default:
                throw new Error(`Unsupported groupBy value: ${groupBy}`);
        }

        // Metric expression
        let valueExpression;

        switch (metric) {
            case "sum":
                valueExpression = { $sum: "$amount" };
                break;

            case "count":
                valueExpression = { $sum: 1 };
                break;

            case "average":
                valueExpression = { $avg: "$amount" };
                break;

            case "max":
                valueExpression = { $max: "$amount" };
                break;

            case "min":
                valueExpression = { $min: "$amount" };
                break;

            default:
                throw new Error(`Unsupported metric value: ${metric}`);
        }

        let sortStage;

        switch (groupBy) {
            case "week":
                sortStage = { "_id.year": 1, "_id.week": 1 };
                break;

            case "month":
                sortStage = { "_id.year": 1, "_id.month": 1 };
                break;

            case "year":
                sortStage = { "_id.year": 1 };
                break;

            case "total":
            case "category":
            case "day":
            default:
                sortStage = { "_id": 1 };
                break;
        }

        const result = await ExpenseModel.aggregate([
            {
                $match: filter,
            },
            {
                $group: {
                    _id: groupId,
                    value: valueExpression,
                },
            },
            {
                $sort: sortStage,
            },
        ]);

        const labels = result.map((item) => {
            if (groupBy === "total") return "Total";

            if (groupBy === "category") return item._id;

            if (groupBy === "day") return item._id;

            if (groupBy === "week")
                return `Week ${item._id.week}, ${item._id.year}`;

            if (groupBy === "month")
                return `${item._id.month}/${item._id.year}`;

            if (groupBy === "year")
                return `${item._id.year}`;

            return item._id;
        });

        const data = result.map((item) => item.value);

        const chartData = labels.map((label, index) => ({
            name: label,
            value: data[index],
            [metric]: data[index],
        }));

        return {
            type: "chart",
            status: "success",
            message: "Expense chart data generated successfully.",
            groupBy,
            metric,
            chartData,
        };
    },
    {
        name: "generate_expense_chart",
        description: `
        Generate chart-ready aggregated expense data.

        Supports:
        - category filter
        - title filter
        - amount range
        - date range
        - grouping by total/category/day/week/month/year
        - metrics like sum, count, average, min and max

        Use groupBy: "total" when the user wants a single overall number
        (e.g. "what's my total spend?", "how much have I spent overall?",
        "total number of expenses") rather than a breakdown.

        Examples:
        - Show monthly expenses
        - Show weekly food expenses
        - Show average travel expense by month
        - Show number of expenses by category
        - Show yearly spending
        - What is my total expense so far → groupBy: "total", metric: "sum"
        - How many expenses have I logged → groupBy: "total", metric: "count"
`,
        schema: z.object({
            category: z.enum(AvailableExpenseCategories).optional(),

            title: z
                .string()
                .optional()
                .describe("Search expenses by title"),

            minAmount: z
                .number()
                .optional()
                .describe("Minimum amount"),

            maxAmount: z
                .number()
                .optional()
                .describe("Maximum amount"),

            startDate: z
                .string()
                .optional()
                .describe("Start date (YYYY-MM-DD)"),

            endDate: z
                .string()
                .optional()
                .describe("End date (YYYY-MM-DD)"),

            groupBy: z
                .enum(["total", "category", "day", "week", "month", "year"])
                .default("category")
                .describe(
                    "How to group the expense data. Use 'total' to get a single overall value (e.g. total spend, total count) across all matched expenses instead of breaking it into buckets."
                ),

            metric: z
                .enum(["sum", "count", "average", "min", "max"])
                .default("sum")
                .describe("Aggregation metric"),
        }),
    }
);