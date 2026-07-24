import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Container, Stack, useMediaQuery, useTheme } from "@mui/material";
import { HeaderWrapper } from "./components/header/navbarmenus/HeaderWrapper";
import { Sidebar } from "./components/sidebar";
import { BreadcrumbProvider } from "react-breadcrumble";
import { PageData } from "../../app/shared/components/PageData";
// import { ChatMessenger } from "./components/header/chats/ChatMessanger";
import { PageDataProvider } from "../../app/Context/PageDataProvider";
import { OnlineUsersListener } from "../../app/modules/employees/components/OnlineUsersListener";
import { Footer } from "./components/footer/Footer";

const MasterLayout = () => {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const isSmallScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.md)
  );
  const [isMiniSidebar, setMiniSidebar] = useState(false);

  const handleOpenSidebar = () => {
    setOpen(true);
  };
  const handleSideBarClose = () => {
    setOpen(false);
  };

  return (
    <>
      <OnlineUsersListener />
      <BreadcrumbProvider>
        <PageDataProvider>
          <Stack
            className="app-shell flex-column flex-shrink-0 flex-grow-1"
            sx={{ height: "100dvh", overflow: "hidden" }}
          >
            <HeaderWrapper openSideBar={handleOpenSidebar} />
            <Stack
              direction="row"
              className="app-content-surface flex-grow-1"
              sx={{
                flex: "1 1 0",
                height: 0,
                minHeight: 0,
                overflowX: "hidden",
                overflowY: "auto",
                overscrollBehavior: "contain",
                marginLeft: isSmallScreen
                  ? 0
                  : isMiniSidebar
                    ? "124px"
                    : "289px",
                transition: "margin .3s linear",
              }}
            >
              <Sidebar
                open={open}
                handleClose={handleSideBarClose}
                isMiniSidebar={isMiniSidebar}
                setMiniSidebar={setMiniSidebar}
              />
              <Container
                className="d-flex flex-column flex-grow-1 gap-4"
                sx={{ minWidth: 0, minHeight: "max-content", overflow: "visible", py: 2, pb: 4 }}
              >
                <PageData />
                <Outlet />
              </Container>
            </Stack>
            <Footer />
          </Stack>
          {/* <ChatMessenger /> */}
        </PageDataProvider>
      </BreadcrumbProvider>
    </>
  );
};

export { MasterLayout };
