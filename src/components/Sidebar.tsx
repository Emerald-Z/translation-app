import { NavLink } from 'react-router-dom'
import Icon, { type IconName } from './Icon'
import mascot from '../assets/art/mascot-badge.png'

const NAV: { to: string; label: string; icon: IconName; end?: boolean }[] = [
  { to: '/', label: 'Home', icon: 'home', end: true },
  { to: '/library', label: 'Library', icon: 'library' },
  { to: '/add', label: 'Add Book', icon: 'plus-circle' },
  { to: '/read', label: 'Read', icon: 'book-open' },
  { to: '/cards', label: 'Cards', icon: 'cards' },
]

export default function Sidebar() {
  return (
    <aside className="flex w-[200px] shrink-0 flex-col bg-ink text-cream">
      <div className="flex flex-col items-center gap-2 pt-6">
        <img
          src={mascot}
          alt=""
          className="h-[88px] w-[88px] rounded-full object-cover"
        />
        <p className="font-display text-[19px] leading-none">
          <span className="text-peri-soft">Lingo</span>
          <span className="font-bold text-cream">Mous</span>
        </p>
      </div>

      <nav className="mt-[120px] flex flex-col">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-6 py-4 text-[15px] transition-colors ${
                isActive ? 'bg-peri text-white' : 'text-cream/90 hover:bg-white/[0.07]'
              }`
            }
          >
            <Icon name={item.icon} size={22} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
