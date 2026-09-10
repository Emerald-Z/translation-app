import { getLanguage } from './languages'

const cache = new Map<string, string>()

/** Translate `text` from `from` into `to` using the public Google endpoint. */
export async function translate(text: string, from: string, to = 'en'): Promise<string> {
  const key = `${from}>${to}:${text}`
  const hit = cache.get(key)
  if (hit !== undefined) return hit

  const sl = getLanguage(from).googleCode
  const tl = getLanguage(to).googleCode
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sl}&tl=${tl}&dt=t&q=` +
    encodeURIComponent(text)

  const res = await fetch(url)
  if (!res.ok) throw new Error('Translation request failed')
  const data = await res.json()
  const out = (data[0] as [string, string][]).map(seg => seg[0]).join('')
  cache.set(key, out)
  return out
}

/**
 * Translate a long passage by splitting it into chunks the endpoint accepts,
 * then re-joining. Paragraph breaks are preserved.
 */
export async function translatePassage(text: string, from: string, to = 'en'): Promise<string> {
  const paragraphs = text.split(/\n{2,}/).filter(p => p.trim())
  const out: string[] = []
  for (const paragraph of paragraphs) {
    const chunks = chunk(paragraph, 1200)
    const parts: string[] = []
    for (const c of chunks) parts.push(await translate(c, from, to))
    out.push(parts.join(''))
  }
  return out.join('\n\n')
}

function chunk(text: string, size: number): string[] {
  if (text.length <= size) return [text]
  const out: string[] = []
  let rest = text
  while (rest.length > size) {
    // Prefer to break on sentence punctuation so the translation stays coherent.
    const window = rest.slice(0, size)
    const cut = Math.max(
      window.lastIndexOf('。'), window.lastIndexOf('.'),
      window.lastIndexOf('！'), window.lastIndexOf('？'),
      window.lastIndexOf('\n'), window.lastIndexOf(' ')
    )
    const at = cut > size * 0.5 ? cut + 1 : size
    out.push(rest.slice(0, at))
    rest = rest.slice(at)
  }
  if (rest) out.push(rest)
  return out
}
