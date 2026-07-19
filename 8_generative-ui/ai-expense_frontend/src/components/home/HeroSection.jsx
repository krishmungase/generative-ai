import { useNavigate } from 'react-router'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import {
  ArrowRight,
  Play,
  Users,
  CreditCard,
  ArrowUpRight,
  Zap,
  ChevronDown,
} from 'lucide-react'

const LIME = '#b5ff2d'

const weeklyData = [
  { day: 'Mon', amount: 320 },
  { day: 'Tue', amount: 580 },
  { day: 'Wed', amount: 210 },
  { day: 'Thu', amount: 870 },
  { day: 'Fri', amount: 450 },
  { day: 'Sat', amount: 720 },
  { day: 'Sun', amount: 390 },
]

const HeroSection = () => {
  const navigate = useNavigate()
  return (
    <section className="max-w-6xl mx-auto px-6 pt-12 pb-10 grid lg:grid-cols-2 gap-10 items-center">

    {/* Left – copy */}
    <div>

      <h1 className="text-4xl sm:text-5xl font-black leading-[1.05] tracking-tight text-gray-950">
        Take Control of Your Finances with{' '}
        <span className="px-1 rounded" style={{ background: LIME }}>AI-Powered</span>{' '}
        Tracking
      </h1>

      <p className="mt-4 text-gray-500 max-w-md leading-relaxed">
        Track, analyse, and understand your spending through natural conversation.
        No spreadsheets. No manual entry. Just chat.
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        <button
          id="hero-try-btn"
          onClick={() => navigate('/chat')}
          className="group flex items-center gap-2 rounded-xl px-6 py-3 font-bold text-sm text-gray-900 transition hover:opacity-90 active:scale-95"
          style={{ background: LIME }}
        >
          Try for free
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
        <button
          id="hero-preview-btn"
          onClick={() => navigate('/chat')}
          className="group flex items-center gap-2 rounded-xl border border-gray-300 px-6 py-3 font-bold text-sm text-gray-700 hover:bg-gray-50 transition"
        >
          <Play className="w-4 h-4 fill-current" />
          Preview
        </button>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <div className="flex -space-x-2">
          {['#6366f1', '#f97316', '#14b8a6'].map((bg, i) => (
            <div
              key={i}
              className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center"
              style={{ background: bg }}
            >
              <Users className="w-4 h-4 text-white" />
            </div>
          ))}
        </div>
        <div>
          <p className="font-black text-2xl leading-none">10k+</p>
          <p className="text-gray-400 text-xs">trusted users</p>
        </div>
      </div>
    </div>

    {/* Right – floating UI cards */}
    <div className="relative flex justify-center lg:justify-end pb-8 pt-2">

      {/* Expense chart card */}
      <div className="relative rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-200 p-5 w-full h-auto">
        <div className="flex justify-between items-center mb-3">
          <p className="font-bold text-sm">Expense Chart</p>
          <span className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-500 flex items-center gap-1">
            Weekly <ChevronDown className="w-3 h-3" />
          </span>
        </div>

        <ResponsiveContainer width="100%" height={90}>
          <AreaChart data={weeklyData}>
            <defs>
              <linearGradient id="heroAreaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={LIME} stopOpacity={0.35} />
                <stop offset="95%" stopColor={LIME} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
            <YAxis hide />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8, border: '1px solid #e5e7eb' }}
              formatter={(v) => [`₹${v}`, 'Spent']}
            />
            <Area
              type="monotone"
              dataKey="amount"
              stroke={LIME}
              strokeWidth={2.5}
              fill="url(#heroAreaGrad)"
              dot={false}
              activeDot={{ r: 4, fill: LIME }}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Floating badge */}
        <div className="absolute top-12 right-4 rounded-xl bg-white border border-gray-100 shadow-lg px-3 py-2 flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center">
            <Zap className="w-3 h-3 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold">Internet</p>
            <p className="text-[10px] text-gray-400">₹36.00 / Month</p>
          </div>
          <span className="ml-1 rounded-full bg-red-100 text-red-500 text-[9px] font-bold px-2 py-0.5">Due</span>
        </div>
      </div>

      {/* Balance card */}
      <div className="absolute -bottom-2 left-0 lg:-left-6 rounded-2xl border border-gray-100 bg-white shadow-xl px-5 py-4 w-56">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-gray-500" />
            <p className="text-xs font-semibold text-gray-600">Your Balance</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <p className="text-2xl font-black">₹16,648</p>
          <span className="text-xs font-bold rounded-full px-2 py-0.5 text-green-800" style={{ background: LIME }}>+4%</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Receive <span className="text-green-600 font-semibold">₹3,650.00</span> this month.
        </p>
      </div>
    </div>
  </section>
  )
}

export default HeroSection
