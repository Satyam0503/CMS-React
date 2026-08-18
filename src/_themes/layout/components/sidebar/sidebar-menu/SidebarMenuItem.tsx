import { FC, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
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
  const navigate = useNavigate();

  return (
    <Tooltip title={title} placement="right" arrow disableHoverListener={!isMiniSidebar}>
      <ListItemButton className="sidebar-menu-item" selected={isActive} onClick={() => navigate(to)}>
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText primary={title} />
      </ListItemButton>
    </Tooltip>
  );
};

export { SidebarMenuItem };
