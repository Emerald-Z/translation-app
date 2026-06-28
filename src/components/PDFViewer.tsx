import { useState, useCallback, useRef, useEffect } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import PinyinPopup from './PinyinPopup'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjs.GlobalWorkerOptions.workerSrc = pdfWorkerUrl

interface PopupState {
  text: string
  x: number
  y: number
}

const CONTAINS_CHINESE = /[一-鿿㐀-䶿]/

interface Props {
  url: string
  initialPage?: number
  onPageChange?: (page: number, totalPages: number) => void
}

export default function PDFViewer({ url, initialPage = 1, onPageChange }: Props) {
  const [numPages, setNumPages] = useState<number>(0)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [popup, setPopup] = useState<PopupState | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
    const rect = range.getBoundingClientRect()

    const popupX = Math.min(rect.left, window.innerWidth - 340)
    const popupY = Math.max(rect.top - 8, 8)

    setPopup({ text, x: popupX, y: popupY })
    selection.removeAllRanges()
  }, [])

  return (
    <div className="flex flex-col items-center w-full" onMouseUp={handleMouseUp}>
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
      </div>

      <div ref={containerRef} className="shadow-lg rounded overflow-hidden">
        <Document
          file={url}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          loading={
            <div className="flex items-center justify-center h-64 text-gray-400">
              Loading PDF…
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            renderTextLayer={true}
            renderAnnotationLayer={false}
            width={Math.min(window.innerWidth - 64, 900)}
          />
        </Document>
      </div>

      {popup && (
        <PinyinPopup
          text={popup.text}
          x={popup.x}
          y={popup.y}
          onClose={() => setPopup(null)}
        />
      )}
    </div>
  )
}
