import { getLanguage } from './languages'

export async function translate(text: string, language: string): Promise<string> {
  const { googleCode } = getLanguage(language)
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${googleCode}&tl=en&dt=t&q=` +
    encodeURIComponent(text)
  const res = await fetch(url)
  if (!res.ok) throw new Error('Translation request failed')
  const data = await res.json()
  return (data[0] as [string, string][]).map(seg => seg[0]).join('')
}
