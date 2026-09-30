import { FC, ReactNode } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import { checkIsActive } from "../../../../helpers";
import { ListItemButton, ListItemIcon, ListItemText, Tooltip } from "@mui/material";

type Props = {
  to: string;
  title: string;
  icon?: ReactNode;
  isMiniSidebar: boolean;
};

const SidebarMenuItem: FC<Props> = ({
  to,
  title,
  icon,
  isMiniSidebar,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);

  return (
    <Tooltip title={title} placement="right" arrow disableHoverListener={!isMiniSidebar}>
      <ListItemButton
        component={Link}
        to={to}
        className="sidebar-menu-item"
        selected={isActive}
      >
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText primary={title} />
      </ListItemButton>
    </Tooltip>
  );
};

export { SidebarMenuItem };
