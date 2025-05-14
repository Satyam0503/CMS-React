import React, { ReactNode } from "react";
import { useLocation } from "react-router";
import { checkIsActive, WithChildren } from "../../../../helpers";
import { Collapse, List, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";

type Props = {
  to: string;
  title: string;
  icon?: ReactNode;
};

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);
  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };

  return (
    <>
      <ListItemButton onClick={handleClick} sx={{ color: 'common.white' }} className="sidebar-menu-item">
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText primary={title} />
        {open ? <ExpandLess className="menu-arrow" /> : <ExpandMore className="menu-arrow" />}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit >
        <List component="div" disablePadding sx={{ paddingInlineStart: 2 }}>
          {children}
        </List>
      </Collapse>
    </>
  );
};

export { SidebarMenuItemWithSub };
