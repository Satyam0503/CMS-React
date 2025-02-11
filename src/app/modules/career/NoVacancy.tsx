import { Typography, Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { colors } from "../theme/MuiTheme";
import { auto } from "@popperjs/core";

export default function NoVacancy() {
  const intl = useIntl();

  return (
    <>
      <Grid container display={"flex"} gap={1}>
        <Stack spacing={1}>
          <Typography variant="h4" color={colors.alpha.primary[500]}>
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

        <Stack mt={2}>
          <img
            src={toAbsoluteUrl("media/auth/work_in_progress.svg")}
            width={"100%"}
          />
        </Stack>

        <Stack m={auto} textAlign={"justify"}>
          <Typography
            variant="body1"
            color={colors.alpha.primary[500]}
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
