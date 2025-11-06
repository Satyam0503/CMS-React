import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Container, Stack, useMediaQuery, useTheme } from "@mui/material";
import { HeaderWrapper } from "./components/header/navbarmenus/HeaderWrapper";
import { Sidebar } from "./components/sidebar";
import { BreadcrumbProvider } from "react-breadcrumble";
import { PageData } from "../../app/shared/components/PageData";
import { ChatMessenger } from "./components/header/chats/ChatMessanger";
import { PageDataProvider } from "../../app/Context/PageDataProvider";

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
      <BreadcrumbProvider>
        <PageDataProvider>
          <Stack
            className="flex-column flex-shrink-0 flex-grow-1"
          >
            <HeaderWrapper openSideBar={handleOpenSidebar} />
            <Stack
              direction="row"
              className="flex-grow-1"
              sx={{
                marginLeft: isSmallScreen
                  ? 0
                  : isMiniSidebar
                    ? "90px"
                    : "265px",
                transition: "margin .3s linear",
              }}
            >
              <Sidebar
                open={open}
                handleClose={handleSideBarClose}
                isMiniSidebar={isMiniSidebar}
                setMiniSidebar={setMiniSidebar}
              />
              <Container className="d-flex flex-column flex-grow-1 gap-4">
                <PageData />
                <Outlet />
              </Container>
            </Stack>
          </Stack>
          <ChatMessenger />
        </PageDataProvider>
      </BreadcrumbProvider>
    </>
  );
};

export { MasterLayout };
