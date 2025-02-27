import { Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { colors } from "../../theme/MuiTheme";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { useIntl } from "react-intl";
import { memo } from "react";
import dayjs from "dayjs";
import { dateFormatter } from "../../../../utils/common";

export const DashboardHeader = memo((props: { fullName: string }) => {
  const intl = useIntl();
  return (
    <Stack
      direction={"row"}
      mb={2}
      spacing={2}
      sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}
    >
      <Stack>
        <Typography variant="h2">
          {intl.formatMessage({ id: "MENU.WELCOME" })} {props.fullName || ""}
        </Typography>
        {/* <Typography
          variant="body1"
          sx={{ color: colors.alpha.neutral[600], mt: 1 }}
        >
          4{intl.formatMessage({ id: "NOTIFICATIONS.APPLICATIONS" })}
          <Link
            to={"#"}
          >
            {"Check the submissions"}
          </Link>
        </Typography> */}
      </Stack>

      <Stack direction="row" alignItems={"start"} spacing={1}>
        <Stack sx={{ width: "40px" }}>
          <img
            src={toAbsoluteUrl("media/Icons/Sun_behind_clouds.png")}
            alt="clouds"
          />
        </Stack>
        <Stack alignItems={"end"}>
          <Typography variant="h3">{dateFormatter(dayjs(), "dddd")}</Typography>
          <Typography variant="body1">
            {dateFormatter(dayjs(), "DD MMM YYYY")}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
});
