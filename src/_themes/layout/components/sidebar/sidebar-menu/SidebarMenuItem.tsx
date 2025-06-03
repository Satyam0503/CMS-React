import { FC, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { checkIsActive } from "../../../../helpers";
import { ListItemButton, ListItemIcon, ListItemText, Stack } from "@mui/material";

type Props = {
  to: string;
  title: string;
  icon?: ReactNode;
};

const SidebarMenuItem: FC<Props> = ({
  to,
  title,
  icon,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);
  const navigate = useNavigate();

  return (
    <ListItemButton className="sidebar-menu-item " sx={{ color: "common.white" }} selected={isActive} onClick={() => navigate(to)} >
      <ListItemIcon sx={{ color: "common.white" }}>
        {icon}
      </ListItemIcon>
      <ListItemText primary={title} />
    </ListItemButton>
  );
};

export { SidebarMenuItem };
