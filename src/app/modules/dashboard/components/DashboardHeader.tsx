import { IconButton, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { useIntl } from "react-intl";
import { memo } from "react";
import dayjs from "dayjs";
import { dateFormatter } from "../../../../utils/common";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import RightDrawer from "./RightDrawer";

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
      </Stack>

      <Stack direction="row" alignItems="center" spacing={2}>
        <Stack direction="row" alignItems="start" spacing={1}>
          <Stack sx={{ width: "40px" }}>
            <img
              src={toAbsoluteUrl("media/Icons/Sun_behind_clouds.png")}
              alt="clouds"
            />
          </Stack>
          <Stack alignItems={"end"}>
            <Typography variant="h3">
              {dateFormatter(dayjs(), "dddd")}
            </Typography>
            <Typography variant="body1">
              {dateFormatter(dayjs(), "DD MMM YYYY")}
            </Typography>
          </Stack>
        </Stack>

        <IconButton
          sx={{
            bgcolor: 'primary.light',
            color: 'common.white',
            "&:hover": { bgcolor: 'primary.main' },
          }}
        >
          <RightDrawer />
        </IconButton>
      </Stack>
    </Stack>
  );
});
