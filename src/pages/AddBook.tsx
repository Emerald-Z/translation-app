import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import ReadingModePicker from '../components/ReadingModePicker'
import { uploadBook } from '../lib/books'
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
  const [done, setDone] = useState(false)
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

  async function handleSubmit() {
    if (!file || !language) {
      setError('Choose the language this book is written in.')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await uploadBook(
        file,
        { title, author, language, translationLanguage: translation, readingMode: mode },
        cover
      )
      setDone(true)
    } catch {
      setError('Upload failed. Check that the "pdfs" storage bucket exists and its policies allow uploads.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-[1000px]">
      <h1 className="h-display">Add a Book</h1>

      {error && (
        <p className="mt-4 max-w-[640px] rounded-xs bg-rose/40 px-3 py-2 text-sm text-[#5C0A0C]">
          {error}
        </p>
      )}

      {step === 1 ? (
        <UploadStep
          file={file}
          onFile={acceptFile}
          onNext={() => setStep(2)}
        />
      ) : (
        <div className="mt-8">
          <div className="flex gap-6">
            <div className="h-[248px] w-[186px] shrink-0 overflow-hidden bg-sand-soft shadow-card">
              {coverPreview ? (
                <img src={coverPreview} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center px-3 text-center text-xs text-ink-soft">
                  No cover preview
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 rounded-xs border border-peri-soft bg-white px-3 py-2 text-sm text-ink-soft">
                <Icon name="file" size={15} />
                <span className="min-w-0 flex-1 truncate">{file?.name}</span>
                <button
                  onClick={() => { setFile(null); setCover(null); setCoverPreview(null); setStep(1) }}
                  aria-label="Remove file"
                  className="text-ink-soft transition hover:text-ink"
                >
                  <Icon name="close" size={13} strokeWidth={2} />
                </button>
              </div>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1 block text-[15px] text-ink" htmlFor="ab-title">Title</label>
                  <input id="ab-title" className="field" placeholder="Title"
                    value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                  <label className="mb-1 block text-[15px] text-ink" htmlFor="ab-author">Author</label>
                  <input id="ab-author" className="field" placeholder="Author"
                    value={author} onChange={e => setAuthor(e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className="mb-1 block text-[15px] text-ink">Language</label>
              <Dropdown
                size="md" className="w-full" value={language} onChange={setLanguage}
                placeholder="No Language Selected"
                options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))}
              />
            </div>
            <div>
              <label className="mb-1 block text-[15px] text-ink">Translation Language</label>
              <Dropdown
                size="md" className="w-full" value={translation} onChange={setTranslation}
                placeholder="No Language Selected"
                options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))}
              />
            </div>
          </div>

          <div className="mt-6">
            <p className="mb-2 text-[15px] text-ink">Reading Mode</p>
            <ReadingModePicker value={mode} onChange={setMode} />
          </div>

          <div className="mt-7 flex justify-end gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button onClick={handleSubmit} disabled={saving} className="btn-primary">
              {saving ? 'Adding…' : 'Add to Library'}
            </button>
          </div>
        </div>
      )}

      {done && (
        <Modal onClose={() => navigate('/library')} width={620}>
          <div className="py-4 text-center">
            <h2 className="font-display text-[22px] font-bold text-ink">Added to your library</h2>
            <p className="mt-2 text-sm text-ink">
              <strong>{title}</strong> is ready to read.
            </p>
            <div className="mt-7 flex justify-center gap-3">
              <button
                onClick={() => {
                  setDone(false); setStep(1); setFile(null); setCover(null)
                  setCoverPreview(null); setTitle(''); setAuthor(''); setLanguage('')
                }}
                className="btn-secondary"
              >
                Add another
              </button>
              <button onClick={() => navigate('/library')} className="btn-primary">
                Go to Library
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

function UploadStep({
  file, onFile, onNext,
}: {
  file: File | null
  onFile: (file: File | undefined) => void
  onNext: () => void
}) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <div className="mt-8 max-w-[640px]">
      <p className="mb-2 text-[15px] text-ink">File Upload</p>

      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files[0]) }}
        onClick={() => inputRef.current?.click()}
        className={`flex h-[256px] cursor-pointer flex-col items-center justify-center rounded-xs
          border bg-white transition ${dragging ? 'border-peri bg-peri-soft/20' : 'border-ink'}`}
      >
        <Icon name="upload" size={54} className="text-ink" strokeWidth={1.4} />
        <p className="mt-4 text-[15px] text-ink">Drag and drop files or Browse</p>
        <span className="mt-2 rounded-xs bg-peri-soft px-6 py-1 text-[12px] text-ink">
          Select File
        </span>
        <p className="mt-2 text-[11px] text-ink-soft">Supported file format: PDF</p>
        {file && <p className="mt-3 text-[13px] text-ink">{file.name}</p>}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={e => onFile(e.target.files?.[0])}
      />

      <div className="mt-5 flex justify-end">
        <button onClick={onNext} disabled={!file} className="btn-secondary px-8">Next</button>
      </div>
    </div>
  )
}
