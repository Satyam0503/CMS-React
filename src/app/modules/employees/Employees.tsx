import {
  Card,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  IconButton,
  Tooltip,
  CircularProgress,
  Button,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  Drafts,
  FilterList,
  GridView,
  UploadFile,
  ViewList,
} from "@mui/icons-material";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getAllEmployees, resendInvitationLink } from "./employeeServices";
import { toast } from "react-toastify";

import {
  getCustomStatusCodesErrorMessage,
  getModulePermissions,
  hasModuleFeaturePermission,
} from "../../../utils/common";
import { SearchInput } from "../../shared/components/SearchInput";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { ModulesName, Permission } from "../../../utils/enums";
import { useAppSelector } from "../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import { EmployeeGridView } from "./components/EmployeeGridView";
import { GetAllEmployeeResponseModel } from "./models";
import {
  EmployeeFilter,
  initialFilterValues,
} from "./components/EmployeeFilter";
import { countAppliedFilter } from "../../../utils/common";
import { usePageData } from "../../Context/PageDataProvider";
import { AddEmployeeStepper } from "./components/AddEmployeeStepper";
import { BulkImportEmployeesModal } from "./components/BulkImportEmployeesModal";
import {
  GridColDef,
  GridPaginationModel,
  GridRowParams,
} from "@mui/x-data-grid";
import { AvatarCell } from "../../shared/components/AvatarCell";
import { SetDepartmentName } from "./components/SetDepartmentName";
import { StyleStatus } from "../../shared/components/StyledStatus";
import CustomisedButton from "../../shared/components/CustomisedButton";

const CustomDataGrid = lazy(() =>
  import("../../shared/components/CustomDataGrid").then((module) => ({
    default: module.CustomDataGrid,
  })),
) as (typeof import("../../shared/components/CustomDataGrid"))["CustomDataGrid"];

type ViewMode = "table" | "grid";

const useEmployeeTableColumnList =
  (): GridColDef<GetAllEmployeeResponseModel>[] => {
    const { formatMessage: i } = useIntl();
    const modulePermission =
      useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
    const canInviteEmployee = hasModuleFeaturePermission(
      ModulesName.Employees,
      Permission.Create,
      modulePermission,
    );
    const onlineUsers = useAppSelector(
      (state) => state.onlineUsers.onlineUsers,
    );
    return [
      {
        field: "employeeId",
        headerName: i({ id: "USER.EMP_ID" }),
        description: i({ id: "USER.EMP_ID" }),
        minWidth: 100,
        hideable: false,
        sortable: true,
        resizable: false,
        flex: 0.5,
      },
      {
        field: "fullName",
        headerName: i({ id: "FORM.FULL_NAME" }),
        description: i({ id: "FORM.FULL_NAME" }),
        minWidth: 200,
        hideable: false,
        sortable: false,
        resizable: true,
        display: "flex",
        flex: 1,
        renderCell: (param) => (
          <AvatarCell
            avatarSrc={param.row.fullProfileUrl}
            title={param.row.fullName}
            subTitle={param.row.jobRole}
            hasBadge={onlineUsers.includes(param.row.userId)}
          />
        ),
      },
      {
        field: "email",
        headerName: i({ id: "FORM.EMAIL" }),
        description: i({ id: "FORM.EMAIL" }),
        minWidth: 200,
        hideable: false,
        sortable: true,
        resizable: false,
        flex: 1,
      },
      {
        field: "phoneNumber",
        headerName: i({ id: "FORM.PHONE" }),
        description: i({ id: "FORM.PHONE" }),
        minWidth: 150,
        sortable: false,
        resizable: false,
        flex: 1,
      },
      {
        field: "department",
        headerName: i({ id: "FORM.DEPARTMENT" }),
        description: i({ id: "FORM.DEPARTMENT" }),
        minWidth: 180,
        sortable: false,
        resizable: false,
        renderCell: (param) => (
          <SetDepartmentName department={param.row.department} />
        ),
        flex: 1,
      },
      ...(canInviteEmployee
        ? [
            {
              field: "isVerified",
              headerName: i({ id: "FORM.VERIFICATION" }),
              description: i({ id: "FORM.VERIFICATION" }),
              minWidth: 200,
              sortable: true,
              resizable: false,
              display: "flex",
              renderCell: (param) => {
                return param.row.isVerified ? (
                  <StyleStatus className="success" label="COMMON.VERIFIED" />
                ) : (
                  <InvitationMailButton userId={param.row.userId} />
                );
              },
              flex: 1,
            } satisfies GridColDef<GetAllEmployeeResponseModel>,
          ]
        : []),
    ];
  };

const InvitationMailButton = (props: { userId: string }) => {
  const { formatMessage: i } = useIntl();
  const [loading, setLoading] = useState(false);
  const sentInvitationMail = async () => {
    setLoading(true);
    try {
      const { data } = await resendInvitationLink(props.userId);
      if (!data.success) throw new Error(String(data.statusCode));
      toast.success(i({ id: "TOAST.SUCCESS.INVITE_EMPLOYEE" }));
    } catch (error) {
      if (error instanceof Error) {
        toast.error(
          i({
            id: getCustomStatusCodesErrorMessage(
              +error.message,
              "TOAST.FAILED.INVITE_EMPLOYEE",
            ),
          }),
        );
        return;
      }
      console.error("failed to send invitation link");
    } finally {
      setLoading(false);
    }
  };
  return loading ? (
    <CircularProgress enableTrackSlot size="28px" thickness={4} />
  ) : (
    <Tooltip title={i({ id: "TOOLTIP.SEND_INVITATION_LINK" })}>
      <IconButton
        sx={{ padding: 0, border: 0 }}
        onClick={(e) => {
          sentInvitationMail();
          e.stopPropagation();
        }}
      >
        <Drafts />
      </IconButton>
    </Tooltip>
  );
};

