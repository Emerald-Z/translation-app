import type { PDFDocumentProxy } from 'pdfjs-dist'

interface TextItem {
  str: string
  transform: number[]
  hasEOL?: boolean
}

const cache = new Map<string, string>()

/**
 * Extracts the reading text of one PDF page. Items are grouped into lines by
 * their baseline, and a blank line is inserted where the vertical gap suggests
 * a new paragraph — so translations keep the original structure.
 */
export async function getPageText(
  doc: PDFDocumentProxy,
  pageNumber: number,
  cacheKey: string
): Promise<string> {
  const key = `${cacheKey}:${pageNumber}`
  const hit = cache.get(key)
  if (hit !== undefined) return hit

  const page = await doc.getPage(pageNumber)
  const content = await page.getTextContent()
  const items = content.items as unknown as TextItem[]

  const lines: { y: number; text: string }[] = []
  for (const item of items) {
    if (!item.str) continue
    const y = Math.round(item.transform[5])
    const last = lines[lines.length - 1]
    if (last && Math.abs(last.y - y) <= 2) last.text += item.str
    else lines.push({ y, text: item.str })
  }

  const gaps = lines
    .slice(1)
    .map((l, i) => Math.abs(lines[i].y - l.y))
    .filter(g => g > 0)
  const median = gaps.length ? gaps.sort((a, b) => a - b)[Math.floor(gaps.length / 2)] : 0

  let out = ''
  lines.forEach((line, i) => {
    if (i > 0) {
      const gap = Math.abs(lines[i - 1].y - line.y)
      out += median && gap > median * 1.6 ? '\n\n' : '\n'
    }
    out += line.text.trim()
  })

  const text = out.replace(/\n{3,}/g, '\n\n').trim()
  cache.set(key, text)
  return text
}
