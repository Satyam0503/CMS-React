import { FC, useState } from "react";
import { Box, ButtonBase, Drawer, Stack, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { SidebarMenuMain } from "./sidebar-menu/SidebarMenuMain";
import { Close, KeyboardDoubleArrowLeft } from "@mui/icons-material";
import { useCompanyTheme } from "../../../../app/modules/theme/companyTheme";

type Props = {
  open: boolean;
  handleClose: () => void;
  isMiniSidebar: boolean;
  setMiniSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  isHoverExpanded: boolean;
  setHoverExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}


const Sidebar: FC<Props> = ({ open, handleClose, isMiniSidebar, setMiniSidebar, isHoverExpanded, setHoverExpanded }) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));
  const [openIndex, setOpenIndex] = useState<number | null>(null); // Track the open item index
  const { theme: sidebarStyle } = useCompanyTheme();

  const handleSideBarToggle = () => {
    setMiniSidebar(!isMiniSidebar);
    if (openIndex) {
      setOpenIndex(null);
    }
  }

  const handleToggle = (index: number | null) => {
    setOpenIndex(index);
  }

  return (
    <Drawer
      anchor="left"
      variant={isSmallScreen ? 'temporary' : 'permanent'}
      open={isSmallScreen ? open : true}
      ModalProps={{ keepMounted: false }}
      slotProps={{
        backdrop: { sx: { backgroundColor: "rgba(15, 23, 42, 0.44)", backdropFilter: "blur(2px)" } },
        paper: {
          sx: {
            backgroundColor: 'background.sidebar',
            backgroundImage: "none",
            ...(isSmallScreen
              ? {}
              : {
                  top: "calc(var(--app-header-height) + 16px) !important",
                  bottom: "16px !important",
                  marginTop: "auto !important",
                  marginBottom: "auto !important",
                  height: "clamp(500px, calc(100dvh - var(--app-header-height) - 72px), 680px) !important",
                  maxHeight: "calc(100dvh - var(--app-header-height) - 32px) !important",
                  transform: "translateZ(0) !important",
                }),
          },
          className: 'sidebar-paper',
        },
      }}
      onClose={handleClose}
      className="sidebar"
      data-sidebar-mini={isSmallScreen ? "false" : isMiniSidebar && !isHoverExpanded ? "true" : "false"}
      data-sidebar-hover-expanded={!isSmallScreen && isHoverExpanded ? "true" : "false"}
      data-sidebar-style={sidebarStyle}
      onMouseEnter={() => {
        if (!isSmallScreen && isMiniSidebar) setHoverExpanded(true);
      }}
      onMouseLeave={() => {
        if (!isSmallScreen) setHoverExpanded(false);
      }}
    >
      <Stack
        role="presentation"
        onClick={handleClose}
        sx={{
          maxHeight: isSmallScreen
            ? "calc(100dvh - 20px)"
            : "calc(100dvh - var(--app-header-height) - 28px)",
          height: "100%",
          minHeight: 0,
          flexGrow: 1,
          justifyContent: "space-between",
          px: 2,
          py: 2,
          overflow: "hidden",
        }}
      >
        {isSmallScreen && (
          <ButtonBase
            aria-label="Close navigation menu"
            onClick={(event) => { event.stopPropagation(); handleClose(); }}
            sx={{ alignSelf: "flex-end", width: 36, height: 36, borderRadius: 1, color: "common.white" }}
          >
            <Close fontSize="small" />
          </ButtonBase>
        )}
        {/* Company logo strip — small, top-of-sidebar */}
        <SidebarMenuMain
          currentIndex={openIndex}
          handleToggle={handleToggle}
          isMiniSidebar={!isSmallScreen && isMiniSidebar && !isHoverExpanded}
          onExpandSidebar={() => setMiniSidebar(false)}
        />

        {!isSmallScreen && (
          <Box className="sidebar-footer">
            <Tooltip title={isMiniSidebar ? "Expand sidebar" : "Collapse sidebar"} placement="right" arrow>
              <ButtonBase
                aria-label={isMiniSidebar ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!isMiniSidebar}
                className="sidebar-edge-toggle"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSideBarToggle();
                }}
              >
                <Box component="span" className="sidebar-edge-toggle-icon">
                  <KeyboardDoubleArrowLeft />
                </Box>
              </ButtonBase>
            </Tooltip>
          </Box>
        )}
      </Stack>
    </Drawer >
  );
};

export { Sidebar };
