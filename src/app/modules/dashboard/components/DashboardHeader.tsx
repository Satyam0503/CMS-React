import { Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { memo } from "react";
import dayjs from "dayjs";
import { dateFormatter } from "../../../../utils/common";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export const DashboardHeader = memo((props: { fullName: string }) => {
  const intl = useIntl();
  return (
    <Stack
      direction={"row"}
      spacing={2}
      sx={{ justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}
    >
      <Stack>
        <Typography variant="h2">
          {intl.formatMessage({ id: "MESSAGE.WELCOME" })} {props.fullName || ""}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={2} sx={{
        alignItems: "center"
      }}>
        <Stack direction="row" spacing={1} sx={{
          alignItems: "start"
        }}>
          <Stack sx={{ width: "40px" }}>
            <img
              src={toAbsoluteUrl("media/Icons/Sun_behind_clouds.png")}
              alt="clouds"
            />
          </Stack>
          <Stack sx={{
            alignItems: "end"
          }}>
            <Typography variant="h3">
              {dateFormatter(dayjs(), "dddd")}
            </Typography>
            <Typography variant="body1">
              {dateFormatter(dayjs(), "ll")}
            </Typography>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
});
