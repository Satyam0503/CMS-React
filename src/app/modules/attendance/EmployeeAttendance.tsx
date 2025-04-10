import React, { FC, useEffect } from "react";

import { useIntl } from "react-intl";
import IconStat from "../../shared/components/IconStat";
import {
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import {
  EventAvailable,
  EventBusy,
  Home,
  HourglassBottom,
  HourglassTop,
  SupervisorAccount,
  SupervisorAccountOutlined,
  SupervisorAccountTwoTone,
  TimerOff,
  TimerOffOutlined,
  WorkOff,
} from "@mui/icons-material";
import { colors } from "../theme/MuiTheme";
import { usePageData } from "../../../_themes/layout/core";
import AddLeaves from "../leaves/components/AddLeaves";

import { Days } from "../../../utils/constant/Constant";

const EmployeeAttendance: FC = () => {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  const [selectedDay, setSelectedDay] = React.useState("today");
  const handleChange = (event: any) => {
    setSelectedDay(event.target.value);
  };

  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.ATTENDANCE" }));
  }, []);
  return (
    <>
      <Grid
        container
        sx={{
          display: "flex",
          gap: 2,
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <IconStat
                  iconBg={colors.alpha.success[100]}
                  icon={<EventAvailable fontSize="large" />}
                  iconColor={colors.alpha.success[500]}
                  number={"175"}
                  title="Present"
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <IconStat
                  iconBg={colors.alpha.warning[100]}
                  icon={<TimerOffOutlined fontSize="large" />}
                  iconColor={colors.alpha.warning[700]}
                  number={"16"}
                  title="Late"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <IconStat
                  iconBg={colors.alpha.danger[100]}
                  icon={<EventBusy fontSize="large" />}
                  iconColor={colors.alpha.danger[500]}
                  number={"1"}
                  title="Abscent"
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <IconStat
                  iconBg={colors.alpha.primary[100]}
                  icon={<SupervisorAccount fontSize="large" />}
                  iconColor={colors.alpha.primary[500]}
                  number={"200"}
                  title="Total"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid
          container
          display={"flex"}
          justifyContent={"space-between"}
          gap={2}
        >
          <Stack>
            <Select
              name="days"
              onChange={handleChange}
              value={selectedDay}
              sx={{
                minWidth: "130px",
                bgcolor: colors.alpha.white[500],
              }}
            >
              {Days.map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </Stack>

          <Stack>
            <AddLeaves />
          </Stack>
        </Grid>
        <Grid item xs={12}>
          <Card>Custom Table</Card>
        </Grid>
      </Grid>
    </>
  );
};

export default EmployeeAttendance;
