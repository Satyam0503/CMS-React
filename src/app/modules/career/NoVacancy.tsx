import { Typography, Grid } from "@mui/material";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../_themes/helpers";

export default function NoVacancy() {
  const intl = useIntl();

  return (
    <>
      <Grid container display={"flex"} justifyContent={"center"} gap={1}>
        <Typography variant="h6">
          {intl.formatMessage({
            id: "VACANCY.TEXT1",
          })}
        </Typography>

        <img
          src={toAbsoluteUrl("media/auth/workInProcess.jpg")}
          width={"100%"}
        />
        <Typography variant="h6">
          {intl.formatMessage({
            id: "VACANCY.TEXT2",
          })}
        </Typography>
        <Typography variant="h6">
          {intl.formatMessage({
            id: "VACANCY.TEXT3",
          })}
        </Typography>
      </Grid>
    </>
  );
}
