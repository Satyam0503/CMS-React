import { Outlet } from "react-router-dom";
import { Container, Stack } from "@mui/material";

const ErrorsLayout = () => {
  return (
    <Container className="flex-grow-1 d-flex" sx={{ bgcolor: "background.body" }}>
      <Outlet />
    </Container>
  );
};

export { ErrorsLayout };
