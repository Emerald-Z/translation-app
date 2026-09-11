/**
 * Collapses the dynamic segments of a route before Vercel Analytics records it.
 *
 * Without this, every book and collection id becomes its own row in the
 * dashboard, which buries the page-level numbers and copies internal ids into
 * a third-party service. `/read/8f3c…` is reported as `/read/[bookId]`.
 */
const ROUTES: [RegExp, string][] = [
  [/^\/read\/[^/]+$/, '/read/[bookId]'],
  [/^\/cards\/book\/[^/]+$/, '/cards/book/[bookId]'],
  [/^\/cards\/collections\/[^/]+$/, '/cards/collections/[collectionId]'],
  [/^\/cards\/language\/[^/]+$/, '/cards/language/[code]'],
]

export function normalizePath(pathname: string): string {
  for (const [pattern, label] of ROUTES) {
    if (pattern.test(pathname)) return label
  }
  return pathname
}

export function beforeSend<T extends { url: string }>(event: T): T {
  try {
    const url = new URL(event.url)
    url.pathname = normalizePath(url.pathname)
    // Query strings here only ever carry UI state, so drop them.
    url.search = ''
    return { ...event, url: url.toString() }
  } catch {
    return event
  }
}
