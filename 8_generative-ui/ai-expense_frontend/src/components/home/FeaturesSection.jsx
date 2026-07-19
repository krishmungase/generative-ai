import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  MessageSquare,
  BarChart2,
  Search,
  TrendingUp,
  Utensils,
  Car,
  ShoppingBag,
  Zap,
} from 'lucide-react'

const LIME = '#b5ff2d'

const barData = [
  { day: 'Mon', v: 320 }, { day: 'Tue', v: 580 }, { day: 'Wed', v: 210 },
  { day: 'Thu', v: 870 }, { day: 'Fri', v: 450 }, { day: 'Sat', v: 720 }, { day: 'Sun', v: 390 },
]

const pieData = [
  { name: 'Food', value: 38, color: '#f97316' },
  { name: 'Transport', value: 22, color: '#6366f1' },
  { name: 'Shopping', value: 18, color: '#ec4899' },
  { name: 'Bills', value: 14, color: '#eab308' },
  { name: 'Other', value: 8, color: '#14b8a6' },
]

const areaData = [
  { m: 'Jan', v: 52000 }, { m: 'Feb', v: 48000 }, { m: 'Mar', v: 61000 },
  { m: 'Apr', v: 55000 }, { m: 'May', v: 70000 }, { m: 'Jun', v: 65000 },
]

const txItems = [
  { Icon: Utensils, name: 'Food & Dining', sub: 'Barbeque Nation', amt: '-₹850', color: '#f97316' },
  { Icon: Car, name: 'Transportation', sub: 'Auto Rickshaw', amt: '-₹80', color: '#6366f1' },
  { Icon: ShoppingBag, name: 'Shopping', sub: 'Amazon Order', amt: '-₹1,200', color: '#ec4899' },
  { Icon: Zap, name: 'Bills & Utilities', sub: 'Electricity', amt: '-₹640', color: '#eab308' },
]

const featureCards = [
  {
    Icon: MessageSquare,
    title: 'Natural Language Input',
    desc: 'Just type what you spent — the AI extracts amount, title, and category automatically.',
    chartType: 'bar',
  },
  {
    Icon: BarChart2,
    title: 'Full Analytics in Your App',
    desc: 'Get bar, line, pie or area charts grouped by day, week, month, or category on demand.',
    chartType: 'pie',
  },
  {
    Icon: TrendingUp,
    title: 'Advanced Analytics',
    desc: 'Ask for totals, averages, min/max — the AI runs the aggregation and renders a chart.',
    chartType: 'area',
  },
  {
    Icon: Search,
    title: 'Transaction History',
    desc: 'Retrieve expenses filtered by category, amount range, or date in plain English.',
    chartType: 'tx',
  },
]

/* ── Inline chart switcher (only used inside this file) ── */
const FeatureChart = ({ type }) => {
  if (type === 'bar') return (
    <ResponsiveContainer width="100%" height={75}>
      <BarChart data={barData} barSize={9}>
        <Bar dataKey="v" radius={[4, 4, 0, 0]}>
          {barData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? LIME : '#d1d5db'} />)}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )

  if (type === 'pie') return (
    <ResponsiveContainer width="100%" height={90}>
      <PieChart>
        <Pie data={pieData} cx="50%" cy="50%" innerRadius={26} outerRadius={46} dataKey="value" strokeWidth={0}>
          {pieData.map((c, i) => <Cell key={i} fill={c.color} />)}
        </Pie>
        <Tooltip formatter={(v) => [`${v}%`, '']} />
      </PieChart>
    </ResponsiveContainer>
  )

  if (type === 'area') return (
    <ResponsiveContainer width="100%" height={75}>
      <AreaChart data={areaData}>
        <defs>
          <linearGradient id="featAreaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={LIME} stopOpacity={0.4} />
            <stop offset="95%" stopColor={LIME} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="v" stroke={LIME} strokeWidth={2} fill="url(#featAreaGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )

  if (type === 'tx') return (
    <div className="space-y-2.5 mt-1">
      {txItems.map(({ Icon, name, sub, amt, color }, i) => (
        <div key={i} className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: color + '22' }}>
              <Icon className="w-3.5 h-3.5" style={{ color }} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800 leading-none">{name}</p>
              <p className="text-[10px] text-gray-400">{sub}</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-gray-700">{amt}</span>
        </div>
      ))}
    </div>
  )

  return null
}

const FeaturesSection = () => (
  <section className="max-w-5xl mx-auto px-6 py-14">
    <div className="text-center mb-10">
      <h2 className="text-3xl sm:text-4xl font-black text-gray-950">
        Control your financial future easily
      </h2>
      <p className="mt-3 text-gray-400 max-w-xl mx-auto text-sm">
        Ask the AI to track, analyse, and visualise your spending — it picks the right tool and returns a rich response.
      </p>
    </div>

    <div className="grid sm:grid-cols-2 gap-5">
      {featureCards.map(({ Icon, title, desc, chartType }, i) => (
        <div
          key={i}
          className="group rounded-2xl border border-gray-100 bg-gray-50 p-6 hover:border-gray-300 transition-colors"
        >
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5 text-gray-700" />
          </div>
          <h3 className="font-bold text-gray-900 text-lg mb-1">{title}</h3>
          <p className="text-sm text-gray-400 mb-4">{desc}</p>
          <FeatureChart type={chartType} />
        </div>
      ))}
    </div>
  </section>
)

export default FeaturesSection
