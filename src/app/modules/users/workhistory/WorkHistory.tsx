import { Card, Grid, IconButton, Stack, Typography } from "@mui/material";
import { FC } from "react";

import { useIntl } from "react-intl";
import { CalendarIcon } from "@mui/x-date-pickers";
import { Add, CorporateFare, DeleteOutline, Edit } from "@mui/icons-material";
import { colors } from "../../theme/MuiTheme";
import IconStat from "../../components/IconStat";
import { CustomIconButton } from "../../components/CustomIconButton";

export const WorkHistory: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Grid container>
        <Card sx={{ p: 2, width: "100%" }}>
          <Stack
            direction={"row"}
            display={"flex"}
            justifyContent={"space-between"}
            mb={1}
          >
            <Typography variant="h5">
              {intl.formatMessage({ id: "MENU.WORK_HISTORY" })}
            </Typography>
            <CustomIconButton icon={<Add />} />
          </Stack>

          <Grid container display={"flex"} flexDirection={"column"} gap={1}>
            <Stack
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              direction={"row"}
            >
              {" "}
              <Stack direction="row" spacing={1} alignItems={"center"}>
                <Stack>
                  <Stack
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: colors.alpha.primary[100],
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                    }}
                  >
                    <Stack color={colors.alpha.primary[500]}>
                      <CorporateFare />
                    </Stack>
                  </Stack>
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
                    <Typography variant="subtitle1" fontWeight={600}>
                      Kuwan wala, Dehradun
                    </Typography>
                    <Typography variant="subtitle2">
                      <CalendarIcon />
                      Jan 2023- Jun 2024 (1 Year 5 Months)
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Stack direction={"row"} spacing={1}>
                <CustomIconButton icon={<Edit />}></CustomIconButton>
                <CustomIconButton icon={<DeleteOutline />}></CustomIconButton>
              </Stack>
            </Stack>

            <Grid
              container
              display={"flex"}
              justifyContent={"space-between"}
              gap={1}
            >
              <Stack direction="row" spacing={1} alignItems={"center"}>
                <Stack>
                  <Stack
                    sx={{
                      width: 48,
                      height: 48,
                      bgcolor: colors.alpha.primary[100],
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 1,
                    }}
                  >
                    <Stack color={colors.alpha.primary[500]}>
                      <CorporateFare />
                    </Stack>
                  </Stack>
                </Stack>
                <Stack>
                  <Typography variant="body1">
                    SoftMicro Technology Org
                  </Typography>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "POSITION.DOT_NET" })}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems={"center"}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      Kuwan wala, Dehradun
                    </Typography>
                    <Typography variant="subtitle2" className="text-muted">
                      <CalendarIcon />
                      Jun 2022- Jan 2023 (1 Year 5 Months)
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
              <Stack direction={"row"} spacing={1}>
                <CustomIconButton icon={<Edit />}></CustomIconButton>
                <CustomIconButton icon={<DeleteOutline />}></CustomIconButton>
              </Stack>
            </Grid>
          </Grid>
        </Card>
      </Grid>
    </>
  );
};
