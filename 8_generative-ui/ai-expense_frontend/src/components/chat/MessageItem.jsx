import React from 'react'
import { ThumbsUp, ThumbsDown, RotateCcw, Copy, MoreHorizontal } from 'lucide-react'
import ChartRenderer from './ChartRenderer'
import ExpenseListRenderer from './ExpenseListRenderer'
import ExpenseCardRenderer from './ExpenseCardRenderer'

const MessageItem = ({ role, content }) => {
  const isUser = role === 'user'

  const tryParseJSON = (str) => {
    try {
      const parsed = JSON.parse(str)
      if (parsed && typeof parsed === 'object') {
        return parsed
      }
    } catch (e) {
      // Not JSON
    }
    return null
  }

  const renderAssistantContent = () => {
    const jsonContent = tryParseJSON(content)

    if (jsonContent) {
      if (jsonContent.type === 'chart') {
        return <ChartRenderer data={jsonContent} />
      }
      if (jsonContent.type === 'expense_list') {
        return <ExpenseListRenderer data={jsonContent} />
      }
      if (jsonContent.type === 'expense') {
        return <ExpenseCardRenderer data={jsonContent} />
      }
      // General JSON fallback
      return (
        <pre className="text-xs bg-gray-50 border border-gray-100 rounded-xl p-3 max-w-full overflow-x-auto text-gray-700">
          {JSON.stringify(jsonContent, null, 2)}
        </pre>
      )
    }

    // Default conversational text
    return (
      <div className="space-y-2 text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    )
  }

  if (isUser) {
    return (
      <div className="flex justify-end w-full">
        <div className="max-w-[70%] rounded-2xl rounded-tr-sm bg-[#f0f4f9] px-4 py-2.5 text-sm text-gray-800 shadow-sm border border-gray-100/50">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start space-y-2 w-full my-6">
      {/* Content wrapper */}
      <div className="w-full max-w-[85%]">
        {renderAssistantContent()}
      </div>

      {/* Action buttons bar */}
      <div className="flex items-center gap-4 text-gray-400 pl-1 pt-1">
        <button className="hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50">
          <ThumbsUp className="w-4 h-4" />
        </button>
        <button className="hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50">
          <ThumbsDown className="w-4 h-4" />
        </button>
        <button className="hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50">
          <RotateCcw className="w-4 h-4" />
        </button>
        <button 
          className="hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50"
          onClick={() => {
            navigator.clipboard.writeText(content)
          }}
          title="Copy response"
        >
          <Copy className="w-4 h-4" />
        </button>
        <button className="hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-50">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default MessageItem
