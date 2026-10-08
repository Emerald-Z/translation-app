import { Link, NavLink } from 'react-router-dom'
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
      <Link
        to="/"
        aria-label="LingoMous home"
        className="flex flex-col items-center pt-7 transition hover:opacity-90"
      >
        <img src={mascot} alt="" className="h-20 w-20 rounded-full object-cover" />
        <p className="mt-3 font-display text-[19px] leading-none">
          <span className="text-peri-soft">Lingo</span>
          <span className="font-bold text-cream">Mous</span>
        </p>
      </Link>

      {/* First row starts at y=304; rows are 64 tall. */}
      <nav className="mt-[165px] flex flex-col">
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex h-16 items-center gap-3 px-6 text-[15px] transition-colors ${
                isActive ? 'bg-peri text-white' : 'text-cream/90 hover:bg-ink-hover'
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
