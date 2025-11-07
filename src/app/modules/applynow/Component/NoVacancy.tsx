import { Typography, Grid, Stack, Box } from "@mui/material";
import { useIntl } from "react-intl";
import { auto } from "@popperjs/core";
import { toAbsoluteUrl } from "../../../../_themes/helpers";

export default function NoVacancy() {
  const intl = useIntl();

  return (
    <>
      <Grid container display={"flex"} gap={1.5} justifyContent={'center'}>
        <Stack spacing={1} display={"flex"} gap={1.5} className="no-vaccancies-header">
          <Typography variant="h4" color="primary.main" fontWeight={'600'}>
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

        <Box component={'div'} display={'flex'} justifyContent={'center'} alignContent={'center'}>
          <img
            src={toAbsoluteUrl("media/auth/work_in_progress.svg")}
            width={"60%"}
            height={"90%"}
          />
        </Box>

        <Stack m={auto} textAlign={"justify"}>
          <Typography variant="body1" fontWeight={400} fontSize={'14px'}>
            {intl.formatMessage({
              id: "VACANCY.TEXT3",
            })}
          </Typography>
        </Stack>
      </Grid>
    </>
  );
}
