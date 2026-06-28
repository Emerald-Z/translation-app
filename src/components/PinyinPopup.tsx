import { useEffect, useRef, useState } from 'react'
import { pinyin } from 'pinyin-pro'

interface Props {
  text: string
  x: number
  y: number
  onClose: () => void
}

function isChineseChar(ch: string) {
  return /[一-鿿㐀-䶿]/.test(ch)
}

async function translate(text: string): Promise<string> {
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=zh-CN&tl=en&dt=t&q=` +
    encodeURIComponent(text)
  const res = await fetch(url)
  if (!res.ok) throw new Error('Translation request failed')
  const data = await res.json()
  // Response shape: [ [ ["translated", "original", ...], ... ], ... ]
  return (data[0] as [string, string][]).map(seg => seg[0]).join('')
}

export default function PinyinPopup({ text, x, y, onClose }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [translation, setTranslation] = useState<string | null>(null)
  const [translating, setTranslating] = useState(false)
  const [transError, setTransError] = useState(false)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  useEffect(() => {
    setTranslation(null)
    setTransError(false)
    setTranslating(true)
    translate(text)
      .then(setTranslation)
      .catch(() => setTransError(true))
      .finally(() => setTranslating(false))
  }, [text])

  const chars = Array.from(text)
  const pairs = chars.map(ch => ({
    ch,
    py: isChineseChar(ch) ? pinyin(ch, { toneType: 'symbol' }) : '',
  }))

  const fullPinyin = pinyin(text, { toneType: 'symbol', separator: ' ', nonZh: 'removed' })

  return (
    <div
      ref={ref}
      style={{ position: 'fixed', left: x, top: y, zIndex: 9999, maxWidth: '90vw' }}
      className="bg-white border border-gray-200 rounded-xl shadow-2xl p-4 select-none"
    >
      {/* Character + pinyin grid */}
      <div className="flex flex-wrap gap-2 mb-3">
        {pairs.map((p, i) => (
          <div key={i} className="flex flex-col items-center min-w-[1.5rem]">
            <span className="text-xs text-indigo-500 leading-none mb-1 whitespace-nowrap">
              {p.py}
            </span>
            <span className="text-2xl leading-none text-gray-800">{p.ch}</span>
          </div>
        ))}
      </div>

      {/* Full pinyin */}
      {fullPinyin && (
        <div className="text-sm text-gray-400 border-t border-gray-100 pt-2 pb-2">
          {fullPinyin}
        </div>
      )}

      {/* Translation */}
      <div className="border-t border-gray-100 pt-2 text-sm">
        {translating && (
          <span className="text-gray-400 italic">Translating…</span>
        )}
        {!translating && translation && (
          <span className="text-gray-700">{translation}</span>
        )}
        {!translating && transError && (
          <span className="text-red-400 text-xs">Translation unavailable</span>
        )}
      </div>

      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-lg leading-none w-6 h-6 flex items-center justify-center"
      >
        ×
      </button>
    </div>
  )
}
