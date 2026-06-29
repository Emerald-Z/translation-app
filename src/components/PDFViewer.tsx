import { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import PinyinPopup from './PinyinPopup'
import { saveHighlight, getBookHighlights, type Highlight } from '../lib/highlights'

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs'

interface PopupState {
  text: string
  viewX: number
  viewY: number
  pageX: number
  pageY: number
  pageW: number
  pageH: number
}

interface TooltipState {
  highlight: Highlight
  x: number
  y: number
}

const CONTAINS_CHINESE = /[一-鿿㐀-䶿]/

interface Props {
  url: string
  bookId: string
  initialPage?: number
  onPageChange?: (page: number, totalPages: number) => void
}

export default function PDFViewer({ url, bookId, initialPage = 1, onPageChange }: Props) {
  const [numPages, setNumPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [popup, setPopup] = useState<PopupState | null>(null)
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const [zoom, setZoom] = useState(1)
  const pageWrapperRef = useRef<HTMLDivElement>(null)

  const baseWidth = Math.min(window.innerWidth - 64, 900)

  useEffect(() => {
    getBookHighlights(bookId).then(setHighlights).catch(() => {})
  }, [bookId])

  function goToPage(page: number) {
    setCurrentPage(page)
    if (numPages) onPageChange?.(page, numPages)
  }

  useEffect(() => {
    if (numPages) onPageChange?.(currentPage, numPages)
  }, [numPages])

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection()
    if (!selection || selection.isCollapsed) return
    const text = selection.toString().trim()
    if (!text || !CONTAINS_CHINESE.test(text)) return

    const range = selection.getRangeAt(0)
    const selRect = range.getBoundingClientRect()

    // Compute position relative to the page wrapper for storing
    const pageEl = pageWrapperRef.current
    const pageRect = pageEl?.getBoundingClientRect()
    const pageX = pageRect ? ((selRect.left - pageRect.left) / pageRect.width) * 100 : 0
    const pageY = pageRect ? ((selRect.top - pageRect.top) / pageRect.height) * 100 : 0
    const pageW = pageRect ? (selRect.width / pageRect.width) * 100 : 0
    const pageH = pageRect ? (selRect.height / pageRect.height) * 100 : 0

    const viewX = Math.min(selRect.left, window.innerWidth - 340)
    const viewY = Math.max(selRect.top - 8, 8)

    setPopup({ text, viewX, viewY, pageX, pageY, pageW, pageH })
    selection.removeAllRanges()
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const pageEl = pageWrapperRef.current
    if (!pageEl) return
    const rect = pageEl.getBoundingClientRect()
    const mx = ((e.clientX - rect.left) / rect.width) * 100
    const my = ((e.clientY - rect.top) / rect.height) * 100

    const hit = pageHighlights.find(
      h => mx >= h.x && mx <= h.x + h.width && my >= h.y && my <= h.y + h.height
    )
    if (hit) {
      setTooltip({ highlight: hit, x: e.clientX, y: e.clientY })
    } else {
      setTooltip(null)
    }
  }, [highlights, currentPage])

  async function handleSave(text: string, py: string, translation: string) {
    if (!popup) return
    const h = await saveHighlight({
      book_id: bookId,
      page_number: currentPage,
      text,
      pinyin: py,
      translation,
      x: popup.pageX,
      y: popup.pageY,
      width: popup.pageW,
      height: popup.pageH,
    })
    setHighlights(prev => [...prev, h])
  }

  const pageHighlights = highlights.filter(h => h.page_number === currentPage)

  return (
    <div className="flex flex-col items-center w-full" onMouseUp={handleMouseUp}>
      {/* Page navigation */}
      <div className="flex items-center gap-4 mb-4 sticky top-0 z-10 bg-gray-50 py-2 px-4 rounded-lg shadow-sm">
        <button
          onClick={() => goToPage(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 disabled:opacity-40 hover:bg-indigo-200 transition"
        >
          ← Prev
        </button>
        <span className="text-sm text-gray-600">
          Page <strong>{currentPage}</strong> of <strong>{numPages}</strong>
        </span>
        <button
          onClick={() => goToPage(Math.min(numPages, currentPage + 1))}
          disabled={currentPage >= numPages}
          className="px-3 py-1 rounded bg-indigo-100 text-indigo-700 disabled:opacity-40 hover:bg-indigo-200 transition"
        >
          Next →
        </button>

        <div className="flex items-center gap-2 ml-4 border-l border-gray-200 pl-4">
          <button
            onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
            disabled={zoom <= 0.5}
            className="w-7 h-7 rounded bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition flex items-center justify-center text-lg leading-none"
          >
            −
          </button>
          <span className="text-sm text-gray-500 w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
            disabled={zoom >= 3}
            className="w-7 h-7 rounded bg-gray-100 text-gray-600 disabled:opacity-40 hover:bg-gray-200 transition flex items-center justify-center text-lg leading-none"
          >
            +
          </button>
        </div>
      </div>

      {/* PDF + highlight overlays */}
      <div
        ref={pageWrapperRef}
        className="relative shadow-lg rounded overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex items-center justify-center h-64 text-gray-400">Loading PDF…</div>
          }
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            width={baseWidth * zoom}
          />
        </Document>

        {/* Highlight overlays — pointer-events: none so text selection still works */}
        {pageHighlights.map(h => (
          <div
            key={h.id}
            style={{
              position: 'absolute',
              left: `${h.x}%`,
              top: `${h.y}%`,
              width: `${h.width}%`,
              height: `${h.height}%`,
              backgroundColor: 'rgba(253, 224, 71, 0.45)',
              pointerEvents: 'none',
              zIndex: 4,
              borderRadius: 2,
            }}
          />
        ))}
      </div>

      {/* Hover tooltip for saved highlights */}
      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(tooltip.x + 12, window.innerWidth - 260),
            top: Math.max(tooltip.y - 8, 8),
            zIndex: 9998,
            maxWidth: 240,
            pointerEvents: 'none',
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-xl p-3"
        >
          <p className="text-lg font-medium text-gray-800 mb-0.5">{tooltip.highlight.text}</p>
          <p className="text-xs text-indigo-500 mb-1">{tooltip.highlight.pinyin}</p>
          <p className="text-sm text-gray-600">
            {tooltip.highlight.translation_override ?? tooltip.highlight.translation}
          </p>
          {tooltip.highlight.notes && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded px-2 py-1 mt-1">
              {tooltip.highlight.notes}
            </p>
          )}
        </div>
      )}

      {/* Selection popup */}
      {popup && (
        <PinyinPopup
          text={popup.text}
          x={popup.viewX}
          y={popup.viewY}
          onClose={() => setPopup(null)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
