import React, { FC, useEffect } from "react";

import { useIntl } from "react-intl";
import IconStat from "../../shared/components/IconStat";
import {
  Button,
  Card,
  CardContent,
  Grid,
  MenuItem,
  Select,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import {
  Add,
  Download,
  EventAvailable,
  EventBusy,
  FilterList,
  SupervisorAccount,
  TimerOffOutlined,
} from "@mui/icons-material";

import {
  AttendanceMangementTableColumnList,
  Days,
} from "../../../utils/constant/Constant";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { SearchInput } from "../../shared/components/SearchInput";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { AttendanceModel } from "../../../utils/common_types";
import { usePageData } from "../../Context/PageDataProvider";

const EmployeeAttendance: FC = () => {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  const [searchValue, setSearchValue] = React.useState("");
  const [selectedDay, setSelectedDay] = React.useState("today");
  const [AttendanceList, setAttendanceList] = React.useState<AttendanceModel[]>(
    []
  );
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const [isLoading, setLoading] = React.useState(false);
  const [page, setPage] = React.useState(0);
  const theme = useTheme();
  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value);
  }, []);
  const handleChange = (event: any) => {
    setSelectedDay(event.target.value);
  };

  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.ATTENDANCE" }));
  }, []);
  return (
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
                iconBg={theme.palette.primary.lighter}
                iconColor="info.dark"
                icon={<EventAvailable fontSize="large" />}
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
                iconBg={theme.palette.primary.lighter}
                icon={<TimerOffOutlined fontSize="large" />}
                iconColor={"success.light"}
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
                iconBg={theme.palette.secondary.lighter}
                icon={<EventBusy fontSize="large" />}
                iconColor={"warning.light"}
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
                iconBg={theme.palette.primary.lighter}
                icon={<SupervisorAccount fontSize="large" />}
                iconColor="primary.main"
                number={"200"}
                title="Total"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid item xs={12} className="d-flex justify-content-between">
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
      </Grid>

      <Grid item xs={12}>
        <Card sx={{ p: "2rem" }}>
          <Typography variant="h6" mb={3}>
            {intl.formatMessage({ id: "Modules.Attendance" })}
          </Typography>
          <Stack
            direction="row"
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap-reverse"}
            gap={2}
          >
            <SearchInput search={searchValue} setSearch={handleSearchChange} />

            <Stack direction="row" spacing={1}>
              <CustomIconButton tooltip="Filter List" icon={<FilterList />} />
              <CustomIconButton tooltip="Add Attendance" icon={<Add />} />
              <CustomIconButton tooltip="Import Excel" icon={<Download />} />
            </Stack>
          </Stack>
          <CustomisedTable
            tabName="Attendance"
            columns={AttendanceMangementTableColumnList}
            rows={AttendanceList}
            page={page}
            rowsPerPage={rowPerPage}
            loading={isLoading}
          />
        </Card>
      </Grid>
      <Grid item xs={12}>

      </Grid>
    </Grid>
  );
};

export default EmployeeAttendance;
