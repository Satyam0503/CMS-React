import { useColorScheme } from "@mui/material";
import { ToastContainer } from "react-toastify";

export const ToastProvider = () => {
  const { mode } = useColorScheme();
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
      theme={mode}
    />
  );
};
