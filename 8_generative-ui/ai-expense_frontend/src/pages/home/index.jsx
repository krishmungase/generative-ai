import { useNavigate } from 'react-router'
import { pageTitle } from '@/constants'
import { usePageTitle } from '@/hooks'
import { ArrowRight } from 'lucide-react'

import HeroSection from '@/components/home/HeroSection'
import FeaturesSection from '@/components/home/FeaturesSection'
import StepsSection from '@/components/home/StepsSection'
import FaqSection from '@/components/home/FaqSection'

const LIME = '#b5ff2d'

const HomePage = () => {
  usePageTitle({ title: pageTitle.HOME_PAGE })
  const navigate = useNavigate()

  return (
    <div className="bg-white text-gray-900 overflow-x-hidden">

      <HeroSection />

      <FeaturesSection />

      <StepsSection />

      <FaqSection />

      {/* Footer CTA */}
      <section className="text-center px-6 py-10 border-t border-gray-100">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-950 mb-2">
          Open an account in 10 minutes
        </h2>
        <p className="text-gray-400 max-w-md mx-auto mb-6 text-sm">
          Chat with the AI assistant, add your first expense, and see your finances come alive.
        </p>
        <div className="flex justify-center gap-4">
          <button
            id="footer-open-btn"
            onClick={() => navigate('/chat')}
            className="group flex items-center gap-2 rounded-xl px-8 py-3.5 font-bold text-sm text-gray-900"
            style={{ background: LIME }}
          >
            Open Account
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            id="footer-demo-btn"
            onClick={() => navigate('/chat')}
            className="rounded-xl border border-gray-300 px-8 py-3.5 font-bold text-sm text-gray-700 hover:bg-gray-50"
          >
            No thanks
          </button>
        </div>
      </section>

    </div>
  )
}

export default HomePage
