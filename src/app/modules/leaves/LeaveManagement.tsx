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
import IconStat from "../../shared/components/IconStat";
import { LeavesModel } from "../../../utils/common_types";
import { LeaveRequest } from "./components/LeaveRequest";
import { Days } from "../../../utils/constant/Constant";
import { LeaveManagementTabs } from "./components/LeaveManagementTabs";
import { LeaveManagementRoutes } from "../../routing/LeaveManagementRoutes";
import { usePageData } from "../../Context/PageDataProvider";

const LeaveManagement: FC = () => {
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
    <Stack className="gap-4 flex-grow-1 ">
      <Grid container spacing={2}>
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
      <Stack className="flex-grow-1">
        <LeaveManagementRoutes />
      </Stack>
    </Stack>
  );
};

export default LeaveManagement;
