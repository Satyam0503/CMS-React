import { Card, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useIntl } from "react-intl";
import {toAbsoluteUrl } from "../../../_themes/helpers";

export default function OpenPositions() {
  const intl = useIntl();
  return (
    <>
      <Grid container className="d-block">
        <Card className="p-6 w-100">
         
          <Stack>
            <Stack className="mb-4 d-flex flex-row justify-content-between align-items-center">
              <Typography variant="h6">
                {intl.formatMessage({ id: "MENU.OPEN_POSITIONS" })}
              </Typography>
            <Typography variant="h4">15</Typography>
            </Stack>

            <Grid className="card-body pt-2">
              <Grid className="d-flex align-items-center mb-3">
                <Grid className="me-4 symbol symbol-45px">
                    <img src={toAbsoluteUrl('media/avatars/300-6.jpg')} alt='' />
                </Grid>

                <Grid className="flex-grow-1">
                  <Typography
                    variant="body1"
                    className="text-gray-800 text-hover-primary fw-bold "
                  >
                   
                    {intl.formatMessage({ id: "POSITION.DOT_NET" })}
                  </Typography>

                  <Typography variant="body2"  className="text-muted d-block">
                    6-26 years
                  </Typography>
                </Grid>

                <Typography variant="h6">
                  2
                </Typography>
              </Grid>

              <Grid className="d-flex align-items-center mb-3">

                <Grid className="me-4 symbol symbol-45px">
                    <img src={toAbsoluteUrl('media/avatars/300-6.jpg')} alt='' />
                </Grid>

                <Grid className="flex-grow-1">
                  <Typography
                    variant="body1"
                    className="text-gray-800 text-hover-primary fw-bold fs-6"
                  >
                    {intl.formatMessage({ id: "POSITION.FULL_STACK" })}
                  </Typography>

                  <Typography variant="body2" className="text-muted  d-block">
                    5-25 years
                  </Typography>
                </Grid>

                <Typography variant ="h6" >
                  2
                </Typography>
              </Grid>

              <Grid className="d-flex align-items-center mb-3">

                <Grid className="me-4 symbol symbol-45px">
                    <img src={toAbsoluteUrl('media/avatars/300-6.jpg')} alt='' />
                </Grid>

                <Grid className="flex-grow-1">
                  <Typography
                    variant="body1"
                    className="text-gray-800 text-hover-primary fw-bold fs-6"
                  >
                    {intl.formatMessage({ id: "POSITION.INTERN" })}
                  </Typography>

                  <Typography variant="body2"  className="text-muted  d-block">
                    Technical Graduate
                  </Typography>
                </Grid>

                <Typography variant="h6" >
                  10
                </Typography>
              </Grid>

              <Grid className="d-flex align-items-center">
              <Grid className=" me-4 symbol symbol-45px">
                    <img src={toAbsoluteUrl('media/avatars/300-6.jpg')} alt='' />
                </Grid>

                <Grid className="flex-grow-1">
                  <Typography
                    variant="body1"
                    className="text-gray-800 text-hover-primary fw-bold fs-6"
                  >
                    {intl.formatMessage({ id: "POSITION.TA" })}
                  </Typography>

                  <Typography variant="body2"  className="text-muted  d-block">
                 2-5 years
                  </Typography>
                </Grid>

                <Typography variant="h6">
                  1
                </Typography>
              </Grid>
            </Grid>
          </Stack>
        </Card>
      </Grid>
    </>
  );
}
