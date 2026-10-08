import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AddedToLibrary from '../components/AddedToLibrary'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'
import ReadingModePicker from '../components/ReadingModePicker'
import { uploadBook, type Book } from '../lib/books'
import { coverFromPdf } from '../lib/cover'
import { LANGUAGES } from '../lib/languages'
import { useProfile } from '../lib/profileContext'
import type { ReadingMode } from '../lib/supabase'

export default function AddBook() {
  const { profile } = useProfile()
  const [step, setStep] = useState<1 | 2>(1)
  const [file, setFile] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [language, setLanguage] = useState('')
  const [translation, setTranslation] = useState(profile?.primary_language ?? 'en')
  const [mode, setMode] = useState<ReadingMode>('highlight')

  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [added, setAdded] = useState<Book | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (profile?.primary_language) setTranslation(profile.primary_language)
  }, [profile?.primary_language])

  async function acceptFile(next: File | undefined) {
    if (!next) return
    if (next.type !== 'application/pdf') {
      setError('That file type is not supported yet. Please choose a PDF.')
      return
    }
    setError(null)
    setFile(next)
    setTitle(next.name.replace(/\.[a-z0-9]+$/i, ''))
    const generated = await coverFromPdf(next)
    setCover(generated)
    setCoverPreview(generated ? URL.createObjectURL(generated) : null)
  }

  function clearFile() {
    setFile(null)
    setCover(null)
    setCoverPreview(null)
    setStep(1)
  }

  async function handleSubmit() {
    if (!file || !language) {
      setError('Choose the language this book is written in.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const book = await uploadBook(
        file,
        { title, author, language, translationLanguage: translation, readingMode: mode },
        cover
      )
      setAdded(book)
    } catch {
      setError('Upload failed. Check that the "pdfs" storage bucket exists and its policies allow uploads.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <h1 className="h-display">Add a Book</h1>

      {error && (
        <p className="mx-auto mt-4 max-w-[700px] rounded-xs bg-rose/40 px-3 py-2 text-sm text-[#5C0A0C]">
          {error}
        </p>
      )}

      {step === 1 ? (
        <UploadStep file={file} onFile={acceptFile} onClear={clearFile} onNext={() => setStep(2)} />
      ) : (
        <div className="mx-auto mt-[86px] w-full max-w-[700px]">
          <div className="flex gap-6">
            <div className="h-[252px] w-[190px] shrink-0 overflow-hidden bg-sand-soft shadow-card">
              {coverPreview ? (
                <img src={coverPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-3 text-center text-xs text-ink-soft">
                  No cover preview
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 rounded-xs border border-peri-soft bg-white px-3 py-1.5 text-[13px] text-ink-soft">
                <Icon name="file" size={14} />
                <span className="min-w-0 flex-1 truncate">{file?.name}</span>
                <button onClick={clearFile} aria-label="Remove file"
                  className="text-ink-soft transition hover:text-ink">
                  <Icon name="close" size={12} strokeWidth={2} />
                </button>
              </div>

              <div className="mt-[62px] space-y-4">
                <div>
                  <label className="mb-1 block text-[17px] text-ink" htmlFor="ab-title">Title</label>
                  <input id="ab-title" className="field" placeholder="Title"
                    value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[17px] text-ink" htmlFor="ab-author">Author</label>
                  <input id="ab-author" className="field" placeholder="Author"
                    value={author} onChange={e => setAuthor(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-[50px] space-y-4">
            <div>
              <label className="mb-1 block text-[17px] text-ink">Language</label>
              <Dropdown
                size="md" className="w-full" value={language} onChange={setLanguage}
                placeholder="No Language Selected"
                options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-[17px] text-ink">Translation Language</label>
              <Dropdown
                size="md" className="w-full" value={translation} onChange={setTranslation}
                placeholder="No Language Selected"
                options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))}
              />
            </div>
          </div>

          <div className="mt-[46px]">
            <p className="mb-2 text-[17px] text-ink">Reading Mode</p>
            <ReadingModePicker value={mode} onChange={setMode} />
          </div>

          <div className="mt-[38px] flex justify-end gap-4">
            <button onClick={() => setStep(1)} className="btn-secondary px-14">Back</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-secondary px-10">
              {saving ? 'Adding…' : 'Add to Library'}
            </button>
          </div>
        </div>
      )}

      {added && (
        <AddedToLibrary
          book={added}
          title={title}
          coverPreview={coverPreview}
          onHome={() => navigate('/')}
          onRead={() => navigate(`/read/${added.id}`)}
        />
      )}
    </div>
  )
}

function UploadStep({
  file, onFile, onClear, onNext,
}: {
  file: File | null
  onFile: (file: File | undefined) => void
  onClear: () => void
  onNext: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mx-auto mt-[72px] w-full max-w-[718px]">
      <p className="mb-2 text-[17px] text-ink">File Upload</p>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files[0]) }}
        className={`flex h-[318px] flex-col rounded-xs border bg-white p-6 transition
          ${dragging ? 'border-peri bg-peri-soft/20' : 'border-ink'}`}
      >
        {file ? (
          <div className="flex items-center gap-3 rounded-xs bg-[#E9EBF3] px-4 py-3">
            <Icon name="file" size={20} className="shrink-0 text-peri" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[15px] text-ink">{file.name}</span>
              <span className="block text-[12px] text-ink-soft">{formatSize(file.size)}</span>
            </span>
            <button onClick={onClear} aria-label="Remove file"
              className="shrink-0 text-ink transition hover:text-heart">
              <Icon name="close" size={18} strokeWidth={2} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => inputRef.current?.click()}
            className="flex flex-1 flex-col items-center justify-center"
          >
            <Icon name="upload" size={54} className="text-ink" strokeWidth={1.4} />
            <span className="mt-4 text-[15px] text-ink">Drag and drop files or Browse</span>
            <span className="mt-2 rounded-xs bg-peri-soft px-6 py-1 text-[12px] text-ink">
              Select File
            </span>
            <span className="mt-2 text-[11px] text-ink-soft">Supported file format: PDF</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef} type="file" accept="application/pdf" className="hidden"
        onChange={e => onFile(e.target.files?.[0])}
      />

      <div className="mt-5 flex justify-end">
        <button onClick={onNext} disabled={!file} className="btn-secondary px-14">Next</button>
      </div>
    </div>
  )
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
