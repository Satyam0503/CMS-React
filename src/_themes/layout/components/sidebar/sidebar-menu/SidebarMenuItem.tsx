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
      <ListItemButton className="sidebar-menu-item " sx={{ color: "common.white" }} selected={isActive} onClick={() => navigate(to)} >
        <ListItemIcon sx={{ color: "common.white" }}>
          {icon}
        </ListItemIcon>
        <ListItemText primary={title} slotProps={{ primary: { color: "common.white" } }} />
      </ListItemButton>
    </Tooltip>
  );
};

export { SidebarMenuItem };
