import { createRoot } from "react-dom/client";
import { Chart, registerables } from "chart.js";
// Apps
import "./_themes/assets/sass/style.react.scss";
// import "./_themes/assets/fonticon/fonticon.css";
// import "./_themes/assets/keenicons/duotone/style.css";
// import "./_themes/assets/keenicons/outline/style.css";
// import "./_themes/assets/keenicons/solid/style.css";

import "./_themes/assets/sass/style.scss";
import { AppRoutes } from "./app/routing/AppRoutes";
import { I18nProvider } from "./_themes/i18n/Metronici18n";
import { Provider } from "react-redux";
import { store } from "./app/Redux/store";
import { ErrorBoundary } from "./app/shared/components/ErrorBoundary";

Chart.register(...registerables);

const container = document.getElementById("root");
if (container) {
  createRoot(container).render(
    // <ThemeProvider>
    <I18nProvider>
      {/* <ErrorBoundary> */}
      <Provider store={store}>
        <AppRoutes />
      </Provider>
      {/* </ErrorBoundary> */}
    </I18nProvider>
    // </ThemeProvider>
  );
}
