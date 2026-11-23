import { FC, ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const [isTooltipOpen, setTooltipOpen] = useState(false);

  useEffect(() => {
    if (!isMiniSidebar) setTooltipOpen(false);
  }, [isMiniSidebar]);

  return (
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
