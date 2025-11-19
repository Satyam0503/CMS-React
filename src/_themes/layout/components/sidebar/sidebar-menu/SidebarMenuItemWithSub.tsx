import React, { ReactNode } from "react";
import { useLocation } from "react-router";
import { checkIsActive } from "../../../../helpers";
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

type Props = {
  index: number;
  isOpen: boolean;
  to: string;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  setCurrentMenuIndex: (index: number | null) => void;
};

const SidebarMenuItemWithSub: React.FC<Props> = ({
  children,
  to,
  title,
  icon,
  index,
  isOpen,
  setCurrentMenuIndex
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);

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
      <ListItemButton onClick={handleMenuToggle} sx={{ color: 'common.white' }} className="sidebar-menu-item">
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText primary={title} slotProps={{ primary: { color: "common.white" } }} />
        {isOpen ? <ExpandLess className="menu-arrow" /> : <ExpandMore className="menu-arrow" />}
      </ListItemButton>
      <Collapse in={isOpen} timeout="auto" unmountOnExit >
        <List component="div" disablePadding sx={{ paddingInlineStart: 2 }}>
          {children}
        </List>
      </Collapse>
    </>
  );
};

export { SidebarMenuItemWithSub };
