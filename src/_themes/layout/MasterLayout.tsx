import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { HeaderWrapper } from "./components/portalheader/HeaderWrapper";
import { RightToolbar } from "../partials/layout/RightToolbar";
import { ScrollTop } from "./components/scroll-top";
import { FooterWrapper } from "./components/footer";
import { Sidebar } from "./components/sidebar";
import { ActivityDrawer, DrawerMessenger } from "../partials";
import { reInitMenu } from "../helpers";
import { Container, Grid, Stack } from "@mui/material";

const MasterLayout = () => {
  const location = useLocation();
  useEffect(() => {
    reInitMenu();
  }, [location.key]);

  return (
    // <PageDataProvider>
    <>
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
            <Container>
              <Outlet />
            </Container>
          </Stack>
          <FooterWrapper />
        </Stack>
      </Grid>

      <ActivityDrawer />
      <RightToolbar />
      <DrawerMessenger />

      <ScrollTop />
    </>

    // </PageDataProvider>
  );
};

export { MasterLayout };
