import * as React from "react";
import {
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Stack,
  Typography,
  FormControl,
  Select,
  MenuItem,
} from "@mui/material";
import { FC } from "react";
import { useIntl } from "react-intl";
// import IconStat from "../components/IconStat";
// import { colors } from "../theme/MuiTheme";
import {
  Add,
  Download,
  FilterList,
  Home,
  HourglassBottom,
  HourglassTop,
  WorkOff,
} from "@mui/icons-material";
// import BasicTable from "../components/BasicTable";
import AddLeaves from "./components/AddLeaves";
import LeaveAssignment from "./components/LeaveAssignment";
import LeaveSummary from "./components/LeaveSummary";
import IconStat from "../../shared/components/IconStat";
import { colors } from "../theme/MuiTheme";
import BasicTable from "../../shared/components/BasicTable";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import {
  Days,
  LeaveMangementTableColumnList,
  LeaveSummaryTableColumnList,
} from "../../../utils/constant/Constant";
import { LeavesModel } from "../../../utils/common_types";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { SearchInput } from "../../shared/components/SearchInput";
import { SelectInput } from "../../shared/components/form-component/SelectInput";

export const EmployeeLeaves: FC = () => {
  const intl = useIntl();
  const [searchValue, setSearchValue] = React.useState("");
  const [LeaveList, setLeaveList] = React.useState<LeavesModel[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const [isLoading, setLoading] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState("today");

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value);
  }, []);
  const handleChange = (event: any) => {
    setSelectedDay(event.target.value);
  };

  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.LEAVE_MGMT" })}
      </Typography>
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
            <Card sx={{ p: "2rem" }}>
              <CustomisedTable
                tabName="Leave Requests"
                columns={LeaveSummaryTableColumnList}
                rows={LeaveList}
                page={page}
                rowsPerPage={rowPerPage}
                loading={isLoading}
              />
            </Card>
            <Card sx={{ p: "2rem" }}>
              <Typography variant="h6" mb={3}>
                {intl.formatMessage({ id: "MENU.LEAVE_REQUEST" })}
              </Typography>
              <Stack
                direction="row"
                display={"flex"}
                justifyContent={"space-between"}
                alignItems={"center"}
                flexWrap={"wrap-reverse"}
                gap={2}
              >
                <SearchInput
                  search={searchValue}
                  setSearch={handleSearchChange}
                />

                <Stack direction="row" spacing={1}>
                  <CustomIconButton
                    tooltip="Filter List"
                    icon={<FilterList />}
                  />
                  <CustomIconButton tooltip="Add leaves" icon={<Add />} />
                  <CustomIconButton
                    tooltip="Import Excel"
                    icon={<Download />}
                  />
                </Stack>
              </Stack>
              <CustomisedTable
                tabName="Leave Requests"
                columns={LeaveMangementTableColumnList}
                rows={LeaveList}
                page={page}
                rowsPerPage={rowPerPage}
                loading={isLoading}
              />
            </Card>
          </Stack>
        </Grid>
      </Grid>
    </>
  );
};
