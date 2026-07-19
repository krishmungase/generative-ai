import { useState } from 'react'
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'

const LIME = '#b5ff2d'

const faqs = [
  {
    q: 'What is the AI Expense Tracker?',
    a: 'A conversational AI assistant powered by Google Gemini that lets you record, search, and analyse expenses through natural language — no forms or dropdowns needed.',
  },
  {
    q: 'How do I add an expense?',
    a: 'Type something like "Add ₹350 dinner at Barbeque Nation" and the AI extracts the title, amount, and category automatically and saves it.',
  },
  {
    q: 'What kind of charts can I generate?',
    a: 'Bar, line, area, pie, and composed charts grouped by day, week, month, year, or category. The AI picks the best chart type for the question.',
  },
  {
    q: 'Which categories are supported?',
    a: 'Food & Dining, Groceries, Transportation, Shopping, Bills & Utilities, Entertainment, Healthcare, Travel, Education, Personal Care, Rent & Housing, and Other — all auto-assigned.',
  },
  {
    q: 'Can I filter my expenses?',
    a: 'Yes — filter by category, date range, keyword, or min/max amount in plain English. "Show food expenses above ₹500 from last month" just works.',
  },
]

const FaqItem = ({ q, a }) => {
  const [open, setOpen] = useState(false)
  return (
    <button
      className="w-full text-left border-b border-gray-200 py-5 flex justify-between items-start gap-4 hover:opacity-80 transition-opacity"
      onClick={() => setOpen(o => !o)}
    >
      <div>
        <p className="font-semibold text-gray-900 text-base">{q}</p>
        {open && <p className="mt-2 text-sm text-gray-500 leading-relaxed">{a}</p>}
      </div>
      {open
        ? <ChevronUp className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5" />
        : <ChevronDown className="flex-shrink-0 w-5 h-5 text-gray-400 mt-0.5" />}
    </button>
  )
}

const FaqSection = () => (
  <section className="max-w-5xl mx-auto px-6 py-10 grid lg:grid-cols-2 gap-12">
    {/* Left – heading + CTA */}
    <div>
      <h2 className="text-3xl font-black text-gray-950 leading-tight">
        Frequently asked<br />questions about<br />
        <span className="px-1 rounded" style={{ background: LIME }}>AI Expense</span>
      </h2>
      <button
        id="faq-try-btn"
        className="mt-8 flex items-center gap-2 rounded-xl px-7 py-3.5 font-bold text-sm text-gray-900 transition hover:opacity-90 group"
        style={{ background: LIME }}
      >
        Try for free
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
      </button>
    </div>

    {/* Right – accordion */}
    <div>
      {faqs.map((f, i) => <FaqItem key={i} q={f.q} a={f.a} />)}
    </div>
  </section>
)

export default FaqSection
