import { useEffect, useState } from 'react'
import {
  getDictionaryEntries,
  deleteHighlightsByText,
  updateHighlightsByText,
  type DictionaryEntry,
} from '../lib/highlights'
import { getLanguage } from '../lib/languages'

interface EditState {
  translation: string
  notes: string
  saving: boolean
}

export default function Dictionary() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [languageFilter, setLanguageFilter] = useState<string | null>(null)
  const [editing, setEditing] = useState<Record<string, EditState>>({})

  useEffect(() => {
    getDictionaryEntries()
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [])

  function startEdit(entry: DictionaryEntry) {
    setEditing(prev => ({
      ...prev,
      [entry.text]: {
        translation: entry.translation_override ?? entry.translation,
        notes: entry.notes ?? '',
        saving: false,
      },
    }))
  }

  function cancelEdit(text: string) {
    setEditing(prev => {
      const next = { ...prev }
      delete next[text]
      return next
    })
  }

  async function saveEdit(text: string) {
    const draft = editing[text]
    if (!draft) return
    setEditing(prev => ({ ...prev, [text]: { ...prev[text], saving: true } }))

    const override = draft.translation.trim() || null
    const notes = draft.notes.trim() || null

    await updateHighlightsByText(text, { translation_override: override, notes })

    setEntries(prev =>
      prev.map(e => e.text === text ? { ...e, translation_override: override, notes } : e)
    )
    cancelEdit(text)
  }

  async function handleDelete(text: string) {
    if (!confirm(`Remove "${text}" from your dictionary?`)) return
    await deleteHighlightsByText(text)
    setEntries(prev => prev.filter(e => e.text !== text))
  }

  const presentLanguages = Array.from(new Set(entries.map(e => e.language)))

  const filtered = entries.filter(e => {
    if (languageFilter && e.language !== languageFilter) return false
    if (!search) return true
    return (
      e.text.includes(search) ||
      e.pinyin.toLowerCase().includes(search.toLowerCase()) ||
      (e.translation_override ?? e.translation).toLowerCase().includes(search.toLowerCase()) ||
      (e.notes ?? '').toLowerCase().includes(search.toLowerCase())
    )
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800">Dictionary</h2>
            <p className="text-xs text-gray-400 mt-0.5">{entries.length} unique words saved</p>
          </div>
          <input
            type="text"
            placeholder="Search…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-300 w-48"
          />
        </div>

        {entries.length > 0 && (
          <div className="flex items-center gap-2 mb-6 flex-wrap">
            <button
              onClick={() => setLanguageFilter(null)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                languageFilter === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {presentLanguages.map(code => (
              <button
                key={code}
                onClick={() => setLanguageFilter(code === languageFilter ? null : code)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition ${
                  languageFilter === code
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >
                {getLanguage(code).label}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-16">Loading…</div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-400 py-16">
            {entries.length === 0
              ? 'No words saved yet — highlight text in a book and click "Save to Dictionary".'
              : 'No results for that search.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {filtered.map(entry => {
              const draft = editing[entry.text]
              const displayTranslation = entry.translation_override ?? entry.translation

              return (
                <div
                  key={entry.text}
                  className="group bg-white border border-gray-200 rounded-xl p-4 relative hover:border-indigo-200 transition"
                >
                  <div className="flex items-start justify-between pr-6">
                    <span className="text-2xl font-medium text-gray-800">{entry.text}</span>
                    <span className="text-xs bg-indigo-50 text-indigo-400 rounded-full px-2 py-0.5 ml-2 shrink-0">
                      ×{entry.count}
                    </span>
                  </div>
                  <p className="text-xs text-indigo-500 mt-1">{entry.pinyin}</p>

                  {draft ? (
                    <div className="mt-2 space-y-2">
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Translation</label>
                        <input
                          value={draft.translation}
                          onChange={e => setEditing(prev => ({
                            ...prev,
                            [entry.text]: { ...prev[entry.text], translation: e.target.value },
                          }))}
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-indigo-300"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-400 mb-0.5 block">Notes</label>
                        <textarea
                          value={draft.notes}
                          onChange={e => setEditing(prev => ({
                            ...prev,
                            [entry.text]: { ...prev[entry.text], notes: e.target.value },
                          }))}
                          rows={2}
                          placeholder="Add a note…"
                          className="w-full border border-gray-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-indigo-300 resize-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => saveEdit(entry.text)}
                          disabled={draft.saving}
                          className="flex-1 py-1 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-700 disabled:opacity-50 transition"
                        >
                          {draft.saving ? 'Saving…' : 'Save'}
                        </button>
                        <button
                          onClick={() => cancelEdit(entry.text)}
                          className="flex-1 py-1 rounded-lg bg-gray-100 text-gray-600 text-xs hover:bg-gray-200 transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600 mt-1">{displayTranslation}</p>
                      {entry.translation_override && (
                        <p className="text-xs text-gray-400 line-through mt-0.5">{entry.translation}</p>
                      )}
                      {entry.notes && (
                        <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-2 py-1 mt-2">
                          {entry.notes}
                        </p>
                      )}
                      <button
                        onClick={() => startEdit(entry)}
                        className="absolute top-2 right-8 w-5 h-5 text-gray-300 hover:text-indigo-400 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs"
                        title="Edit"
                      >
                        ✎
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => handleDelete(entry.text)}
                    className="absolute top-2 right-2 w-5 h-5 text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
