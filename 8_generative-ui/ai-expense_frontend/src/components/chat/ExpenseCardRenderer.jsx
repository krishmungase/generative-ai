import React from 'react'
import { CheckCircle2, Tag, Calendar, FileText } from 'lucide-react'

const ExpenseCardRenderer = ({ data }) => {
  const { expense = {}, message = 'Expense recorded successfully' } = data

  const formatAmount = (amt) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amt)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm w-full my-2 max-w-sm">
      <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-3">
        <CheckCircle2 className="w-4 h-4" />
        <span>{message}</span>
      </div>

      <div className="bg-emerald-50/30 border border-emerald-100/50 rounded-xl p-3.5 space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <h5 className="font-bold text-gray-800 text-sm">{expense.title}</h5>
            <p className="text-[10px] text-gray-400">ID: {expense._id?.slice(-6).toUpperCase()}</p>
          </div>
          <span className="text-sm font-black text-gray-900 bg-white border border-gray-100 px-2.5 py-0.5 rounded-lg shadow-sm">
            {formatAmount(expense.amount)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-100/50">
          <div className="space-y-0.5">
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Category</span>
            <span className="text-xs font-semibold text-gray-700 bg-white border border-gray-100 px-1.5 py-0.5 rounded inline-flex items-center gap-1">
              <Tag className="w-3 h-3 text-gray-400" />
              {expense.category || 'Other'}
            </span>
          </div>

          {expense.createdAt && (
            <div className="space-y-0.5">
              <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Date Added</span>
              <span className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-gray-400" />
                {formatDate(expense.createdAt)}
              </span>
            </div>
          )}
        </div>

        {expense.description && (
          <div className="pt-2 border-t border-gray-100/50 space-y-0.5">
            <span className="text-[10px] text-gray-400 block uppercase tracking-wider font-semibold">Description</span>
            <p className="text-xs text-gray-600 italic bg-gray-50 p-2 rounded-lg flex items-start gap-1">
              <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0 mt-0.5" />
              {expense.description}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ExpenseCardRenderer
