import scene from '../assets/art/reading-room.png'

/** The illustrated reading room shared by every signed-out screen. */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-cream px-4 py-10">
      <img
        src={scene}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-bottom"
      />
      <div className="relative w-full max-w-[420px] bg-sand-soft px-10 py-9 shadow-panel">
        {children}
      </div>
    </div>
  )
}
