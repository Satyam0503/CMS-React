import React, { ReactNode, useEffect, useState } from "react";
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

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

const SidebarMenuItemWithSub: React.FC<Props> = ({
  children,
  title,
  icon,
  index,
  isOpen,
  hasActiveChild = false,
  isMiniSidebar,
  setCurrentMenuIndex,
  onExpandSidebar,
}) => {
  const [isTooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    if (!isMiniSidebar) setTooltipOpen(false);
  }, [isMiniSidebar]);

  const handleMenuToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isMiniSidebar) {
      onExpandSidebar?.();
      setCurrentMenuIndex(index);
      return;
    }
    if (isOpen) {
      setCurrentMenuIndex(null);
    } else {
      setCurrentMenuIndex(index);
    }
  };

  return (
    <>
      <Tooltip
        title={title}
        placement="right"
        arrow
        open={isMiniSidebar && isTooltipOpen}
        onOpen={() => setTooltipOpen(true)}
        onClose={() => setTooltipOpen(false)}
        disableHoverListener={!isMiniSidebar}
      >
        <ListItemButton
          onClick={handleMenuToggle}
          selected={hasActiveChild}
          aria-expanded={isOpen}
          className="sidebar-menu-item sidebar-parent-item"
        >
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText primary={title} />
          {isOpen ? <ExpandLess className="menu-arrow" /> : <ExpandMore className="menu-arrow" />}
        </ListItemButton>
      </Tooltip>
      <Collapse in={!isMiniSidebar && isOpen} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ paddingInlineStart: isMiniSidebar ? 0 : 2, width: "100%" }}>
          {children}
        </List>
      </Collapse>
    </>
  );
};

export { SidebarMenuItemWithSub };
