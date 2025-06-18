import { Outlet } from "react-router-dom";
import { Container, Stack } from "@mui/material";

const ErrorsLayout = () => {
  return (
    <Container className="flex-grow-1 d-flex" >
      <Outlet />
    </Container>
  );
};

export { ErrorsLayout };
