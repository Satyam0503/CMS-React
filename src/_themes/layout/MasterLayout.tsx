import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DrawerMessenger } from "../partials";
import { reInitMenu } from "../helpers";
import { Container, Grid, Stack } from "@mui/material";
import { HeaderWrapper } from "./components/header/navbarmenus/HeaderWrapper";
import { Footer } from "./components/footer/Footer";
import { Sidebar } from "./components/sidebar";
import { PageDataProvider } from "./core";
import { colors } from "../../app/modules/theme/MuiTheme";

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
              zIndex={0}
              bgcolor={colors.alpha.bgbody[500]}
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

        <DrawerMessenger />
      </PageDataProvider>
    </>
  );
};

export { MasterLayout };
