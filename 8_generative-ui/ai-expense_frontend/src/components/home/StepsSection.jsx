import { Users, Wallet, Plus, BarChart2 } from 'lucide-react'

const steps = [
  { Icon: Users, label: 'Sign Up' },
  { Icon: Wallet, label: 'Chat with AI' },
  { Icon: Plus, label: 'Add Expenses' },
  { Icon: BarChart2, label: 'Get Insights' },
]

const LIME = '#b5ff2d'

const StepsSection = () => (
  <section
    className="mx-4 sm:mx-8 rounded-3xl py-10 px-8 sm:px-16 mb-12"
    style={{ background: '#111' }}
  >
    <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">
      Steps to use our service
    </h2>
    <p className="text-gray-400 text-sm mb-8 max-w-sm">
      Start tracking smarter in minutes — no setup needed, just sign up and start chatting.
    </p>

    <div className="relative">
      {/* Dotted connector line */}
      <div className="absolute top-3.5 left-0 right-0 h-px border-t-2 border-dashed border-gray-600" />

      <div className="grid grid-cols-4 gap-4 relative">
        {steps.map(({ Icon, label }, i) => (
          <div key={i} className="flex flex-col items-start group">
            {/* Dot on the timeline */}
            <div className="relative z-10 w-7 h-7 rounded-full bg-white border-4 border-gray-900 mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: LIME }} />
            </div>
            {/* Step icon */}
            <div
              className="w-9 h-9 rounded-xl mb-2 flex items-center justify-center"
              style={{ background: '#ffffff15' }}
            >
              <Icon className="w-4 h-4 text-white" />
            </div>
            <p className="text-white font-bold text-sm">{label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
)

export default StepsSection
