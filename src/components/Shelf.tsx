/**
 * The wooden shelf that sits under a row of book covers on Home and Library.
 * Drawn in CSS: a plank with a short leg dropping at each end.
 */
export default function Shelf({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-[52px] w-full ${className}`} aria-hidden="true">
      <div className="h-4 w-full bg-wood" />
      <div className="absolute left-5 top-4 h-9 w-5 bg-wood" />
      <div className="absolute right-5 top-4 h-9 w-5 bg-wood" />
    </div>
  )
}