const Employees = () => {
  const { formatMessage: i } = useIntl();
  const { setPageTitle } = usePageData();
  const navigate = useNavigate();
  const [showAddEmployeeStepper, setShowAddEmployeeStepper] = useState(false);
  const [showBulkImportModal, setShowBulkImportModal] = useState(false);
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    records: 10,
  });
  const [employeeList, setEmployeeList] = useState<
    GetAllEmployeeResponseModel[]
  >([]);
  const [isLoading, setLoading] = useState(true);
  const [isRefresh, setRefresh] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [openCheckModal, setOpenCheckModal] = useState<boolean>(false);

  function handleCloseCkeckModal() {
    setOpenCheckModal(false);
  }

  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "employee-filter" : undefined;

  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const userPermissionForModule = useMemo(
    () => getModulePermissions(ModulesName.Employees, userModulesPermissions),
    [userModulesPermissions],
  );

  const currentEmpId = useAppSelector((state) => state.user.userData?.userId);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const employeeFilters = useAppSelector((state) => state.filters.employee);
  const totalAppliedFilter = countAppliedFilter(employeeFilters);
  const columns = useEmployeeTableColumnList();

  const handleSearchChange = (value: string) => {
    if (paginationValues.pageNo > 0 && value.trim().length >= 0) {
      setPaginationValues({ ...paginationValues, pageNo: 0 });
    }
    setSearch(value.trim());
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationValues({
      pageNo: model.page,
      records: model.pageSize,
    });
  };

  const rowClickHandler = (
    param: GridRowParams<GetAllEmployeeResponseModel>,
  ) => {
    const empId = param.row.userId;
    empId === currentEmpId
      ? navigate("/profile")
      : navigate(`/employees/${empId}`);
  };

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    nextView: ViewMode,
  ) => {
    setViewMode(nextView);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleReresh = () => {
    setRefresh(!isRefresh);
  };

  useEffect(() => {
    setLoading(true);
    const getAllEmployeesList = async () => {
      try {
        const response = await getAllEmployees({
          pageNo: paginationValues.pageNo + 1,
          records: paginationValues.records,
          name: search,
          ...(employeeFilters ?? initialFilterValues),
        });
        const { success, methodResults, totalRecords } = response.data;
        if (success) {
          setEmployeeList(methodResults);
          setTotalRecords(totalRecords);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    };
    getAllEmployeesList();
  }, [paginationValues, employeeFilters, isRefresh, search]);

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.EMPLOYEES" }));
  }, []);

  return (
    <>
      <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
        <Stack
          direction="row"
          className="justify-content-between flex-wrap-reverse align-items-center"
          sx={{
            gap: 2,
          }}
        >
          <SearchInput search={search} setSearch={handleSearchChange} />

          <Stack direction="row" spacing={1.5}>
            <ToggleButtonGroup
              orientation="horizontal"
              value={viewMode}
              exclusive
              onChange={handleViewChange}
              size="small"
              sx={{
                height: 32,
              }}
            >
              <ToggleButton value="table" aria-label="table">
                <ViewList className="fs-20" />
              </ToggleButton>
              <ToggleButton value="grid" aria-label="grid">
                <GridView className="fs-20" />
              </ToggleButton>
            </ToggleButtonGroup>
            <Badge
              badgeContent={totalAppliedFilter}
              anchorOrigin={{ horizontal: "left", vertical: "top" }}
              color="primary"
            >
              <CustomIconButton
                icon={<FilterList />}
                ariaLabel="Filter Employee"
                handleClick={handleFilterClick}
              />
            </Badge>
            {userPermissionForModule.includes(
              `${ModulesName.Employees}.${Permission.Create}`,
            ) && (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<UploadFile />}
                  onClick={() => setShowBulkImportModal(true)}
                >
                  Bulk Import
                </Button>
                <CustomIconButton
                  icon={<Add />}
                  handleClick={() => setShowAddEmployeeStepper(true)}
                  tooltip={i({ id: "EMPLOYEE.ADD_NEW_EMP" })}
                  ariaLabel="Add employee"
                />
              </>
            )}
          </Stack>
          {open && (
            <EmployeeFilter
              open={open}
              id={id}
              anchorEl={anchorEl}
              handleClose={() => setAnchorEl(null)}
            />
          )}
        </Stack>
        {viewMode === "table" ? (
          <CustomDataGrid
            columns={columns}
            row={employeeList}
            keyName="userId"
            loading={isLoading}
            rowClickHandler={rowClickHandler}
            rowCount={totalRecords}
            paginationModel={{
              page: paginationValues.pageNo,
              pageSize: paginationValues.records,
            }}
            handlePaginationModelChange={handlePaginationModelChange}
          />
        ) : (
          <EmployeeGridView employeeList={employeeList} isLoading={isLoading} />
        )}
      </Card>
      {showAddEmployeeStepper && (
        <AddEmployeeStepper
          open={showAddEmployeeStepper}
          handleReresh={handleReresh}
          handleClose={() => setShowAddEmployeeStepper(false)}
        />
      )}
      {showBulkImportModal && (
        <BulkImportEmployeesModal
          open={showBulkImportModal}
          handleClose={() => setShowBulkImportModal(false)}
          onImported={handleReresh}
        />
      )}
    </>
  );
};

export default Employees;
