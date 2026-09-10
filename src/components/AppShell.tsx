import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import ProfileMenu from './ProfileMenu'

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 justify-end px-8 pt-4">
          <ProfileMenu />
        </header>
        <main className="min-w-0 flex-1 px-12 pb-16 pt-3">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
