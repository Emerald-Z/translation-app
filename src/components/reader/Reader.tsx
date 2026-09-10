import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Document, Page } from 'react-pdf'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import 'react-pdf/dist/Page/TextLayer.css'
import 'react-pdf/dist/Page/AnnotationLayer.css'

import BookPanel from './BookPanel'
import ReaderTopBar from './ReaderTopBar'
import ReaderToolbar from './ReaderToolbar'
import SettingsPanel from './SettingsPanel'
import TranslatedPane from './TranslatedPane'
import Dropdown from '../Dropdown'
import Icon from '../Icon'
import PhoneticPopup from '../PhoneticPopup'
import { saveLastPage, setReadingMode, setTranslationLanguage, readingMode, type Book } from '../../lib/books'
import { listBookCards, saveCard, setPinned, type Card } from '../../lib/cards'
import { LANGUAGES, languageLabel } from '../../lib/languages'
import { getPageText } from '../../lib/pdfText'
import { PDF_OPTIONS } from '../../lib/pdf'
import { hasTargetChars } from '../../lib/phonetics'
import { useReaderSettings } from '../../lib/readerSettings'
import type { ReadingMode } from '../../lib/supabase'

interface Props {
  book: Book
  url: string
}

interface Selection {
  text: string
  viewX: number
  viewY: number
  page: number
  x: number
  y: number
  width: number
  height: number
}

const MODES: { value: ReadingMode; label: string }[] = [
  { value: 'highlight', label: 'Highlight' },
  { value: 'side-by-side', label: 'Side-by-side' },
  { value: 'translated', label: 'Translated' },
]

