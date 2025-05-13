import { FC, ReactNode } from "react";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useLocation } from "react-router";
import { checkIsActive, WithChildren } from "../../../../helpers";
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
}) => {
  const { pathname } = useLocation();
  const isActive = checkIsActive(pathname, to);

  return (
    <Stack className="menu-item">
      <Link
        className={clsx("menu-link without-sub", { active: isActive })}
        to={to}
        color="secondary.main"
      >
        <Box component={"div"} className="menu-icon" >{icon}</Box>
        <Box component={"p"} className="menu-title" >{title}</Box>
      </Link>
      {children}
    </Stack>
  );
};

export { SidebarMenuItem };
