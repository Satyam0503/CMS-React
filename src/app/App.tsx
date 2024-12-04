import {Suspense} from 'react'
import {Outlet} from 'react-router-dom'
import {I18nProvider} from '../_themes/i18n/i18nProvider'
import {LayoutProvider, LayoutSplashScreen} from '../_themes/layout/core'
import {MasterInit} from '../_themes/layout/MasterInit'
import {AuthInit} from './modules/auth'
import { ThemeModeProvider } from '../_themes/partials'
import { ThemeProvider } from '@mui/material'
import { MuiTheme } from './modules/theme/MuiTheme'



const App = () => {
  return (
    <ThemeProvider theme={MuiTheme}>
    <Suspense fallback={<LayoutSplashScreen />}>
      <I18nProvider>
        <LayoutProvider>
          <ThemeModeProvider>
            <AuthInit>
              <Outlet />
              <MasterInit />
            </AuthInit>
          </ThemeModeProvider>
        </LayoutProvider>
      </I18nProvider>
    </Suspense>
    </ThemeProvider>
  )
}

export {App}
