import { pdfjs } from 'react-pdf'

/* Served from /public so the worker is same-origin. */
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

/**
 * pdf.js needs these to draw CJK glyphs and the standard 14 PostScript fonts.
 * Without them Chinese, Japanese and Korean pages render blank.
 * Copied into /public/pdfjs from the pdfjs-dist package.
 */
export const PDF_OPTIONS = {
  cMapUrl: '/pdfjs/cmaps/',
  cMapPacked: true,
  standardFontDataUrl: '/pdfjs/standard_fonts/',
} as const
