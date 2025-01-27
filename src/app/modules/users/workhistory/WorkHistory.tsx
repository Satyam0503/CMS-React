import { Card, Grid, IconButton, Link, Stack, Typography } from "@mui/material";
import { FC, useState } from "react";

import { useIntl } from "react-intl";
import { CalendarIcon } from "@mui/x-date-pickers";
import {
  Business,
  CorporateFare,
  DeleteOutline,
  Edit,
} from "@mui/icons-material";
import { colors } from "../../theme/MuiTheme";
import { CustomIconButton } from "../../components/CustomIconButton";
import { AddUpdateWorkHistory } from "./AddUpdateWorkHistory";

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
          >
            <Typography variant="h5" mb={2}>
              {intl.formatMessage({ id: "MENU.WORK_HISTORY" })}
            </Typography>

            {/* <CustomIconButton icon={<Add />} tooltip="Add"  /> */}
            <AddUpdateWorkHistory />
          </Stack>
          <Grid container display={"flex"} flexDirection={"column"} gap={1}>
            <Stack
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              direction={"row"}
            >
              <Stack direction="row" spacing={1} alignItems={"center"}>
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
                    <Business />
                  </Stack>
                </Stack>

                <Stack>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "COMPANY.PRESENT" })}
                  </Typography>
                  <Typography variant="body2" color={colors.alpha.primary[500]}>
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
                <CustomIconButton icon={<Edit />} tooltip="Edit" />
                <CustomIconButton icon={<DeleteOutline />} tooltip="Delete" />
              </Stack>
            </Stack>

            <Stack
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              direction={"row"}
            >
              <Stack direction="row" spacing={1} alignItems={"center"}>
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
                    <Business />
                  </Stack>
                </Stack>

                <Stack>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "COMPANY.PRESENT" })}
                  </Typography>
                  <Typography variant="body2" color={colors.alpha.primary[500]}>
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
                <CustomIconButton icon={<Edit />} tooltip="Edit" />
                <CustomIconButton icon={<DeleteOutline />} tooltip="Delete" />
              </Stack>
            </Stack>
          </Grid>
        </Card>
      </Grid>
    </>
  );
};
