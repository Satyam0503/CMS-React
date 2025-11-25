import {
  Avatar,
  Box,
  Card,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  IconButton,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { useEffect, useState } from "react";
import {
  EmployeeLeaveBalanceData,
  EmployeeLeaveBalanceFilter,
  LeaveBalance,
  LeaveBalanceRequestModel,
} from "../model";
import { Pagination } from "../../../shared/components/Pagination";
import { useAppSelector } from "../../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { FilterComponent } from "../../../shared/components/FilterComponent";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { getAllEmployeeLeaveBalance } from "../leaveServices";
import EditEmployeePoliciesForm from "./EditEmployeePoliciesForm";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useDebounce } from "../../../hooks/useDebounce";
import FilterPolicySearch from "./FilterPolicySearch";

const initialLeavBalanceValue: LeaveBalanceRequestModel = {
  employeeId: "",
  leaveTypeBalances: [],
};

export const EmployeesLeaveBalance = () => {
  const { formatMessage: i } = useIntl();
  const { currentLanguage } = useAppLang();
  const defaultLang = useAppSelector(
    (state) => state.user.userData?.defaultLanguage!
  );

  const [isOpen, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [initialBalance, setInitialBalance] = useState(initialLeavBalanceValue);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();
  const currentUserId = useAppSelector((state) => state.user.userData?.userId)!;
  const [isLoading, setLoading] = useState(true);
  const [search, setSearch] = useState<string>("");
  const debouncedValue = useDebounce(search);
  const [openOptions, setOpenOptions] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(true);
    setAnchorEl(event.currentTarget);
  };
  const [pageNo, setPageNo] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [employeeBalance, setEmployeeBalance] = useState<
    EmployeeLeaveBalanceData[]
  >([]);
  const [selectedEmployeeBalance, setSelectedEmployeeBalance] =
    useState<EmployeeLeaveBalanceData>();
  const [refresh, setRefresh] = useState<boolean>(false);
  const [policies, setPolicies] = useState<Array<string>>([]);

  function handleClickOptions(emp: EmployeeLeaveBalanceData) {
    setSelectedEmployeeBalance(emp);
    setOpenOptions(true);
  }

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
    setOpenOptions(false);
  };

  function setRowPerPage(rowPerPage: number) {
    setPageSize(rowPerPage);
  }

  function setPage(pageValue: number) {
    setPageNo(pageValue);
  }

  function handleRefresh() {
    setRefresh(!refresh);
  }

  function handleSelectingPolicies(policyIds: Array<string>) {
    setPolicies(policyIds);
  }

  useEffect(() => {
    const getLeaveBalanceFunc = async () => {
      setLoading(true);
      const payload: EmployeeLeaveBalanceFilter = {
        pageNo: pageNo + 1,
        pageSize: pageSize,
        employeeName: debouncedValue.trim(),
        leavePolicies: policies,
      };
      try {
        const { data } = await getAllEmployeeLeaveBalance(payload);
        if (data.success) {
          setEmployeeBalance(data.methodResults);
          setTotalRecords(data.totalRecords);
          // console.log(data);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };

    getLeaveBalanceFunc();
  }, [refresh, pageSize, debouncedValue, policies]);

  return (
    <>
      <Card className="p-4 gap-4 d-flex flex-column flex-grow-1">
        <Stack
          direction={"row"}
          sx={{ width: "100%", justifyContent: "space-between", gap: "15px" }}
        >
          <TextField
            id="outlined-search"
            variant="outlined"
            placeholder={i({ id: "PLACEHOLDER.SEARCH" })}
            size="small"
            onChange={(e) => {
              // console.log(e.target.value);
              setSearch(e.target.value);
            }}
            slotProps={{
              htmlInput: {
                sx: {
                  paddingInline: 0,
                },
              },
              input: {
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginRight: "0" }}>
                    <SearchIcon sx={{ color: "gray" }} />
                  </InputAdornment>
                ),
              },
            }}
          />
          <CustomIconButton
            icon={<FilterAltIcon />}
            handleClick={(e) => handleClick(e)}
            tooltip={i({ id: "LEAVE.TITLES.ADD_LEAVE_BALANCE" })}
          />
        </Stack>
        <Grid container spacing={2}>
          {employeeBalance.map((emp) => {
            return (
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  md: 6,
                  lg: 3,
                }}
                key={emp.employeeId}
              >
                <Card>
                  <Stack spacing={1} sx={{ padding: "7px 10px" }}>
                    <Box
                      component={"div"}
                      sx={{
                        backgroundColor: "#d3d3d336",
                        padding: "10px 15px",
                        borderRadius: "4px",
                        position: "relative",
                      }}
                    >
                      <Stack>
                        <Avatar
                          src={emp.profilePicture!}
                          alt="Profile Pic"
                          sx={{
                            height: "70px",
                            width: "70px",
                            marginBottom: "5px",
                          }}
                        />
                        <Typography variant="h6" color="initial">
                          {emp.employeeName}
                        </Typography>
                        <Typography
                          variant="h6"
                          color="initial"
                          sx={{
                            fontWeight: "400",
                            color: "text.disabled",
                            // marginTop: "6px",
                          }}
                        >
                          {emp.designation
                            ? emp.designation![currentLanguage] ||
                              emp.designation![defaultLang]
                            : i({ id: "NOT_AVAILABLE" })}
                        </Typography>
                      </Stack>
                      <Box component={"div"}>
                        <IconButton
                          aria-label=""
                          onClick={() => handleClickOptions(emp)}
                          sx={{
                            position: "absolute",
                            top: "10px",
                            right: "15px",
                            border: "none",
                          }}
                        >
                          <MoreHorizIcon />
                        </IconButton>
                      </Box>
                    </Box>

                    <Box component={"div"}>
                      <Grid container>
                        <Grid size={5}>
                          <Typography variant="body1" fontWeight={"700"}>
                            {i({ id: "LEAVE.TITLES.LEAVE_POLICY" })}
                          </Typography>
                        </Grid>
                        <Grid size={4}>
                          <Typography variant="body1" fontWeight={"700"}>
                            {i({ id: "LEAVE.REMAINING" })}
                          </Typography>
                        </Grid>
                        <Grid size={3}>
                          <Typography variant="body1" fontWeight={"700"}>
                            {i({ id: "LEAVE.TAKEN" })}
                          </Typography>
                        </Grid>
                        <Grid
                          container
                          spacing={0.5}
                          sx={{
                            height: "100px",
                            overflow: "auto",
                            marginTop: "8px",
                            width: "100%",
                          }}
                        >
                          {emp.leaveBalances.map((leave) => {
                            return (
                              <Box
                                component={"div"}
                                sx={{
                                  display: "flex",
                                  width: "100%",
                                  height: "20px",
                                }}
                                key={leave.leaveBalanceId}
                              >
                                <Grid size={5}>{leave.leavePolicyName}</Grid>
                                <Grid size={4}>{leave.remaining}</Grid>
                                <Grid size={3}>{leave.usedLeave}</Grid>
                              </Box>
                            );
                          })}
                        </Grid>
                      </Grid>
                    </Box>
                  </Stack>
                </Card>
              </Grid>
            );
          })}
        </Grid>
        <Pagination
          page={pageNo}
          rowsPerPage={pageSize}
          setRowPerPage={setRowPerPage}
          setPage={setPage}
          totalRecords={totalRecords}
        />
      </Card>
      {
        <FilterComponent
          // open={true}
          handleClose={handleClose}
          anchorEl={anchorEl}
          open={isOpen}
        >
          <FilterPolicySearch
            selectedPolicies={policies}
            handleSelectingPolicies={handleSelectingPolicies}
            handleRefresh={handleRefresh}
          />
        </FilterComponent>
      }
      {openOptions && selectedEmployeeBalance && (
        <EditEmployeePoliciesForm
          openOptions={openOptions}
          handleClose={handleClose}
          handleRefresh={handleRefresh}
          selectedEmployee={selectedEmployeeBalance}
        />
      )}
    </>
  );
};
