import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Container, Stack, useMediaQuery, useTheme } from "@mui/material";
import { CSSProperties } from "react";
import { HeaderWrapper } from "./components/header/navbarmenus/HeaderWrapper";
import { Sidebar } from "./components/sidebar";
import { BreadcrumbProvider } from "react-breadcrumble";
import { PageData } from "../../app/shared/components/PageData";
// import { ChatMessenger } from "./components/header/chats/ChatMessanger";
import { PageDataProvider } from "../../app/Context/PageDataProvider";
import { OnlineUsersListener } from "../../app/modules/employees/components/OnlineUsersListener";
import { EmployeeExitQueueAction } from "../../app/modules/users/components/EmployeeExitQueueAction";

const MasterLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const isSmallScreen = useMediaQuery(
    theme.breakpoints.down(theme.breakpoints.values.md),
  );
  const [isMiniSidebar, setMiniSidebar] = useState(false);
  const [isSidebarHoverExpanded, setSidebarHoverExpanded] = useState(false);
  const isSidebarExpanded = !isMiniSidebar || isSidebarHoverExpanded;
  const sidebarState = isSmallScreen
    ? "mobile"
    : !isSidebarExpanded
      ? "collapsed"
      : "expanded";
  const shellVariables = {
    "--sidebar-expanded-width": "265px",
    "--sidebar-collapsed-width": "76px",
    "--sidebar-current-width": isSmallScreen
      ? "0px"
      : !isSidebarExpanded
        ? "var(--sidebar-collapsed-width)"
        : "var(--sidebar-expanded-width)",
  } as CSSProperties;

  const handleOpenSidebar = () => {
    setOpen(true);
  };
  const handleSideBarClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (!isSmallScreen) setOpen(false);
  }, [isSmallScreen]);

  useEffect(() => {
    if (isSmallScreen) setOpen(false);
  }, [isSmallScreen, location.pathname]);

  return (
    <>
      <OnlineUsersListener />
      <BreadcrumbProvider>
        <PageDataProvider>
          <Stack
            className="app-shell flex-column flex-shrink-0 flex-grow-1"
            data-sidebar-state={sidebarState}
            style={shellVariables}
            sx={{ height: "100dvh", overflow: "hidden" }}
          >
            <HeaderWrapper
              openSideBar={handleOpenSidebar}
              sidebarState={sidebarState}
            />
            <Stack
              direction="column"
              sx={{
                flex: "1 1 0",
                height: 0,
                minHeight: 0,
                overflowX: "hidden",
                overflowY: "auto",
                overscrollBehavior: "contain",
              }}
            >
              <Stack
                direction="column"
                className="app-content-surface"
                data-sidebar-state={sidebarState}
                sx={{
                  flex: "1 0 auto",
                  minHeight: 0,
                  marginLeft: { xs: 0, md: "calc(var(--sidebar-current-width) + 16px)" },
                  width: { xs: "100%", md: "auto" },
                  transition: "margin-left 0.32s cubic-bezier(.2, .8, .2, 1)",
                }}
              >
                <Sidebar
                  open={open}
                  handleClose={handleSideBarClose}
                  isMiniSidebar={isMiniSidebar}
                  setMiniSidebar={setMiniSidebar}
                  isHoverExpanded={isSidebarHoverExpanded}
                  setHoverExpanded={setSidebarHoverExpanded}
                />
                <Container
                  maxWidth={false}
                  className="d-flex flex-column flex-grow-1 gap-3"
                  sx={{
                    width: "100%",
                    maxWidth: { xs: "none", md: "1680px" },
                    mx: "auto",
                    minWidth: 0,
                    minHeight: "max-content",
                    overflow: "visible",
                    py: 2,
                    pb: 4,
                    px: { xs: 2, md: 3 },
                    pl: { xs: 2, md: 2 },
                    pr: { xs: 2, md: 3 },
                    transition: "max-width 0.32s cubic-bezier(.2, .8, .2, 1), padding 0.32s cubic-bezier(.2, .8, .2, 1)",
                  }}
                >
                  <PageData />
                  <EmployeeExitQueueAction showButton={false} />
                  <Outlet />
                </Container>
              </Stack>
            </Stack>
          </Stack>
          {/* <ChatMessenger /> */}
        </PageDataProvider>
      </BreadcrumbProvider>
    </>
  );
};

export { MasterLayout };
