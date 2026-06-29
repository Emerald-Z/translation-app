export interface Language {
  code: string
  label: string
  googleCode: string  // Google Translate source language code
  hasPhonetics: boolean
}

export const LANGUAGES: Language[] = [
  { code: 'zh', label: 'Chinese (Mandarin)', googleCode: 'zh-CN', hasPhonetics: true },
  { code: 'ja', label: 'Japanese',           googleCode: 'ja',    hasPhonetics: true },
  { code: 'ko', label: 'Korean',             googleCode: 'ko',    hasPhonetics: true },
  { code: 'es', label: 'Spanish',            googleCode: 'es',    hasPhonetics: false },
  { code: 'fr', label: 'French',             googleCode: 'fr',    hasPhonetics: false },
  { code: 'de', label: 'German',             googleCode: 'de',    hasPhonetics: false },
  { code: 'pt', label: 'Portuguese',         googleCode: 'pt',    hasPhonetics: false },
  { code: 'ru', label: 'Russian',            googleCode: 'ru',    hasPhonetics: false },
  { code: 'ar', label: 'Arabic',             googleCode: 'ar',    hasPhonetics: false },
]

export function getLanguage(code: string): Language {
  return LANGUAGES.find(l => l.code === code)
    ?? { code, label: code, googleCode: code, hasPhonetics: false }
}
