import React, { ReactNode, useEffect, useState } from "react";
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Popover,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useInRouterContext, useLocation } from "react-router-dom";

type Props = {
  index: number;
  isOpen: boolean;
  hasActiveChild?: boolean;
  to: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isMiniSidebar: boolean;
  setCurrentMenuIndex: (index: number | null) => void;
  onExpandSidebar?: () => void;
};

const SafeLocationWatcher: React.FC<{ onChange: () => void }> = ({ onChange }) => {
  const location = useLocation();
  useEffect(() => {
    onChange();
  }, [location.pathname, onChange]);
  return null;
};

const SidebarMenuItemWithSub: React.FC<Props> = ({
  children,
  title,
  icon,
  index,
  isOpen,
  hasActiveChild = false,
  isMiniSidebar,
  setCurrentMenuIndex,
}) => {
  const [isTooltipOpen, setTooltipOpen] = useState(false);
  const [flyoutAnchorEl, setFlyoutAnchorEl] = useState<HTMLElement | null>(null);
  const isFlyoutOpen = Boolean(flyoutAnchorEl);
  const inRouter = useInRouterContext();

  useEffect(() => {
    if (!isMiniSidebar) {
      setTooltipOpen(false);
      setFlyoutAnchorEl(null);
    }
  }, [isMiniSidebar]);

  const handleMenuToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isMiniSidebar) {
      setTooltipOpen(false);
      setFlyoutAnchorEl(flyoutAnchorEl ? null : e.currentTarget);
      return;
    }
    if (isOpen) {
      setCurrentMenuIndex(null);
    } else {
      setCurrentMenuIndex(index);
    }
  };

  const handleCloseFlyout = () => {
    setFlyoutAnchorEl(null);
  };

  return (
    <>
      {inRouter && <SafeLocationWatcher onChange={handleCloseFlyout} />}
      <Tooltip
        title={title}
        placement="right"
        arrow
        open={isMiniSidebar && isTooltipOpen && !isFlyoutOpen}
        onOpen={() => {
          if (!isFlyoutOpen) setTooltipOpen(true);
        }}
        onClose={() => setTooltipOpen(false)}
        disableHoverListener={!isMiniSidebar || isFlyoutOpen}
      >
        <ListItemButton
          onClick={handleMenuToggle}
          selected={hasActiveChild || isFlyoutOpen}
          aria-expanded={isMiniSidebar ? isFlyoutOpen : isOpen}
          aria-haspopup={isMiniSidebar ? "true" : undefined}
          className="sidebar-menu-item sidebar-parent-item"
        >
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText primary={title} />
          {isOpen ? <ExpandLess className="menu-arrow" /> : <ExpandMore className="menu-arrow" />}
        </ListItemButton>
      </Tooltip>

      {/* Floating flyout popover for collapsed mini-sidebar mode */}
      {isMiniSidebar && (
        <Popover
          open={isFlyoutOpen}
          anchorEl={flyoutAnchorEl}
          onClose={handleCloseFlyout}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
          slotProps={{
            paper: {
              className: "sidebar-flyout-paper",
              sx: {
                ml: 1.5,
                minWidth: 220,
                borderRadius: "14px",
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 12px 32px rgba(15, 23, 42, 0.18)",
                p: 0.75,
                bgcolor: "background.paper",
                backgroundImage: "none",
                overflow: "hidden",
                zIndex: 1400,
              },
            },
          }}
        >
          <Box sx={{ px: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider", mb: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box sx={{ color: "primary.main", display: "grid", placeItems: "center" }}>
                {icon}
              </Box>
              <Typography sx={{ fontWeight: 700, fontSize: "0.875rem", color: "text.primary" }}>
                {title}
              </Typography>
            </Stack>
          </Box>
          <List
            component="nav"
            disablePadding
            onClick={handleCloseFlyout}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.25,
              "& .sidebar-menu-item": {
                width: "100% !important",
                height: "auto !important",
                minHeight: "38px !important",
                margin: "1px 0 !important",
                padding: "6px 12px !important",
                justifyContent: "flex-start !important",
                borderRadius: "8px !important",
                "& .MuiListItemIcon-root": {
                  minWidth: "28px !important",
                  marginInlineEnd: "8px !important",
                  justifyContent: "center !important",
                },
                "& .MuiTypography-root": {
                  display: "block !important",
                  opacity: "1 !important",
                  fontSize: "0.84rem !important",
                  whiteSpace: "nowrap !important",
                },
              },
            }}
          >
            {React.Children.map(children, (child) => {
              if (!React.isValidElement(child)) return child;
              return React.cloneElement(child as React.ReactElement<any>, {
                isMiniSidebar: false,
              });
            })}
          </List>
        </Popover>
      )}

      {/* Accordion collapse for expanded sidebar mode */}
      <Collapse in={!isMiniSidebar && isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ paddingInlineStart: isMiniSidebar ? 0 : 2, width: "100%" }}>
          {children}
        </List>
      </Collapse>
    </>
  );
};

export { SidebarMenuItemWithSub };
