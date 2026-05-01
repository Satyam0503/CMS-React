import { FC, useEffect, useRef, useState } from 'react'
import { IntlProvider } from 'react-intl'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/locale-data/de'
import '@formatjs/intl-relativetimeformat/locale-data/es'
import '@formatjs/intl-relativetimeformat/locale-data/fr'
import '@formatjs/intl-relativetimeformat/locale-data/ja'
import '@formatjs/intl-relativetimeformat/locale-data/zh'

import { WithChildren } from '../../utils/common_types'
import { flattenMessages } from '../../utils/common'
import { useAppLang } from './Metronici18n'
import { LANGUAGE } from '../../utils/enums'

type FlatMessages = Record<string, string>

// In-memory cache so switching languages doesn't refetch within the same session.
// HTTP `cache: "no-cache"` still validates with the server on the first fetch of
// each language per session, picking up edits made directly on the deployed JSON files.
const messagesCache = new Map<LANGUAGE, FlatMessages>()

const fetchMessages = async (lang: LANGUAGE): Promise<FlatMessages> => {
  const cached = messagesCache.get(lang)
  if (cached) return cached

  const res = await fetch(`/locales/${lang}.json`, { cache: 'no-cache' })
  if (!res.ok) throw new Error(`Failed to load locale "${lang}": HTTP ${res.status}`)
  const json = await res.json()
  const flat = flattenMessages(json)
  messagesCache.set(lang, flat)
  return flat
}

const I18nProvider: FC<WithChildren> = ({ children }) => {
  const { currentLanguage } = useAppLang()
  const [messages, setMessages] = useState<FlatMessages | null>(
    () => messagesCache.get(currentLanguage) ?? null
  )
  // Tracks the latest requested language so a slow earlier request can't
  // overwrite messages set by a later (faster) language switch.
  const latestRequestRef = useRef<LANGUAGE>(currentLanguage)

  useEffect(() => {
    latestRequestRef.current = currentLanguage
    const cached = messagesCache.get(currentLanguage)
    if (cached) {
      setMessages(cached)
      return
    }
    fetchMessages(currentLanguage)
      .then((loaded) => {
        if (latestRequestRef.current === currentLanguage) setMessages(loaded)
      })
      .catch((err) => {
        console.error(err)
        // Fall back to empty so IntlProvider can still render with defaultMessage values.
        if (latestRequestRef.current === currentLanguage) setMessages({})
      })
  }, [currentLanguage])

  if (messages === null) return null

  return (
    <IntlProvider locale={currentLanguage} messages={messages} defaultLocale='en'>
      {children}
    </IntlProvider>
  )
}

export { I18nProvider }
