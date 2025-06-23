import { ToastContainer } from "react-toastify";
import { useThemeContext } from "../../../app/Context/ThemeContext"

export const ToastProvider = () => {
    const themeMode = useThemeContext().theme;
    return (
        <ToastContainer
            position="top-right"
            autoClose={2000}
            hideProgressBar={false}
            newestOnTop={false}
            // closeOnClick={true}
            pauseOnFocusLoss
            pauseOnHover
            stacked={true}
            theme={themeMode}
        />
    )
}