import { FC, useState } from "react";
import { Avatar, Box, ButtonBase, Drawer, Stack, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import { SidebarMenuMain } from "./sidebar-menu/SidebarMenuMain";
import { Close, KeyboardDoubleArrowLeft, PushPinOutlined } from "@mui/icons-material";
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
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const [openIndex, setOpenIndex] = useState<number | null>(null); // Track the open item index
  const companyLogo = useAppSelector((state) => state.user.userData?.companyLogo);

  const handleSideBarToggle = () => {
    if (isMiniSidebar) {
      setMiniSidebar(false);
      setHoverExpanded(false);
    } else {
      setMiniSidebar(true);
    }
    if (openIndex !== null) {
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
                  top: "0 !important",
                  bottom: "0 !important",
                  left: "0 !important",
                  marginTop: "0 !important",
                  marginBottom: "0 !important",
                  height: "100dvh !important",
                  maxHeight: "100dvh !important",
                  width: "var(--sidebar-current-width) !important",
                  borderRadius: "0 !important",
                  border: "none !important",
                  borderRight: "1px solid",
                  borderColor: "divider",
                  transform: "none !important",
                  boxShadow: "none !important",
                  zIndex: 1100,
                  overflow: "hidden",
                  transition: "width var(--sidebar-transition), box-shadow var(--sidebar-transition) !important",
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
      data-sidebar-mini={isSmallScreen || !isMiniSidebar || isHoverExpanded ? "false" : "true"}
      data-sidebar-hover-expanded={!isSmallScreen && isHoverExpanded ? "true" : "false"}
      data-sidebar-rail={!isSmallScreen ? "true" : "false"}
      data-sidebar-style={theme.appStyle}
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
          transition: "padding var(--sidebar-transition)",
          pt: isSmallScreen ? 1.5 : 1.25,
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
            justifyContent="center"
            sx={{ position: "relative", px: 1, pb: 1.5, pt: 0.5, borderBottom: "1px solid", borderColor: "divider" }}
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
                objectPosition: "center",
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
                position: "absolute",
                right: 8,
                top: "50%",
                transform: "translateY(-50%)",
                borderRadius: 1.5,
                color: "text.secondary",
                "&:hover": { bgcolor: "action.hover", color: "text.primary" },
              }}
            >
              <Close fontSize="small" />
            </ButtonBase>
          </Stack>
        )}

        {!isSmallScreen && (
          <Box
            className={`sidebar-brand violet-sidebar-brand ${isMiniSidebar && !isHoverExpanded ? "sidebar-brand--compact" : "sidebar-brand--wide"} ${companyLogo ? "" : "sidebar-brand--default"}`}
          >
            <Box
              component="img"
              alt="Company Logo"
              src={companyLogo || DEFAULT_COMPANY_LOGO}
              className={`violet-sidebar-brand-logo sidebar-brand-logo ${companyLogo && theme.appStyle === "violet" ? "has-tile" : ""}`}
            />
          </Box>
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
              title={isMiniSidebar ? (isHoverExpanded ? "Keep sidebar open" : "Expand sidebar") : "Collapse sidebar"}
              placement="right"
              arrow
            >
              <ButtonBase
                aria-label={isMiniSidebar ? (isHoverExpanded ? "Keep sidebar open" : "Expand sidebar") : "Collapse sidebar"}
                aria-expanded={!isMiniSidebar || isHoverExpanded}
                className="sidebar-edge-toggle"
                onClick={(event) => {
                  event.stopPropagation();
                  handleSideBarToggle();
                }}
              >
                <Box component="span" className="sidebar-edge-toggle-icon">
                  {isMiniSidebar && isHoverExpanded ? (
                    <PushPinOutlined sx={{ fontSize: 18 }} />
                  ) : (
                    <KeyboardDoubleArrowLeft
                      sx={{
                        fontSize: 18,
                        transition: "transform 0.28s ease",
                        transform: isMiniSidebar ? "rotate(180deg)" : "none",
                      }}
                    />
                  )}
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

