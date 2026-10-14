import { FC, useState } from "react";
import { Avatar, Box, ButtonBase, Drawer, Stack, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { SidebarMenuMain } from "./sidebar-menu/SidebarMenuMain";
import { Close, KeyboardDoubleArrowLeft } from "@mui/icons-material";
import { useCompanyTheme } from "../../../../app/modules/theme/companyTheme";
import { useAppSelector } from "../../../../app/Redux/hooks";
import { DEFAULT_COMPANY_LOGO } from "../../../../utils/constant/Constant";

type Props = {
  open: boolean;
  handleClose: () => void;
  isMiniSidebar: boolean;
  setMiniSidebar: React.Dispatch<React.SetStateAction<boolean>>;
  isHoverExpanded: boolean;
  setHoverExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

const Sidebar: FC<Props> = ({
  open,
  handleClose,
  isMiniSidebar,
  setMiniSidebar,
  isHoverExpanded,
  setHoverExpanded,
}) => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down(theme.breakpoints.values.md));
  const [openIndex, setOpenIndex] = useState<number | null>(null); // Track the open item index
  const { theme: sidebarStyle } = useCompanyTheme();
  const companyLogo = useAppSelector((state) => state.user.userData?.companyLogo);

  const handleSideBarToggle = () => {
    setMiniSidebar(!isMiniSidebar);
    if (openIndex) {
      setOpenIndex(null);
    }
  };

  const handleToggle = (index: number | null) => {
    setOpenIndex(index);
  };

  return (
    <Drawer
      anchor="left"
      variant={isSmallScreen ? "temporary" : "permanent"}
      open={isSmallScreen ? open : true}
      ModalProps={{ keepMounted: false }}
      slotProps={{
        backdrop: {
          sx: {
            backgroundColor: "rgba(15, 23, 42, 0.44)",
            backdropFilter: "blur(4px)",
          },
        },
        paper: {
          sx: {
            backgroundColor: "transparent",
            backgroundImage: "none",
            boxSizing: "border-box",
            ...(isSmallScreen
              ? {
                  top: "0 !important",
                  bottom: "0 !important",
                  left: "0 !important",
                  height: "100dvh !important",
                  maxHeight: "100dvh !important",
                  width: "min(290px, 85vw) !important",
                  borderRadius: "0 16px 16px 0 !important",
                  border: "none !important",
                  borderRight: "1px solid",
                  borderColor: "rgba(255, 255, 255, 0.88)",
                  zIndex: 1300,
                }
              : {
                  top: "calc(var(--app-header-height) + 14px) !important",
                  bottom: "16px !important",
                  left: "16px !important",
                  marginTop: "0 !important",
                  marginBottom: "0 !important",
                  height: "calc(100dvh - var(--app-header-height) - 30px) !important",
                  maxHeight: "calc(100dvh - var(--app-header-height) - 30px) !important",
                  width: "var(--sidebar-current-width) !important",
                  borderRadius: "38px !important",
                  border: "1px solid",
                  borderColor: "rgba(255, 255, 255, 0.88)",
                  transform: "none !important",
                  boxShadow:
                    "0 10px 30px 0 rgba(11, 92, 171, 0.06), 0 2px 8px 0 rgba(15, 23, 42, 0.03), inset 0 1px 1px 0 rgba(255, 255, 255, 0.95), inset 0 -1px 1px 0 rgba(11, 92, 171, 0.02) !important",
                  zIndex: 1100,
                  overflow: "hidden",
                  transition: "width 0.28s cubic-bezier(.2, .8, .2, 1) !important",
                  "&:hover": {
                    transform: "none !important",
                  },
                }),
          },
          className: "sidebar-paper",
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
        onClick={isSmallScreen ? handleClose : undefined}
        sx={{
          height: "100%",
          maxHeight: "100%",
          minHeight: 0,
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          px: isMiniSidebar && !isHoverExpanded ? 0.75 : 1.25,
          pt: isSmallScreen ? 1.5 : 2.5,
          pb: isSmallScreen ? 1.5 : 1.5,
          gap: 1,
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {isSmallScreen && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 1, pb: 1.5, pt: 0.5, borderBottom: "1px solid", borderColor: "divider" }}
          >
            <Avatar
              variant="square"
              alt="Company Logo"
              src={companyLogo || DEFAULT_COMPANY_LOGO}
              sx={{
                backgroundColor: "transparent",
                width: "auto",
                maxWidth: 130,
                height: 34,
                "& .MuiAvatar-img": {
                  objectFit: "contain",
                  objectPosition: "left center",
                },
              }}
            />
            <ButtonBase
              aria-label="Close navigation menu"
              onClick={(event) => {
                event.stopPropagation();
                handleClose();
              }}
              sx={{
                width: 34,
                height: 34,
                borderRadius: 1.5,
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover", color: "text.primary" },
              }}
            >
              <Close fontSize="small" />
            </ButtonBase>
          </Stack>
        )}

        {/* Navigation Menu */}
        <SidebarMenuMain
          currentIndex={openIndex}
          handleToggle={handleToggle}
          isMiniSidebar={!isSmallScreen && isMiniSidebar && !isHoverExpanded}
          onExpandSidebar={() => setMiniSidebar(false)}
        />

        {!isSmallScreen && (
          <Box
            className="sidebar-footer"
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: isMiniSidebar && !isHoverExpanded ? "center" : "flex-end",
              width: "100%",
              flexShrink: 0,
              pt: 0.5,
              pb: 0.5,
              px: isMiniSidebar && !isHoverExpanded ? 0 : 0.75,
              boxSizing: "border-box",
            }}
          >
            <Tooltip
              title={isMiniSidebar && !isHoverExpanded ? "Expand sidebar" : "Collapse sidebar"}
              placement="right"
              arrow
            >
              <ButtonBase
                aria-label={isMiniSidebar && !isHoverExpanded ? "Expand sidebar" : "Collapse sidebar"}
                aria-expanded={!isMiniSidebar || isHoverExpanded}
                className="sidebar-edge-toggle"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSideBarToggle();
                }}
              >
                <Box component="span" className="sidebar-edge-toggle-icon">
                  <KeyboardDoubleArrowLeft
                    sx={{
                      fontSize: 18,
                      transition: "transform 0.28s ease",
                      transform: isMiniSidebar && !isHoverExpanded ? "rotate(180deg)" : "none",
                    }}
                  />
                </Box>
              </ButtonBase>
            </Tooltip>
          </Box>
        )}
      </Stack>
    </Drawer>
  );
};

export { Sidebar };

