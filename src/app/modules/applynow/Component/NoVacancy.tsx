import { Typography, Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { auto } from "@popperjs/core";
import { colors } from "../../theme/MuiTheme";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export default function NoVacancy() {
  const intl = useIntl();

  return (
    <>
      <Grid container display={"flex"} gap={1.5}>
        <Stack spacing={1}>
          <Typography variant="h4" color={colors.primary[500]}>
            {intl.formatMessage({
              id: "VACANCY.TEXT1",
            })}
          </Typography>

          <Typography variant="h6" textAlign={"justify"} fontWeight={400}>
            {intl.formatMessage({
              id: "VACANCY.TEXT2",
            })}
          </Typography>
        </Stack>

        <Stack>
          <img
            src={toAbsoluteUrl("media/auth/work_in_progress.svg")}
            width={"100%"}
            height={"100%"}
          />
        </Stack>

        <Stack m={auto} textAlign={"justify"}>
          <Typography
            variant="body1"
            color={colors.primary[500]}
            fontWeight={400}
          >
            {intl.formatMessage({
              id: "VACANCY.TEXT3",
            })}
          </Typography>
        </Stack>
      </Grid>
    </>
  );
}
