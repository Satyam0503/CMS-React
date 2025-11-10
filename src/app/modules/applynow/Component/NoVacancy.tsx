import { Typography, Grid, Stack, Box } from "@mui/material";
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
          gap: 1.5,
          justifyContent: 'center'
        }}>
        <Stack
          spacing={1}
          className="no-vaccancies-header"
          sx={{
            display: "flex",
            gap: 1.5
          }}>
          <Typography
            variant="h4"
            sx={{
              color: "primary.main",
              fontWeight: '600'
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

        <Box
          component={'div'}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignContent: 'center'
          }}>
          <img
            src={toAbsoluteUrl("media/auth/work_in_progress.svg")}
            width={"60%"}
            height={"90%"}
          />
        </Box>

        <Stack
          sx={{
            m: auto,
            textAlign: "justify"
          }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 400,
              fontSize: '14px'
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
