export default function EmptyState({
  children,
  className = '',
  tinted = false,
}: {
  children: React.ReactNode
  className?: string
  tinted?: boolean
}) {
  return (
    <div
      className={`flex items-center justify-center rounded-xs text-sm text-ink ${
        tinted ? 'bg-[#F7F5EA]' : ''
      } ${className}`}
    >
      {children}
    </div>
  )
}
