import { pinyin, segment } from 'pinyin-pro'
import { toRomaji, isKana } from 'wanakana'

export interface PhoneticSegment {
  text: string
  phonetic: string  // empty string means no annotation for this segment
}

export interface PhoneticResult {
  segments: PhoneticSegment[]
  full: string  // full romanization as a single string
}

// --- Chinese ---
function getChinesePhonetics(text: string): PhoneticResult {
  const segments = Array.from(text).map(ch => ({
    text: ch,
    phonetic: /[一-鿿㐀-䶿]/.test(ch) ? pinyin(ch, { toneType: 'symbol' }) : '',
  }))
  const full = pinyin(text, { toneType: 'symbol', separator: ' ', nonZh: 'removed' })
  return { segments, full }
}

// --- Japanese ---
// Covers hiragana and katakana. Kanji segments have no phonetic annotation.
// For full kanji support, migrate to Option C (API-based transliteration).
function getJapanesePhonetics(text: string): PhoneticResult {
  const segments = Array.from(text).map(ch => ({
    text: ch,
    phonetic: isKana(ch) ? toRomaji(ch) : '',
  }))
  const full = toRomaji(text)
  return { segments, full }
}

// --- Korean ---
// Implements the Revised Romanization of Korean (character-level).
const INITIALS = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h']
const VOWELS   = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i']
const FINALS   = ['','g','kk','ks','n','nj','nh','r','lg','lm','lb','ls','lt','lp','lh','m','b','bs','s','ss','ng','j','ch','k','t','p','h']

function romanizeHangulChar(ch: string): string {
  const code = ch.codePointAt(0)!
  if (code < 0xAC00 || code > 0xD7A3) return ''
  const offset = code - 0xAC00
  return INITIALS[Math.floor(offset / (21 * 28))]
    + VOWELS[Math.floor((offset % (21 * 28)) / 28)]
    + FINALS[offset % 28]
}

function getKoreanPhonetics(text: string): PhoneticResult {
  const isHangul = (ch: string) => /[가-힣]/.test(ch)
  const segments = Array.from(text).map(ch => ({
    text: ch,
    phonetic: isHangul(ch) ? romanizeHangulChar(ch) : '',
  }))
  const full = Array.from(text).map(ch => isHangul(ch) ? romanizeHangulChar(ch) : ch).join('')
  return { segments, full }
}

// ─────────────────────────────────────────────────────────────────────────────
// THIS is the function to replace when migrating to Option C.
// Swap it for a single API call that returns PhoneticResult for any language.
// The rest of the app (popup, tooltip, dictionary) does not need to change.
// ─────────────────────────────────────────────────────────────────────────────
export function getPhonetics(text: string, language: string): PhoneticResult | null {
  switch (language) {
    case 'zh': return getChinesePhonetics(text)
    case 'ja': return getJapanesePhonetics(text)
    case 'ko': return getKoreanPhonetics(text)
    default:   return null
  }
}

export function hasTargetChars(text: string, language: string): boolean {
  switch (language) {
    case 'zh': return /[一-鿿㐀-䶿]/.test(text)
    case 'ja': return /[぀-ヿ一-鿿]/.test(text)
    case 'ko': return /[가-힣]/.test(text)
    default:   return text.trim().length > 0
  }
}

/** One word or character of a selection, for the popup's Learn breakdown. */
export interface Term {
  text: string
  phonetic: string
}

const CJK = /[\u3400-\u4DBF\u4E00-\u9FFF\u3040-\u30FF\uAC00-\uD7A3]/

/**
 * Splits a selection into the units worth looking up individually.
 *
 * Chinese uses pinyin-pro's dictionary segmentation, so known words stay whole
 * and unknown runs fall back to single characters. Other CJK scripts split per
 * character; everything else splits on whitespace.
 */
export function segmentTerms(text: string, language: string): Term[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  if (language === 'zh') {
    return segment(trimmed)
      .filter(part => part.origin.trim())
      .map(part => ({ text: part.origin, phonetic: part.result ?? '' }))
  }

  if (CJK.test(trimmed)) {
    return Array.from(trimmed)
      .filter(ch => ch.trim())
      .map(ch => ({ text: ch, phonetic: getPhonetics(ch, language)?.full ?? '' }))
  }

  return trimmed
    .split(/\s+/)
    .filter(Boolean)
    .map(word => ({ text: word, phonetic: getPhonetics(word, language)?.full ?? '' }))
}

/** Reads a selection aloud, when the browser has a voice for the language. */
export function speak(text: string, language: string): boolean {
  if (typeof window === 'undefined' || !window.speechSynthesis) return false
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = { zh: 'zh-CN', ja: 'ja-JP', ko: 'ko-KR' }[language] ?? language
  window.speechSynthesis.cancel()
  window.speechSynthesis.speak(utterance)
  return true
}
