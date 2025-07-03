import * as React from "react";
import {
  Card,
  CardContent,
  Grid,
  Stack,
  Typography,
  Select,
  MenuItem,
  useTheme,
} from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";
import {
  Home,
  HourglassBottom,
  HourglassTop,
  WorkOff,
} from "@mui/icons-material";
import AddLeaves from "./components/AddLeaves";
import LeaveAssignment from "./components/LeaveAssignment";
import IconStat from "../../shared/components/IconStat";
import { LeavesModel } from "../../../utils/common_types";
import { usePageData } from "../../../_themes/layout/core";
import { LeaveRequest } from "./components/LeaveRequest";
import { Days } from "../../../utils/constant/Constant";

const EmployeeLeaves: FC = () => {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  const [searchValue, setSearchValue] = React.useState("");
  const [LeaveList, setLeaveList] = React.useState<LeavesModel[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const [isLoading, setLoading] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState("today");
  const theme = useTheme();
  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value);
  }, []);
  const handleChange = (event: any) => {
    setSelectedDay(event.target.value);
  };

  React.useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.LEAVE_MANAGEMENT" }));
  }, []);

  return (
    <React.Fragment>
      <Grid container className="gap-4">
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} lg={3}>
            <IconStat
              iconBg={theme.palette.secondary.lighter}
              icon={<HourglassBottom fontSize="large" />}
              iconColor="secondary.main"
              number={"3"}
              title="First Half"
            />
          </Grid>

          <Grid item xs={12} sm={6} lg={3}>
            <IconStat
              iconBg={theme.palette.primary.lighter}
              icon={<HourglassTop fontSize="large" />}
              iconColor="primary.main"
              number={"1"}
              title="Second Half"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IconStat
              iconBg={theme.palette.secondary.lighter}
              icon={<Home fontSize="large" />}
              iconColor="secondary.dark"
              number={"1"}
              title="Work from Home"
            />
          </Grid>
          <Grid item xs={12} sm={6} lg={3}>
            <IconStat
              iconBg={theme.palette.primary.lighter}
              icon={<WorkOff fontSize="large" />}
              iconColor="primary.dark"
              number={"7"}
              title="Absent"
            />
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
                bgcolor: "common.white",
              }}
            >
              {Days.map((item) => (
                <MenuItem key={item.id} value={item.value}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
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
          <LeaveRequest />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default EmployeeLeaves;
