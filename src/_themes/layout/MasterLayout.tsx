import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { redirectUserToTargetUrl } from "../../utils/common";
import { NotificationModel } from "../../app/modules/users/models";
import { Box, Stack, useMediaQuery, useTheme } from "@mui/material";
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
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleNotificationClick = (event: Event) => {
      const customEvent = event as CustomEvent<NotificationModel>;
      if (customEvent.detail) {
        redirectUserToTargetUrl(customEvent.detail, navigate);
      }
    };
    window.addEventListener("codeji:notification-click", handleNotificationClick);
    return () => window.removeEventListener("codeji:notification-click", handleNotificationClick);
  }, [navigate]);
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
    "--sidebar-expanded-width": "250px",
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
            sx={{ height: "100dvh", overflow: "hidden", position: "relative" }}
          >
            <HeaderWrapper
              openSideBar={handleOpenSidebar}
              sidebarState={sidebarState}
            />
            <Box
              className="app-body-layout"
              sx={{
                display: "flex",
                flex: "1 1 auto",
                minHeight: 0,
                height: "calc(100dvh - var(--app-header-height))",
                position: "relative",
                overflow: "hidden",
                width: "100%",
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
              <Box
                component="main"
                className="app-content-surface app-main-viewport"
                data-sidebar-state={sidebarState}
                sx={{
                  flex: "1 1 auto",
                  minWidth: 0,
                  minHeight: 0,
                  height: "100%",
                  overflowX: "hidden",
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  marginLeft: {
                    xs: 0,
                    md: "calc(var(--sidebar-current-width) + 32px)",
                  },
                  width: {
                    xs: "100%",
                    md: "calc(100% - var(--sidebar-current-width) - 48px)",
                  },
                  transition:
                    "margin-left 0.28s cubic-bezier(.2, .8, .2, 1), width 0.28s cubic-bezier(.2, .8, .2, 1)",
                }}
              >
                <div className="main-content-wrapper">
                  <div className="main-content-container">
                    <PageData />
                    <EmployeeExitQueueAction showButton={false} />
                    <Outlet />
                  </div>
                </div>
              </Box>
            </Box>
          </Stack>
          {/* <ChatMessenger /> */}
        </PageDataProvider>
      </BreadcrumbProvider>
    </>
  );
};

export { MasterLayout };
