import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { RightToolbar } from "../partials/layout/RightToolbar";
import { DrawerMessenger } from "../partials";
import { reInitMenu } from "../helpers";
import { Container, Grid, Stack } from "@mui/material";
import { HeaderWrapper } from "./components/header/navbarmenus/HeaderWrapper";
import { Footer } from "./components/footer/Footer";
import { Sidebar } from "./components/sidebar";
import { PageDataProvider } from "./core";

const MasterLayout = () => {
  const location = useLocation();
  useEffect(() => {
    reInitMenu();
  }, [location.key]);

  return (
    <>
      <PageDataProvider>
        <Grid
          item
          display={"flex"}
          flexDirection={"column"}
          flexGrow={1}
          flexBasis={"auto"}
          flexShrink={0}
        >
          <HeaderWrapper />

          <Stack className="app-wrapper flex-row-fluid">
            <Stack>
              <Sidebar />
            </Stack>

            <Stack
              display={"flex"}
              flexDirection={"column"}
              flexGrow={1}
              flexBasis={"auto"}
              flexShrink={0}
              className="bg-body"
              zIndex={0}
            >
              <Container className="d-flex flex-column flex-grow-1">
                <Outlet />
              </Container>
            </Stack>
            <Stack>
              <Footer />
            </Stack>
          </Stack>
        </Grid>

        <RightToolbar />
        <DrawerMessenger />
      </PageDataProvider>
    </>
  );
};

export { MasterLayout };
