import { Link } from 'react-router-dom'
import AuthLayout from '../../components/AuthLayout'

export default function Intro() {
  return (
    <AuthLayout>
      <p className="font-display text-[28px] leading-none">
        <span className="font-bold text-peri">Lingo</span>
        <span className="font-bold text-olive">Mous</span>
      </p>
      <p className="mt-2 text-sm text-ink">Sign up or log in to begin reading</p>

      <div className="mt-12 flex flex-col gap-3">
        <Link to="/login" className="btn-primary text-center">Login</Link>
        <Link to="/signup" className="btn-primary text-center">Sign Up</Link>
      </div>
    </AuthLayout>
  )
}
