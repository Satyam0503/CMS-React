import { FC } from "react";
import { useLocation } from "react-router";
import { Link } from "react-router-dom";
import clsx from "clsx";
import { checkIsActive } from "../../../../helpers";
import { Grid, Typography } from "@mui/material";
import { colors } from "../../../../../app/modules/theme/MuiTheme";

type Props = {
  to: string;
  title: string;
  icon?: string;
  fontIcon?: string;
  hasArrow?: boolean;
  hasBullet?: boolean;
};

const MenuItem: FC<Props> = ({ to, title }) => {
  const { pathname } = useLocation();

  return (
    <Grid item className="menu-item me-lg-1">
      <Link
        className={clsx("menu-link ", {
          "active menu-here": checkIsActive(pathname, to),
        })}
        to={to}
      >
        <Typography
          variant="body1"
          color={colors.alpha.neutral[500]}
          sx={{
            pointer: "cursor",
            "&:hover": {
              color: colors.alpha.primary[500],
            },
          }}
        >
          {title}
        </Typography>
      </Link>
    </Grid>
  );
};

export { MenuItem };
