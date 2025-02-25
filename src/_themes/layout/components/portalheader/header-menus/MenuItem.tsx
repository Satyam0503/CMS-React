import { FC } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { checkIsActive, KTIcon } from "../../../../helpers";
import { Grid, Typography } from "@mui/material";

type Props = {
  to: string;
  title: string;
  icon?: string;
  fontIcon?: string;
  hasArrow?: boolean;
  hasBullet?: boolean;
};

const MenuItem: FC<Props> = ({
  to,
  title,
  icon,
  fontIcon,
  hasArrow = false,
  hasBullet = false,
}) => {
  const { pathname } = useLocation();

  return (
    <Grid item className="menu-item me-lg-1">
      <Link
        className={clsx("menu-link py-3", {
          "active menu-here": checkIsActive(pathname, to),
        })}
        to={to}
      >
        <Typography variant="body1">{title}</Typography>
        {/* <span className="menu-title">{title}</span> */}
        {/* {hasBullet && (
          <span className='menu-bullet'>
            <span className='bullet bullet-dot'></span>
          </span>
        )} */}

        {/* {icon && (
          <span className="menu-icon">
            <KTIcon iconName={icon} className="fs-2" />
          </span>
        )} */}

        {/* {fontIcon && (
          <span className="menu-icon">
            <i className={clsx("bi fs-3", fontIcon)}></i>
          </span>
        )} */}

        {/* {hasArrow && <span className="menu-arrow"></span>} */}
      </Link>
    </Grid>
  );
};

export { MenuItem };
