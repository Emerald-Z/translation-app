import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import ProfileMenu from './ProfileMenu'

export default function AppShell() {
  return (
    <div className="flex min-h-screen bg-cream">
      <Sidebar />
      {/* The profile chip overlaps the content band rather than pushing it down,
          so page headings start at the y the design specifies. */}
      <div className="relative min-w-0 flex-1">
        <div className="absolute right-6 top-6 z-30">
          <ProfileMenu />
        </div>
        <main className="min-w-0 px-[50px] pb-16 pt-[53px]">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
