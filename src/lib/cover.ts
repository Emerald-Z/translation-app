import { pdfjs } from 'react-pdf'
import { PDF_OPTIONS } from './pdf'

/**
 * Renders page 1 of a PDF to a JPEG so books get a real cover in the library.
 * Returns null if the file cannot be rendered — callers fall back to a
 * typographic placeholder.
 */
export async function coverFromPdf(file: File, maxWidth = 480): Promise<File | null> {
  try {
    const buffer = await file.arrayBuffer()
    const doc = await pdfjs.getDocument({ data: buffer, ...PDF_OPTIONS }).promise
    const page = await doc.getPage(1)

    const base = page.getViewport({ scale: 1 })
    const viewport = page.getViewport({ scale: Math.min(2, maxWidth / base.width) })

    const canvas = document.createElement('canvas')
    canvas.width = Math.round(viewport.width)
    canvas.height = Math.round(viewport.height)
    const context = canvas.getContext('2d')
    if (!context) return null

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: context, viewport, canvas }).promise

    const blob = await new Promise<Blob | null>(resolve =>
      canvas.toBlob(resolve, 'image/jpeg', 0.82)
    )
    if (!blob) return null
    return new File([blob], 'cover.jpg', { type: 'image/jpeg' })
  } catch {
    return null
  }
}
