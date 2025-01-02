import { Card, Grid, IconButton, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { useIntl } from "react-intl";
import { CalendarIcon } from "@mui/x-date-pickers";
import { CorporateFare } from "@mui/icons-material";
import { colors } from "../../theme/MuiTheme";

export const WorkHistory: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <Card className="p-5 w-100">
          <Typography variant="h5" sx={{ mb: 1 }}>
            {intl.formatMessage({ id: "MENU.WORK_HISTORY" })}
          </Typography>
          <Grid item xs={12} className="w-100 d-flex flex-column gap-4">
            <Stack
              direction="row"
              spacing={2}
              className="mb-2 align-items-center "
            >
              <Stack
                sx={{
                  background: colors.alpha.primary[100],
                  borderRadius: "4px",
                  p: "12px",
                }}
              >
                <CorporateFare sx={{ color: colors.alpha.primary[500] }} />
              </Stack>
              <Stack>
                <Typography
                  variant="body1"
                  className="text-gray-800 text-hover-primary fw-semibold "
                >
                  {intl.formatMessage({ id: "COMPANY.PRESENT" })}
                </Typography>
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.DOT_NET" })}
                </Typography>
                <Stack direction="row" spacing={1} alignItems={"center"}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "600" }}>
                    Kuwan wala, Dehradun
                  </Typography>
                  <Typography variant="subtitle2" className="text-muted">
                    <CalendarIcon />
                    Jan 2023- Jun 2024 (1 Year 5 Months)
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack
              direction="row"
              spacing={2}
              className="mb-2 align-items-center"
            >
              <Stack
                sx={{
                  background: colors.alpha.primary[100],
                  borderRadius: "4px",
                  p: "12px",
                }}
              >
                <CorporateFare sx={{ color: colors.alpha.primary[500] }} />
              </Stack>
              <Stack>
                <Typography
                  variant="body1"
                  className="text-gray-800 text-hover-primary fw-semibold "
                >
                  SoftMicro Technology Org
                </Typography>
                <Typography variant="body2">
                  {intl.formatMessage({ id: "POSITION.DOT_NET" })}
                </Typography>
                <Stack direction="row" spacing={1} alignItems={"center"}>
                  <Typography variant="subtitle1" sx={{ fontWeight: "600" }}>
                    Kuwan wala, Dehradun
                  </Typography>
                  <Typography variant="subtitle2" className="text-muted">
                    <CalendarIcon />
                    Jun 2022- Jan 2023 (1 Year 5 Months)
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Grid>
        </Card>
      </Grid>
    </>
  );
};
