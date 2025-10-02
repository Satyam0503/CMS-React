import { FC } from 'react'
import { IntlProvider } from 'react-intl'
import '@formatjs/intl-relativetimeformat/polyfill'
import '@formatjs/intl-relativetimeformat/locale-data/en'
import '@formatjs/intl-relativetimeformat/locale-data/de'
import '@formatjs/intl-relativetimeformat/locale-data/es'
import '@formatjs/intl-relativetimeformat/locale-data/fr'
import '@formatjs/intl-relativetimeformat/locale-data/ja'
import '@formatjs/intl-relativetimeformat/locale-data/zh'

import deMessages from './messages/de.json'
import enMessages from './messages/en.json'
import esMessages from './messages/es.json'
import frMessages from './messages/fr.json'
import jaMessages from './messages/ja.json'
import zhMessages from './messages/zh.json'
import { WithChildren } from '../../utils/common_types'
import { flattenMessages, } from '../../utils/common'
import { useAppLang } from './Metronici18n'

const allMessages = {
  de: deMessages,
  en: enMessages,
  es: esMessages,
  fr: frMessages,
  ja: jaMessages,
  zh: zhMessages,
}

const I18nProvider: FC<WithChildren> = ({ children }) => {
  const { currentLanguage } = useAppLang();
  const messages = allMessages[currentLanguage];
  const flattenedMessage = flattenMessages(messages);
  return (
    <IntlProvider locale={currentLanguage} messages={flattenedMessage} defaultLocale='en'>
      {children}
    </IntlProvider>
  )
}

export { I18nProvider }
