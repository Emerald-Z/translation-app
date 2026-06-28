import { useEffect, useState } from 'react'
import { getDictionaryEntries, deleteHighlightsByText, type DictionaryEntry } from '../lib/highlights'

export default function Dictionary() {
  const [entries, setEntries] = useState<DictionaryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    getDictionaryEntries()
      .then(setEntries)
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete(text: string) {
    if (!confirm(`Remove "${text}" from your dictionary?`)) return
    await deleteHighlightsByText(text)
    setEntries(prev => prev.filter(e => e.text !== text))
  }

  const filtered = entries.filter(e =>
    e.text.includes(search) ||
    e.pinyin.toLowerCase().includes(search.toLowerCase()) ||
    e.translation.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-6 py-8 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
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
            {filtered.map(entry => (
              <div
                key={entry.text}
                className="group bg-white border border-gray-200 rounded-xl p-4 relative hover:border-indigo-200 transition"
              >
                <div className="flex items-start justify-between">
                  <span className="text-2xl font-medium text-gray-800">{entry.text}</span>
                  <span className="text-xs bg-indigo-50 text-indigo-400 rounded-full px-2 py-0.5 ml-2 shrink-0">
                    ×{entry.count}
                  </span>
                </div>
                <p className="text-xs text-indigo-500 mt-1">{entry.pinyin}</p>
                <p className="text-sm text-gray-600 mt-1">{entry.translation}</p>

                <button
                  onClick={() => handleDelete(entry.text)}
                  className="absolute top-2 right-2 w-5 h-5 rounded-full text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
