/**
 * Line icons for the LingoMous UI. Single 1.6px stroke weight, square canvas,
 * currentColor — matching the sidebar and toolbar glyphs in the design file.
 */
export type IconName =
  | 'home' | 'library' | 'plus-circle' | 'book-open' | 'cards'
  | 'heart' | 'pin' | 'dots' | 'chevron-down' | 'search' | 'close'
  | 'arrow-left' | 'arrow-right' | 'upload' | 'glasses' | 'settings'
  | 'notebook' | 'file' | 'check' | 'trash' | 'pencil' | 'plus'

interface Props {
  name: IconName
  size?: number
  filled?: boolean
  className?: string
  strokeWidth?: number
}

export default function Icon({ name, size = 20, filled = false, className = '', strokeWidth = 1.6 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      {paths(name, filled)}
    </svg>
  )
}

function paths(name: IconName, filled: boolean) {
  switch (name) {
    case 'home':
      return (
        <>
          <path d="M3.5 10.4 12 3.8l8.5 6.6V20a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5z" />
          <path d="M9.6 20.5v-5.2a.5.5 0 0 1 .5-.5h3.8a.5.5 0 0 1 .5.5v5.2" />
        </>
      )
    case 'library':
      return (
        <>
          <path d="M3.5 6.5h17" />
          <path d="M4.6 6.5v14h14.8v-14" />
          <path d="M9.5 6.5v14M14.5 6.5v14" />
        </>
      )
    case 'plus-circle':
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 8.2v7.6M8.2 12h7.6" />
        </>
      )
    case 'book-open':
      return (
        <>
          <path d="M12 6.4C10.3 5.2 8.2 4.7 5.1 4.7a.6.6 0 0 0-.6.6v12.1c0 .3.3.6.6.6 3.1 0 5.2.5 6.9 1.7" />
          <path d="M12 6.4c1.7-1.2 3.8-1.7 6.9-1.7a.6.6 0 0 1 .6.6v12.1c0 .3-.3.6-.6.6-3.1 0-5.2.5-6.9 1.7" />
          <path d="M12 6.4v13.3" />
        </>
      )
    case 'cards':
      return (
        <>
          <rect x="3.5" y="5.5" width="17" height="13" rx="1.4" />
          <path d="M7.2 9.6h7.2M7.2 12.4h9.6M7.2 15.2h5.4" />
        </>
      )
    case 'heart':
      return (
        <path
          d="M12 20.2s-7.4-4.4-7.4-9.4a4.2 4.2 0 0 1 7.4-2.7 4.2 4.2 0 0 1 7.4 2.7c0 5-7.4 9.4-7.4 9.4z"
          fill={filled ? 'currentColor' : 'none'}
        />
      )
    case 'pin':
      return (
        <>
          <path d="M14.3 3.7 20.3 9.7" />
          <path d="M16.4 5.8 11.9 8l-1.6 4.1 3.6 3.6 4.1-1.6 2.2-4.5z" />
          <path d="m10.3 13.7-6 6" />
        </>
      )
    case 'dots':
      return (
        <>
          <circle cx="12" cy="5.6" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
          <circle cx="12" cy="18.4" r="1.5" fill="currentColor" stroke="none" />
        </>
      )
    case 'chevron-down':
      return <path d="m6.5 9.5 5.5 5.5 5.5-5.5" />
    case 'search':
      return (
        <>
          <circle cx="11" cy="11" r="6.5" />
          <path d="m15.8 15.8 4.2 4.2" />
        </>
      )
    case 'close':
      return <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    case 'arrow-left':
      return (
        <>
          <path d="M19 12H5" />
          <path d="m10.5 6.5-5.5 5.5 5.5 5.5" />
        </>
      )
    case 'arrow-right':
      return (
        <>
          <path d="M5 12h14" />
          <path d="m13.5 6.5 5.5 5.5-5.5 5.5" />
        </>
      )
    case 'upload':
      return (
        <>
          <path d="M6.8 16.4A4.3 4.3 0 0 1 7.6 8a5.6 5.6 0 0 1 10.6 1.5 3.9 3.9 0 0 1 .6 7.6" />
          <path d="M12 20.5V10.2M8.6 13.4 12 10l3.4 3.4" />
        </>
      )
    case 'glasses':
      return (
        <>
          <ellipse cx="6.6" cy="13.4" rx="3.6" ry="3.1" />
          <ellipse cx="17.4" cy="13.4" rx="3.6" ry="3.1" />
          <path d="M10.2 12.8c.8-.7 2.8-.7 3.6 0" />
          <path d="M3 12.4c0-1.6.5-2.9 1.2-3.8M21 12.4c0-1.6-.5-2.9-1.2-3.8" />
        </>
      )
    case 'settings':
      return (
        <>
          <path d="m12 3.4 7 4v9.2l-7 4-7-4V7.4z" fill={filled ? 'currentColor' : 'none'} />
          <circle cx="12" cy="12" r="2.6" fill={filled ? '#F4F2E7' : 'none'} stroke={filled ? 'none' : 'currentColor'} />
        </>
      )
    case 'notebook':
      return (
        <>
          <path d="M6 3.6h12a.6.6 0 0 1 .6.6v16.2l-6.6-3.4-6.6 3.4V4.2a.6.6 0 0 1 .6-.6z" fill={filled ? 'currentColor' : 'none'} />
        </>
      )
    case 'file':
      return (
        <>
          <path d="M13.4 3.6H7.2a.6.6 0 0 0-.6.6v15.6a.6.6 0 0 0 .6.6h9.6a.6.6 0 0 0 .6-.6V7.6z" />
          <path d="M13.4 3.6v4h4" />
        </>
      )
    case 'check':
      return <path d="m5.5 12.5 4.2 4.2 8.8-9.4" />
    case 'trash':
      return (
        <>
          <path d="M4.8 6.8h14.4" />
          <path d="M9.2 6.8V4.9a.6.6 0 0 1 .6-.6h4.4a.6.6 0 0 1 .6.6v1.9" />
          <path d="M6.6 6.8 7.5 20a.6.6 0 0 0 .6.5h7.8a.6.6 0 0 0 .6-.5l.9-13.2" />
        </>
      )
    case 'pencil':
      return (
        <>
          <path d="m15.6 4.6 3.8 3.8" />
          <path d="M17.5 2.7 21.3 6.5 8 19.8l-5 1.2 1.2-5z" />
        </>
      )
    case 'plus':
      return <path d="M12 5v14M5 12h14" />
  }
}
