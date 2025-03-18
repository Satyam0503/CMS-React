import { FC, ReactNode } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import { checkIsActive, WithChildren } from "../../../../helpers";
import { useLayout } from "../../../core";
import { Box, Stack } from "@mui/material";

type Props = {
  to: string;
  title: string;
  icon?: ReactNode;
  fontIcon?: string;
  hasBullet?: boolean;
};

const SidebarMenuItem: FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
  hasBullet = false,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);
  const { config } = useLayout();
  const { app } = config;

  return (
    <Stack className="menu-item">
      <Link
        className={clsx("menu-link without-sub", { active: isActive })}
        to={to}
      >
        <Box className="menu-icon">{icon}</Box>
        <Box className="menu-title">{title}</Box>
      </Link>
      {children}
    </Stack>
  );
};

export { SidebarMenuItem };
