import { createRoot } from "react-dom/client";
import "./_themes/assets/sass/style.scss";
import { AppRoutes } from "./app/routing/AppRoutes";
import { I18nProvider } from "./_themes/i18n/Metronici18n";
import { Provider } from "react-redux";
import { store } from "./app/Redux/store";
import { ErrorBoundary } from "./app/shared/components/ErrorBoundary";
import dayjs from "dayjs";
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
dayjs.extend(localizedFormat);

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    <I18nProvider>
      <ErrorBoundary>
        <Provider store={store}>
          <AppRoutes />
        </Provider>
      </ErrorBoundary>
    </I18nProvider>
  );
}
