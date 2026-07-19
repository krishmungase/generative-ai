import { Outlet, useLocation } from 'react-router'
import { Header } from '@/components'

const AppLayout = () => {
  const location = useLocation()
  const showHeader = location.pathname !== '/chat'

  return (
    <div className="flex flex-col h-screen">
      {showHeader && <Header />}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
