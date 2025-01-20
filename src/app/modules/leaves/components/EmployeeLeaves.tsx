import {
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";
// import IconStat from "../components/IconStat";
// import { colors } from "../theme/MuiTheme";
import {
  Home,
  HourglassBottom,
  HourglassTop,
  WorkOff,
} from "@mui/icons-material";
// import BasicTable from "../components/BasicTable";
import AddLeaves from "./AddLeaves";
import LeaveAssignment from "./LeaveAssignment";
import LeaveSummary from "./LeaveSummary";
import IconStat from "../../components/IconStat";
import { colors } from "../../theme/MuiTheme";
import BasicTable from "../../components/BasicTable";
import { LeaveCalender } from "./LeaveCalender";
// import { LeaveCalender } from "./components/LeaveCalender";

export const EmployeeLeaves: FC = () => {
  const intl = useIntl();

  return (
    <Grid
      container
      sx={{
        display: "flex",
        gap: "10px",
      }}
    >
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <IconStat
                iconBg={colors.alpha.secondary[100]}
                icon={<HourglassBottom fontSize="large" />}
                iconColor={colors.alpha.secondary[500]}
                number={"3"}
                title="First Half"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <IconStat
                iconBg={colors.alpha.primary[100]}
                icon={<HourglassTop fontSize="large" />}
                iconColor={colors.alpha.primary[500]}
                number={"1"}
                title="Second Half"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <IconStat
                iconBg={colors.alpha.info[100]}
                icon={<Home fontSize="large" />}
                iconColor={colors.alpha.info[600]}
                number={"1"}
                title="Work from Home"
              />
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <IconStat
                iconBg={colors.alpha.danger[100]}
                icon={<WorkOff fontSize="large" />}
                iconColor={colors.alpha.danger[400]}
                number={"7"}
                title="Absent"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid
        container
        display={"flex"}
        justifyContent={"space-between"}
        gap={"2"}
      >
        <Stack>
          <LeaveCalender />
        </Stack>
        <Stack direction="row" spacing={1}>
          <Stack>
            <LeaveAssignment />
          </Stack>
          <Stack>
            <AddLeaves />
          </Stack>
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Stack spacing={2}>
          <LeaveSummary />
          {/* <CustomisedTable columns={EmployeeLeaves} /> */}
          <BasicTable />
        </Stack>
      </Grid>
    </Grid>
  );
};
