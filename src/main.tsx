import {createRoot} from 'react-dom/client'
// Axios
import axios from 'axios'
import {Chart, registerables} from 'chart.js'
import {QueryClient, QueryClientProvider} from 'react-query'
import {ReactQueryDevtools} from 'react-query/devtools'
// Apps
import './_themes/assets/sass/style.react.scss'
import './_themes/assets/fonticon/fonticon.css'
import './_themes/assets/keenicons/duotone/style.css'
import './_themes/assets/keenicons/outline/style.css'
import './_themes/assets/keenicons/solid/style.css'
/**
 * TIP: Replace this style import with rtl styles to enable rtl mode
 *
 * import './_themes/assets/css/style.rtl.css'
 **/
import './_themes/assets/sass/style.scss'
import {AppRoutes} from './app/routing/AppRoutes'
import {AuthProvider, setupAxios} from './app/modules/auth'
import { I18nProvider } from './_themes/i18n/Metronici18n'
/**
 * Creates `axios-mock-adapter` instance for provided `axios` instance, add
 * basic Metronic mocks and returns it.
 *
 * @see https://github.com/ctimmerm/axios-mock-adapter
 */
/**
 * Inject Metronic interceptors for axios.
 *
 * @see https://github.com/axios/axios#interceptors
 */
setupAxios(axios)
Chart.register(...registerables)

const queryClient = new QueryClient()
const container = document.getElementById('root')
if (container) {
  createRoot(container).render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </I18nProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}
