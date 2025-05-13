import { Outlet } from "react-router-dom";
import { Stack } from "@mui/material";

const ErrorsLayout = () => {
  return (
    <>
      <Stack flexGrow={1} sx={{ backgroundColor: 'background.body' }}>
        <Outlet />
      </Stack>
    </>
  );
};

export { ErrorsLayout };
