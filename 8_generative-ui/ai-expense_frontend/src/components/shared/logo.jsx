import { Wallet } from 'lucide-react'
import { appEnv } from '@/constants'

const Logo = () => {
  return (
    <div className="flex items-center justify-center gap-2">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-black" style={{ background: '#b5ff2d' }}>
        <Wallet className="w-4 h-4" />
      </div>
      <h1 className="font-black text-[16px] tracking-tight text-gray-900">{appEnv.APP_NAME}</h1>
    </div>
  )
}

export default Logo
