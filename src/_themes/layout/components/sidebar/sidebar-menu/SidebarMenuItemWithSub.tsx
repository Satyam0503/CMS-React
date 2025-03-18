import React, { ReactNode } from "react";
import clsx from "clsx";
import { useLocation } from "react-router";
import { checkIsActive, WithChildren } from "../../../../helpers";
import { useLayout } from "../../../core";
import { Box, Grid } from "@mui/material";

type Props = {
  to: string;
  title: string;
  icon?: ReactNode;
  fontIcon?: string;
  hasBullet?: boolean;
};

const SidebarMenuItemWithSub: React.FC<Props & WithChildren> = ({
  children,
  to,
  title,
  icon,
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);
  const { config } = useLayout();
  const { app } = config;

  return (
    <Grid
      item
      className={clsx("menu-item", { "here show": isActive }, "menu-accordion")}
      data-kt-menu-trigger="click"
    >
      <Box className="menu-link">
        <Box className="menu-icon">{icon}</Box>
        <Box className="menu-title">{title}</Box>
        <Box className="menu-arrow" />
      </Box>
      <Box
        className={clsx("menu-sub menu-sub-accordion", {
          "menu-active-bg": isActive,
        })}
      >
        {children}
      </Box>
    </Grid>
  );
};

export { SidebarMenuItemWithSub };
