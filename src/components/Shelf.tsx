/**
 * The wooden shelf that sits under a row of book covers on Home and Library.
 * Drawn in CSS: a plank with a short leg dropping at each end.
 */
export default function Shelf({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-[46px] w-full ${className}`} aria-hidden="true">
      <div className="h-3 w-full bg-wood" />
      <div className="absolute left-4 top-3 h-8 w-4 bg-wood" />
      <div className="absolute right-4 top-3 h-8 w-4 bg-wood" />
    </div>
  )
}
