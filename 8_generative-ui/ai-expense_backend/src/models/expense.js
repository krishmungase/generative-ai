import { model, Schema } from "mongoose";
import { AvailableExpenseCategories, ExpenseCategories } from "../constant/index.js"


const expenseSchema = new Schema(
    {
        title: {
            type: String,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        description: {
            type: String,
            required: false
        },
        category: {
            type: String,
            enum: AvailableExpenseCategories,
            default: ExpenseCategories.OTHER
        }
    },
    { timestamps: true }
)

const ExpenseModel = model('Expense', expenseSchema)

export default ExpenseModel;