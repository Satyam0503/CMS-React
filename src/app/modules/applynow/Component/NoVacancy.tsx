import { Typography, Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { auto } from "@popperjs/core";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export default function NoVacancy() {
  const intl = useIntl();

  return (
    <>
      <Grid
        container
        sx={{
          display: "flex",
          gap: 1.5
        }}>
        <Stack spacing={1}>
          <Typography variant="h4" sx={{
            color: "primary.main"
          }}>
            {intl.formatMessage({
              id: "VACANCY.TEXT1",
            })}
          </Typography>

          <Typography
            variant="h6"
            sx={{
              textAlign: "justify",
              fontWeight: 400
            }}>
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

        <Stack
          sx={{
            m: auto,
            textAlign: "justify"
          }}>
          <Typography variant="body1" sx={{
            fontWeight: 400
          }}>
            {intl.formatMessage({
              id: "VACANCY.TEXT3",
            })}
          </Typography>
        </Stack>
      </Grid>
    </>
  );
}
