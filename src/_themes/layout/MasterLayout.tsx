import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { DrawerMessenger } from "../partials";
import { reInitMenu } from "../helpers";
import { Button, Container, Grid, Stack } from "@mui/material";
import { HeaderWrapper } from "./components/header/navbarmenus/HeaderWrapper";
import { Footer } from "./components/footer/Footer";
import { Sidebar } from "./components/sidebar";
import { PageDataProvider } from "./core";
import { colors } from "../../app/modules/theme/MuiTheme";
import { BreadcrumbProvider } from "react-breadcrumble";
import { PageData } from "../../app/shared/components/PageData";

const MasterLayout = () => {
  const location = useLocation();
  useEffect(() => {
    reInitMenu();
  }, [location.key]);
  const [theme, setTheme] = useState("light");

  // Apply class to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <>
      <BreadcrumbProvider>
        <PageDataProvider>
          <Grid
            item
            display={"flex"}
            flexDirection={"column"}
            flexGrow={1}
            flexBasis={"auto"}
            flexShrink={0}
            className="container-main"
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
                className="bgcolor_gray"
                bgcolor={colors.alpha.bgbody[500]}
              >
                <Container className="d-flex flex-column flex-grow-1">
                  <PageData />
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
      </BreadcrumbProvider>
    </>
  );
};

export { MasterLayout };
