import React from 'react'
import { Calendar, Tag, Info } from 'lucide-react'

const ExpenseListRenderer = ({ data }) => {
  const { expenses = [], message = 'Expenses' } = data

  if (!expenses || expenses.length === 0) {
    return <div className="text-sm text-gray-500 py-4">No expenses found matching the filters.</div>
  }

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
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })
  }

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm w-full my-2">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-3">
        <div>
          <h4 className="font-bold text-gray-800 text-sm">{message}</h4>
          <p className="text-[10px] text-gray-400">Total {expenses.length} records retrieved</p>
        </div>
        <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full">
          Live Data
        </span>
      </div>

      <div className="divide-y divide-gray-50 max-h-60 overflow-y-auto pr-1">
        {expenses.map((exp, idx) => (
          <div key={exp._id || idx} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gray-50 flex items-center justify-center text-sm border border-gray-100">
                {exp.category === 'Food & Dining' ? '🍽️' :
                 exp.category === 'Transportation' ? '🚗' :
                 exp.category === 'Shopping' ? '🛍️' :
                 exp.category === 'Bills & Utilities' ? '⚡' : '📦'}
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-800 leading-tight">{exp.title}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[9px] text-gray-400 bg-gray-100 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                    <Tag className="w-2 h-2" />
                    {exp.category || 'Other'}
                  </span>
                  {exp.createdAt && (
                    <span className="text-[9px] text-gray-400 flex items-center gap-0.5">
                      <Calendar className="w-2.5 h-2.5" />
                      {formatDate(exp.createdAt)}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs font-black text-gray-900">{formatAmount(exp.amount)}</span>
              {exp.description && (
                <p className="text-[9px] text-gray-400 mt-0.5 max-w-[120px] truncate" title={exp.description}>
                  {exp.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ExpenseListRenderer