export default function Reader({ book, url }: Props) {
  const { settings, update } = useReaderSettings()

  const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
  const [numPages, setNumPages] = useState(book.total_pages ?? 0)
  const [page, setPage] = useState(Math.max(1, book.last_page || 1))
  const [mode, setMode] = useState<ReadingMode>(readingMode(book))
  const [target, setTarget] = useState(book.translation_language ?? 'en')

  const [cards, setCards] = useState<Card[]>([])
  const [selection, setSelection] = useState<Selection | null>(null)
  const [tooltip, setTooltip] = useState<{ card: Card; x: number; y: number } | null>(null)
  const [panel, setPanel] = useState<'none' | 'settings' | 'book'>('none')
  const [pageText, setPageText] = useState('')

  const surfaceRef = useRef<HTMLDivElement>(null)
  const [surfaceWidth, setSurfaceWidth] = useState(1000)

  /* Continuous scrolling only makes sense against the original page images. */
  const layout = mode === 'highlight' ? settings.layout : 'single'

  useEffect(() => {
    listBookCards(book.id).then(setCards).catch(() => {})
  }, [book.id])

  useEffect(() => {
    const el = surfaceRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setSurfaceWidth(entry.contentRect.width))
    observer.observe(el)
    setSurfaceWidth(el.clientWidth)
    return () => observer.disconnect()
  }, [])

  /* Persist reading position, capped to the document length. */
  useEffect(() => {
    if (!numPages) return
    const clamped = Math.min(Math.max(1, page), numPages)
    saveLastPage(book.id, clamped, numPages)
  }, [book.id, page, numPages])

  /* Pull the text of the current page for the translated views. */
  useEffect(() => {
    if (!doc || mode === 'highlight') return
    let cancelled = false
    getPageText(doc, page, book.id)
      .then(text => { if (!cancelled) setPageText(text) })
      .catch(() => { if (!cancelled) setPageText('') })
    return () => { cancelled = true }
  }, [doc, page, mode, book.id])

  const pageWidth = useMemo(() => {
    const available = Math.max(320, surfaceWidth - 96)
    const base = mode === 'side-by-side' ? (available - 24) / 2 : Math.min(available, 1030)
    return base * settings.pageScale
  }, [surfaceWidth, mode, settings.pageScale])

  const goToPage = useCallback((next: number) => {
    setPage(p => {
      const limit = numPages || p
      return Math.min(Math.max(1, next), limit)
    })
  }, [numPages])

  async function changeMode(next: ReadingMode) {
    setMode(next)
    await setReadingMode(book.id, next)
  }

  async function changeTarget(next: string) {
    setTarget(next)
    await setTranslationLanguage(book.id, next)
  }

  const handleMouseUp = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed) return
    const text = sel.toString().trim()
    if (!text || !hasTargetChars(text, book.language)) return

    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()

    const host = (range.startContainer.parentElement as HTMLElement | null)
      ?.closest('[data-page]') as HTMLElement | null
    const hostRect = host?.getBoundingClientRect()
    const pageNumber = host ? Number(host.dataset.page) : page

    setSelection({
      text,
      viewX: Math.min(rect.left, window.innerWidth - 340),
      viewY: Math.max(rect.top - 8, 8),
      page: pageNumber,
      x: hostRect ? ((rect.left - hostRect.left) / hostRect.width) * 100 : 0,
      y: hostRect ? ((rect.top - hostRect.top) / hostRect.height) * 100 : 0,
      width: hostRect ? (rect.width / hostRect.width) * 100 : 0,
      height: hostRect ? (rect.height / hostRect.height) * 100 : 0,
    })
    sel.removeAllRanges()
  }, [book.language, page])

  async function handleSaveCard(text: string, phonetic: string, translation: string) {
    if (!selection) return
    const card = await saveCard({
      book_id: book.id,
      page_number: selection.page,
      text,
      pinyin: phonetic,
      translation,
      x: selection.x,
      y: selection.y,
      width: selection.width,
      height: selection.height,
    })
    setCards(cs => [...cs, card])
  }

  async function togglePin(card: Card) {
    const next = !card.pinned
    setCards(cs => cs.map(c => (c.id === card.id ? { ...c, pinned: next } : c)))
    await setPinned(card.id, next)
  }

  const pageFilter = `brightness(${settings.brightness}%)`
  const themeClass =
    settings.theme === 'sepia' ? 'page-theme-sepia'
    : settings.theme === 'dark' ? 'page-theme-dark'
    : ''

  function renderPage(pageNumber: number) {
    const pageCards = cards.filter(c => c.page_number === pageNumber)
    return (
      <div
        key={pageNumber}
        data-page={pageNumber}
        className={`relative shadow-panel ${themeClass}`}
        style={{ filter: pageFilter }}
        onMouseMove={e => {
          const host = e.currentTarget.getBoundingClientRect()
          const mx = ((e.clientX - host.left) / host.width) * 100
          const my = ((e.clientY - host.top) / host.height) * 100
          const hit = pageCards.find(
            c => mx >= c.x && mx <= c.x + c.width && my >= c.y && my <= c.y + c.height
          )
          setTooltip(hit ? { card: hit, x: e.clientX, y: e.clientY } : null)
        }}
        onMouseLeave={() => setTooltip(null)}
      >
        <Page
          pageNumber={pageNumber}
          width={pageWidth}
          renderTextLayer
          renderAnnotationLayer={false}
          loading={
            <div
              className="flex items-center justify-center bg-white text-sm text-ink-soft"
              style={{ width: pageWidth, height: pageWidth * 1.4 }}
            >
              Loading page…
            </div>
          }
        />
        {pageCards.map(card => (
          <div
            key={card.id}
            style={{
              position: 'absolute',
              left: `${card.x}%`,
              top: `${card.y}%`,
              width: `${card.width}%`,
              height: `${card.height}%`,
              background: settings.highlightColor,
              mixBlendMode: 'multiply',
              borderRadius: 2,
              pointerEvents: 'none',
              zIndex: 4,
            }}
          />
        ))}
      </div>
    )
  }

  const progress = numPages ? Math.round((page / numPages) * 100) : 0

  return (
    <div className="flex h-screen flex-col bg-canvas">
      <ReaderTopBar
        book={book}
        panelOpen={panel === 'book'}
        onTogglePanel={() => setPanel(p => (p === 'book' ? 'none' : 'book'))}
      />

      <div className="relative min-h-0 flex-1">
        <div
          ref={surfaceRef}
          className="scroll-slim h-full overflow-y-auto pb-24"
          onMouseUp={handleMouseUp}
        >
          <div className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-canvas px-8 py-4">
            <div className="flex-1" />

            <div className="flex items-center gap-3 rounded-xs bg-white px-3 py-2 shadow-card">
              <span className="chip">{languageLabel(book.language)}</span>
              <span className="text-ink">⟶</span>
              <Dropdown
                value={target}
                onChange={changeTarget}
                options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))}
                className="w-[130px]"
              />
            </div>

            <div className="flex flex-1 justify-end">
              <Dropdown
                value={mode}
                onChange={v => changeMode(v as ReadingMode)}
                options={MODES}
                className="w-[150px]"
              />
            </div>
          </div>

          <Document
            file={url}
            options={PDF_OPTIONS}
            onLoadSuccess={pdf => {
              setDoc(pdf)
              setNumPages(pdf.numPages)
              // A stored position can outrun the file (shorter re-upload, stale
              // total_pages). Clamp before pdf.js is asked for a missing page.
              setPage(p => Math.min(Math.max(1, p), pdf.numPages))
            }}
            loading={
              <div className="flex h-64 items-center justify-center text-sm text-ink-soft">
                Loading book…
              </div>
            }
            error={
              <div className="flex h-64 items-center justify-center text-sm text-ink-soft">
                This book could not be opened.
              </div>
            }
          >
            {layout === 'continuous' ? (
              <div className="flex flex-col items-center gap-6 px-8">
                {Array.from({ length: numPages }, (_, i) => renderPage(i + 1))}
              </div>
            ) : mode === 'side-by-side' ? (
              <div className="relative flex items-stretch justify-center gap-6 px-8">
                {renderPage(page)}
                <div style={{ width: pageWidth }} className="flex">
                  <TranslatedPane
                    text={pageText}
                    from={book.language}
                    to={target}
                    fontScale={settings.fontScale}
                    className="w-full shadow-panel"
                  />
                </div>

                {/* Page controls sit in the gutter between the two pages. */}
                <div className="pointer-events-none absolute inset-x-0 top-16 flex justify-center">
                  <div className="pointer-events-auto flex flex-col gap-2">
                    <button
                      onClick={() => goToPage(page + 1)}
                      disabled={!numPages || page >= numPages}
                      aria-label="Next page"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-olive text-cream transition hover:bg-ink disabled:opacity-30"
                    >
                      <Icon name="arrow-right" size={17} />
                    </button>
                    <button
                      onClick={() => goToPage(page - 1)}
                      disabled={page <= 1}
                      aria-label="Previous page"
                      className="flex h-9 w-9 items-center justify-center rounded-full bg-olive text-cream transition hover:bg-ink disabled:opacity-30"
                    >
                      <Icon name="arrow-left" size={17} />
                    </button>
                  </div>
                </div>
              </div>
            ) : mode === 'translated' ? (
              <div className="flex justify-center px-8">
                <div style={{ width: pageWidth }} className="flex">
                  <TranslatedPane
                    text={pageText}
                    from={book.language}
                    to={target}
                    fontScale={settings.fontScale}
                    className="w-full shadow-panel"
                  />
                </div>
              </div>
            ) : (
              <div className="flex justify-center px-8">{renderPage(page)}</div>
            )}
          </Document>
        </div>

        {settings.showProgress && numPages > 0 && (
          <div className="pointer-events-none absolute inset-x-0 bottom-[54px] z-10 h-[3px] bg-black/5">
            <div className="h-full bg-peri/70" style={{ width: `${progress}%` }} />
          </div>
        )}

        <ReaderToolbar
          page={page}
          totalPages={numPages}
          onPage={goToPage}
          phonetics={settings.phonetics}
          onTogglePhonetics={() => update('phonetics', !settings.phonetics)}
          settingsOpen={panel === 'settings'}
          onToggleSettings={() => setPanel(p => (p === 'settings' ? 'none' : 'settings'))}
        />

        {panel === 'settings' && (
          <SettingsPanel settings={settings} update={update} onClose={() => setPanel('none')} />
        )}

        {panel === 'book' && (
          <BookPanel
            book={{ ...book, last_page: page, total_pages: numPages || book.total_pages }}
            cards={cards}
            onTogglePin={togglePin}
            onGoToCard={card => { goToPage(card.page_number); setPanel('none') }}
            onClose={() => setPanel('none')}
          />
        )}
      </div>

      {tooltip && (
        <div
          style={{
            position: 'fixed',
            left: Math.min(tooltip.x + 12, window.innerWidth - 270),
            top: Math.max(tooltip.y - 8, 8),
            zIndex: 55,
            maxWidth: 250,
            pointerEvents: 'none',
          }}
          className="rounded-xs border border-line bg-white p-3 shadow-panel"
        >
          <p className="text-[15px] text-ink">{tooltip.card.text}</p>
          {settings.phonetics && tooltip.card.pinyin && (
            <p className="mt-0.5 text-[11px] text-peri">{tooltip.card.pinyin}</p>
          )}
          <p className="mt-1 text-[13px] italic text-ink-soft">
            {tooltip.card.translation_override ?? tooltip.card.translation}
          </p>
          {tooltip.card.notes && (
            <p className="mt-2 rounded-xs bg-cream px-2 py-1 text-[11px] text-olive">
              {tooltip.card.notes}
            </p>
          )}
        </div>
      )}

      {selection && (
        <PhoneticPopup
          text={selection.text}
          language={book.language}
          target={target}
          showPhonetics={settings.phonetics}
          x={selection.viewX}
          y={selection.viewY}
          onClose={() => setSelection(null)}
          onSave={handleSaveCard}
        />
      )}
    </div>
  )
}
