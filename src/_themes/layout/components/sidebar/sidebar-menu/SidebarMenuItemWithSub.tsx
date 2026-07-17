import React, { ReactNode } from "react";
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

type Props = {
  index: number;
  isOpen: boolean;
  to: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  isMiniSidebar: boolean;
  setCurrentMenuIndex: (index: number | null) => void;
};

const SidebarMenuItemWithSub: React.FC<Props> = ({
  children,
  title,
  icon,
  index,
  isOpen,
  isMiniSidebar,
  setCurrentMenuIndex
}) => {

  const handleMenuToggle = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (isOpen) {
      setCurrentMenuIndex(null)
    } else {
      setCurrentMenuIndex(index);
    }
  }

  return (
    <>
      <Tooltip title={title} placement="right" arrow disableHoverListener={!isMiniSidebar}>
        <ListItemButton onClick={handleMenuToggle} sx={{ color: 'common.white' }} className="sidebar-menu-item">
          <ListItemIcon>
            {icon}
          </ListItemIcon>
          <ListItemText primary={title} slotProps={{ primary: { color: "common.white" } }} />
          {isOpen ? <ExpandLess className="menu-arrow" /> : <ExpandMore className="menu-arrow" />}
        </ListItemButton>
      </Tooltip>
      <Collapse in={isOpen} timeout="auto" unmountOnExit >
        <List component="div" disablePadding sx={{ paddingInlineStart: 2 }}>
          {children}
        </List>
      </Collapse>
    </>
  );
};

export { SidebarMenuItemWithSub };
