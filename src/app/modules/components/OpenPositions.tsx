import { Card, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import { colors } from "../theme/MuiTheme";

export default function OpenPositions() {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <Card sx={{ px: 3, width: "100%", py: 2, minHeight: "280px" }}>
          <Stack>
            <Stack
              display={"flex"}
              justifyContent={"space-between"}
              flexDirection={"row"}
              alignItems={"center"}
              mb={1}
            >
              <Typography variant="h6">
                {intl.formatMessage({ id: "MENU.OPEN_POSITIONS" })}
              </Typography>
              <Typography variant="h4">15</Typography>
            </Stack>

            <Grid item display={"flex"} direction={"column"} gap={1}>
              <Grid item display={"flex"} alignItems={"center"} gap={1}>
                <Grid className=" symbol symbol-45px">
                  <img src={toAbsoluteUrl("media/avatars/300-6.jpg")} alt="" />
                </Grid>

                <Grid flexGrow={1}>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "POSITION.FULL_STACK" })}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: colors.alpha.neutral[400] }}
                  >
                    5-25 years
                  </Typography>
                </Grid>

                <Typography variant="h6">2</Typography>
              </Grid>

              <Grid item display={"flex"} alignItems={"center"} gap={1}>
                <Grid className=" symbol symbol-45px">
                  <img src={toAbsoluteUrl("media/avatars/300-6.jpg")} alt="" />
                </Grid>

                <Grid flexGrow={1}>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "POSITION.FULL_STACK" })}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: colors.alpha.neutral[400] }}
                  >
                    5-25 years
                  </Typography>
                </Grid>

                <Typography variant="h6">2</Typography>
              </Grid>

              <Grid item display={"flex"} alignItems={"center"} gap={1}>
                <Grid className=" symbol symbol-45px">
                  <img src={toAbsoluteUrl("media/avatars/300-6.jpg")} alt="" />
                </Grid>

                <Grid flexGrow={1}>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "POSITION.INTERN" })}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: colors.alpha.neutral[400] }}
                  >
                    Technical Graduate
                  </Typography>
                </Grid>

                <Typography variant="h6">10</Typography>
              </Grid>

              <Grid item display={"flex"} alignItems={"center"} gap={1}>
                <Grid className="symbol symbol-45px">
                  <img src={toAbsoluteUrl("media/avatars/300-6.jpg")} alt="" />
                </Grid>

                <Grid flexGrow={1}>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "POSITION.TA" })}
                  </Typography>

                  <Typography
                    variant="body2"
                    sx={{ color: colors.alpha.neutral[400] }}
                  >
                    2-5 years
                  </Typography>
                </Grid>

                <Typography variant="h6">1</Typography>
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Grid>
    </>
  );
}
