import { Card, Grid, IconButton, Link, Stack, Typography } from "@mui/material";
import { FC, useState } from "react";

import { useIntl } from "react-intl";
import { CalendarIcon } from "@mui/x-date-pickers";
import {
  Business,
  CalendarToday,
  CorporateFare,
  DeleteOutline,
  Edit,
} from "@mui/icons-material";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { AddUpdateWorkHistory } from "./components/AddUpdateWorkHistory";

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
              sx={{
                "&:hover .MuiStack-root": {
                  visibility: "visible",
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems={"center"}>
                <Stack
                  sx={{
                    minWidth: 48,
                    height: 48,
                    bgcolor: "primary.lighter",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                  }}
                >
                  <Stack color="primary.main">
                    <Business />
                  </Stack>
                </Stack>

                <Stack>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "COMPANY.PRESENT" })}
                  </Typography>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "POSITION.DOT_NET" })}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 0.5, sm: 2 }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Kuwan wala, Dehradun
                    </Typography>
                    <Stack direction={"row"} className="text-muted">
                      <CalendarToday sx={{ fontSize: "14px", mr: 0.5 }} />
                      <Typography variant="subtitle2">
                        Jan 2023- Jun 2024 (1 Year 5 Months)
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
              <Stack
                direction={"row"}
                spacing={1}
                sx={{
                  visibility: "hidden",
                  transition: "visibility 0.3s ease-in-out",
                }}
              >
                <CustomIconButton icon={<Edit />} tooltip="Edit" />
                <CustomIconButton icon={<DeleteOutline />} tooltip="Delete" />
              </Stack>
            </Stack>

            <Stack
              display={"flex"}
              justifyContent={"space-between"}
              alignItems={"center"}
              direction={"row"}
              sx={{
                "&:hover .MuiStack-root": {
                  visibility: "visible",
                },
              }}
            >
              <Stack direction="row" spacing={1} alignItems={"center"}>
                <Stack
                  sx={{
                    minWidth: 48,
                    height: 48,
                    bgcolor: "primary.lighter",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 1,
                  }}
                >
                  <Stack color="primary.main">
                    <Business />
                  </Stack>
                </Stack>

                <Stack>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "COMPANY.PRESENT" })}
                  </Typography>
                  <Typography variant="body2" color="primary.main">
                    {intl.formatMessage({ id: "POSITION.DOT_NET" })}
                  </Typography>

                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={{ xs: 0.5, sm: 2 }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      Kuwan wala, Dehradun
                    </Typography>
                    <Stack direction={"row"} className="text-muted">
                      <CalendarToday sx={{ fontSize: "14px", mr: 0.5 }} />
                      <Typography variant="subtitle2">
                        Jan 2023- Jun 2024 (1 Year 5 Months)
                      </Typography>
                    </Stack>
                  </Stack>
                </Stack>
              </Stack>
              <Stack
                direction={"row"}
                spacing={1}
                sx={{
                  visibility: "hidden",
                  transition: "visibility 0.3s ease-in-out",
                }}
              >
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
