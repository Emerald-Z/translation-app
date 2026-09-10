import { useState } from 'react'
import BookCover from './BookCover'
import Dropdown from './Dropdown'
import Modal from './Modal'
import { bookTitle, updateBookDetails, type Book } from '../lib/books'
import { LANGUAGES } from '../lib/languages'

interface Props {
  book: Book
  onClose: () => void
  onSaved: (patch: Partial<Book>) => void
}

export default function EditBookModal({ book, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(bookTitle(book))
  const [author, setAuthor] = useState(book.author ?? '')
  const [language, setLanguage] = useState(book.language)
  const [translation, setTranslation] = useState(book.translation_language ?? 'en')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    const patch = { title, author, language, translation_language: translation }
    await updateBookDetails(book.id, patch)
    onSaved(patch)
    setSaving(false)
    onClose()
  }

  return (
    <Modal title="Edit Book" onClose={onClose} width={720}>
      <div className="flex gap-6">
        <div className="h-[210px] w-[152px] shrink-0 overflow-hidden shadow-card">
          <BookCover book={book} />
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-ink" htmlFor="eb-title">Title</label>
            <input id="eb-title" className="field" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-ink" htmlFor="eb-author">Author</label>
            <input id="eb-author" className="field" value={author} onChange={e => setAuthor(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm text-ink">Language</label>
              <Dropdown size="md" className="w-full" value={language} onChange={setLanguage}
                options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))} />
            </div>
            <div>
              <label className="mb-1 block text-sm text-ink">Translation Language</label>
              <Dropdown size="md" className="w-full" value={translation} onChange={setTranslation}
                options={LANGUAGES.map(l => ({ value: l.code, label: l.label }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-7 flex justify-end gap-3">
        <button onClick={onClose} className="btn-secondary">Cancel</button>
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </Modal>
  )
}
