import {
  Avatar,
  Box,
  Card,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  IconButton,
  Popover,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { Add } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { AddLeaveBalance } from "./AddLeaveBalance";
import {
  LeaveBalance,
  LeaveBalanceFilter,
  LeaveBalanceRequestModel,
} from "../model";
import { getLeaveBalance } from "../leaveServices";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { EmployeeLeaveBalanceColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../../shared/components/Pagination";
import { useAppSelector } from "../../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import { FilterComponent } from "../../../shared/components/FilterComponent";
import SearchIcon from "@mui/icons-material/Search";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { initialFilterValues } from "../../employees/components/EmployeeFilter";
import { getAllEmployees } from "../../employees/employeeServices";
import EditEmployeePoliciesForm from "./EditEmployeePoliciesForm";

const initialLeavBalanceValue: LeaveBalanceRequestModel = {
  employeeId: "",
  leaveTypeBalances: [],
};

export const EmployeesLeaveBalance = () => {
  const { formatMessage: i } = useIntl();
  const [isOpen, setOpen] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [leaveBalance, setLeaveBalance] = useState<LeaveBalance[]>([]);
  const [refresh, setRefresh] = useState(false);
  const [initialBalance, setInitialBalance] = useState(initialLeavBalanceValue);
  const [totalRecords, setTotalRecords] = useState(0);
  const navigate = useNavigate();
  const currentUserId = useAppSelector((state) => state.user.userData?.userId)!;
  const [isLoading, setLoading] = useState(true);

  const [search, setSearch] = useState<String>("");

  const [openOptions, setOpenOptions] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setOpen(true);
    setAnchorEl(event.currentTarget);
  };

  function handleClickOptions(event: React.MouseEvent<HTMLButtonElement>) {
    setOpenOptions(true);
  }

  const handleClose = () => {
    setOpen(false);
    setAnchorEl(null);
    setOpenOptions(false);
    false;
  };

  const handleLeaveBalanceEdit = (leaveBalance: LeaveBalance) => {
    setEdit(true);
    const leaveBalanceObj: LeaveBalanceRequestModel = {
      id: leaveBalance.id,
      employeeId: leaveBalance.employeeId,
      leaveTypeBalances: [
        leaveBalance.sickLeave,
        leaveBalance.casualLeave,
        leaveBalance.earnedLeave,
        leaveBalance.maternityLeave,
        leaveBalance.paternityLeave,
      ],
    };
    setOpen(true);
    setInitialBalance(leaveBalanceObj);
  };
  // const handleRowClick = (row: LeaveBalance) => {
  //     if (row.employeeId === currentUserId) {
  //         navigate("/profile/leave")
  //     } else {
  //         navigate(`/employees/${row.employeeId}/leave`)
  //     }
  // }

  const handleRefresh = () => {
    setRefresh(!refresh);
  };

  // useEffect(() => {
  //   const getLeaveBalanceFunc = async () => {
  //     setLoading(true);
  //     const payload: LeaveBalanceFilter = {
  //       pageNo: paginationValues.pageNo + 1,
  //       pageSize: paginationValues.records,
  //     };
  //     try {
  //       const { data } = await getLeaveBalance(payload);
  //       if (data.success) {
  //         setLeaveBalance(data.methodResults);
  //         setTotalRecords(data.totalRecords);
  //         // console.log(data);
  //       }
  //     } catch (error) {
  //       console.error((error as Error).message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   getLeaveBalanceFunc();
  // }, [refresh, paginationValues]);

  return (
    <>
      <Card className="p-4 gap-4 d-flex flex-column flex-grow-1">
        <Typography variant="h5">
          {i({ id: "LEAVE.TITLES.LEAVE_BALANCE" })}
        </Typography>
        <Stack className="flex-row justify-content-between">
          <Box component={"div"} sx={{ width: "400px" }}>
            <TextField
              id="outlined-search"
              label="Search Employee"
              variant="outlined"
              className="search-employees-name-leave-policies"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ marginRight: "0" }}>
                    <SearchIcon sx={{ color: "gray" }} />
                  </InputAdornment>
                ),
              }}
            />
          </Box>
          <CustomIconButton
            icon={<FilterAltIcon />}
            handleClick={(e) => handleClick(e)}
            tooltip={i({ id: "LEAVE.TITLES.ADD_LEAVE_BALANCE" })}
          />
        </Stack>
        <Grid container spacing={2}>
          <Grid
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <Card>
              <Stack spacing={3} sx={{ padding: "7px 10px" }}>
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
                      sx={{
                        height: "70px",
                        width: "70px",
                        marginBottom: "5px",
                      }}
                    />
                    <Typography variant="h6" color="initial">
                      Name
                    </Typography>
                    <Typography
                      variant="h6"
                      color="initial"
                      sx={{
                        fontWeight: "400",
                        color: "text.disabled",
                        marginTop: "6px"
                      }}>
                      Position
                    </Typography>
                  </Stack>
                  <Box component={"div"}>
                    <IconButton
                      aria-label=""
                      onClick={(e) => handleClickOptions(e)}
                      sx={{
                        position: "absolute",
                        top: "10px",
                        right: "15px",
                        border: "none",
                      }}
                    >
                      <MoreHorizIcon />
                    </IconButton>
                    <CustomisedModal
                      // id={id}
                      open={openOptions}
                      handleClose={handleClose}
                    >
                      <EditEmployeePoliciesForm />
                    </CustomisedModal>
                  </Box>
                </Box>

                <Box component={"div"}>
                  <Grid container>
                    <Grid size={{
                      lg: 4
                    }}>Leave Policy</Grid>
                    <Grid size={{
                      lg: 4
                    }}>Remaining</Grid>
                    <Grid size={{
                      lg: 4
                    }}>Used</Grid>
                  </Grid>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </Card>
      {
        <FilterComponent
          // open={true}
          handleClose={handleClose}
          anchorEl={anchorEl}
          open={isOpen}
        />
      }
    </>
  );
};
