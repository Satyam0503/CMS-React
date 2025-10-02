import { FC, createContext, useContext, useState } from 'react'
import { WithChildren } from '../../utils/common_types'
import { LANGUAGE } from '../../utils/enums'
import { getCurrentAppLanguage, setAppLanguage } from '../../utils/common'

type LanguageProps = {
  currentLanguage: LANGUAGE
  changeAppLanguage?: (lang: LANGUAGE) => void
}

const initialState: LanguageProps = {
  currentLanguage: LANGUAGE.ENGLISH
}


const I18nContext = createContext<LanguageProps>(initialState)

const useAppLang = () => {
  return useContext(I18nContext);
}

const I18nProvider: FC<WithChildren> = ({ children }) => {
  const [lang, setLang] = useState<LANGUAGE>(getCurrentAppLanguage());
  const changeAppLanguage = (newLang: LANGUAGE) => {
    setLang(newLang);
    setAppLanguage(newLang);
  }
  return <I18nContext.Provider value={{
    currentLanguage: lang,
    changeAppLanguage
  }}>{children}</I18nContext.Provider>
}

export { I18nProvider, useAppLang }
