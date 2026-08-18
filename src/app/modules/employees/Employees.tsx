import {
  Box,
  Card,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
  Tooltip,
  CircularProgress,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  Drafts,
  FileDownload,
  FilterList,
  GridView,
  UploadFile,
  ViewList,
} from "@mui/icons-material";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { getAllEmployees, resendInvitationLink } from "./employeeServices";
import { toast } from "react-toastify";

import {
  getCustomStatusCodesErrorMessage,
  getModulePermissions,
  hasModuleFeaturePermission,
  canAccessHrManagement,
} from "../../../utils/common";
import { CustomIconButton } from "../../shared/components/C_IconButton";
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
import CustomisedButton from "../../shared/components/C_Button";
import * as XLSX from "xlsx";

import { AppButton, AppIconButton } from "../../shared/components/ui";
const CustomDataGrid = lazy(() =>
  import("../../shared/components/C_DataGrid").then((module) => ({
    default: module.CustomDataGrid,
  })),
) as (typeof import("../../shared/components/C_DataGrid"))["CustomDataGrid"];

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
    const canViewEmployeePhoneNumbers = canAccessHrManagement(
      useAppSelector((state) => state.user.userData?.roleType),
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
      ...(canViewEmployeePhoneNumbers
        ? [
            {
              field: "phoneNumber",
              headerName: i({ id: "FORM.PHONE" }),
              description: i({ id: "FORM.PHONE" }),
              minWidth: 150,
              sortable: false,
              resizable: false,
              flex: 1,
            } satisfies GridColDef<GetAllEmployeeResponseModel>,
          ]
        : []),
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
      <AppIconButton
        sx={{ padding: 0, border: 0 }}
        onClick={(e) => {
          sentInvitationMail();
          e.stopPropagation();
        }}
      >
        <Drafts />
      </AppIconButton>
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
  const [isExporting, setIsExporting] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
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

  const handleBulkExport = async () => {
    setIsExporting(true);
    try {
      const response = await getAllEmployees({
        pageNo: 1,
        records: Math.max(totalRecords, 1),
        name: "",
        ...(employeeFilters ?? initialFilterValues),
      });
      const { success, methodResults } = response.data;
      if (!success) throw new Error("Failed to export employees");

      const rows = methodResults.map((employee) => ({
        "Employee ID": employee.employeeId,
        Name: employee.fullName,
        Email: employee.email,
        Phone: employee.phoneNumber ?? "",
        Gender: employee.gender,
        Department: employee.department
          ? Object.values(employee.department)[0] ?? ""
          : "",
        "Job Role": employee.jobRole
          ? Object.values(employee.jobRole)[0] ?? ""
          : "",
        "Date of Birth": employee.dateOfBirth ?? "",
        Verified: employee.isVerified ? "Yes" : "No",
      }));

      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
      XLSX.writeFile(
        workbook,
        `employees-${new Date().toISOString().slice(0, 10)}.xlsx`,
      );
      toast.success("Employees exported successfully");
    } catch (error) {
      console.error((error as Error).message);
      toast.error("Failed to export employees");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    const getAllEmployeesList = async () => {
      try {
        const response = await getAllEmployees({
          pageNo: paginationValues.pageNo + 1,
          records: paginationValues.records,
          name: "",
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
  }, [paginationValues, employeeFilters, isRefresh]);

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.EMPLOYEES" }));
  }, []);

  const pageHeaderActionsTarget = document.getElementById("page-header-actions");
  const toolbarIconSx = {
    width: 38,
    height: 38,
    borderRadius: 2,
    border: "1px solid",
    borderColor: "divider",
    bgcolor: "background.paper",
    color: "primary.main",
    "&:hover": {
      bgcolor: "action.hover",
      borderColor: "primary.main",
      color: "primary.dark",
    },
  };
  const primaryToolbarIconSx = {
    ...toolbarIconSx,
    bgcolor: "primary.main",
    borderColor: "primary.main",
    color: "primary.contrastText",
    "&:hover": {
      bgcolor: "primary.dark",
      borderColor: "primary.dark",
      color: "primary.contrastText",
    },
  };

  return (
    <>
      {pageHeaderActionsTarget &&
        createPortal(
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{
              alignItems: "center",
              justifyContent: "flex-start",
              width: { xs: "100%", md: "auto" },
              columnGap: 1,
              rowGap: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
              flexShrink={0}
              sx={{ width: { xs: "100%", md: "auto" }, justifyContent: { xs: "space-between", md: "flex-start" } }}
            >
              <ToggleButtonGroup
                orientation="horizontal"
                value={viewMode}
                exclusive
                onChange={handleViewChange}
                size="small"
                sx={{
                  height: 38,
                  p: 0.35,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: "10px",
                  bgcolor: "background.paper",
                  "& .MuiToggleButton-root": {
                    border: 0,
                    borderRadius: "7px !important",
                    px: 1.25,
                    color: "text.secondary",
                    "&.Mui-selected": {
                      color: "primary.contrastText",
                      bgcolor: "primary.main",
                      "&:hover": { bgcolor: "primary.dark" },
                    },
                  },
                }}
              >
                <ToggleButton value="table" aria-label="table"><ViewList className="fs-20" /></ToggleButton>
                <ToggleButton value="grid" aria-label="grid"><GridView className="fs-20" /></ToggleButton>
              </ToggleButtonGroup>
              <Badge badgeContent={totalAppliedFilter} anchorOrigin={{ horizontal: "left", vertical: "top" }} color="primary">
                <CustomIconButton
                  icon={<FilterList />}
                  ariaLabel="Filter Employee"
                  handleClick={handleFilterClick}
                  sx={totalAppliedFilter > 0 ? primaryToolbarIconSx : toolbarIconSx}
                />
              </Badge>
            </Stack>
            {userPermissionForModule.includes(`${ModulesName.Employees}.${Permission.Create}`) && (
              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap" sx={{ width: { xs: "100%", md: "auto" } }}>
                <AppButton variant="outlined" size="small" startIcon={<UploadFile />} onClick={() => setShowBulkImportModal(true)} sx={{ minHeight: 38, borderRadius: 2, px: 1.5, fontWeight: 700, color: "primary.main", borderColor: "divider", bgcolor: "background.paper", "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" }, flex: { xs: "1 1 0", md: "0 1 auto" } }}>Bulk Import</AppButton>
                <AppButton variant="outlined" size="small" startIcon={isExporting ? <CircularProgress size={16} /> : <FileDownload />} onClick={handleBulkExport} disabled={isExporting || totalRecords === 0} sx={{ minHeight: 38, borderRadius: 2, px: 1.5, fontWeight: 700, color: "primary.main", borderColor: "divider", bgcolor: "background.paper", "&:hover": { bgcolor: "action.hover", borderColor: "primary.main" }, flex: { xs: "1 1 0", md: "0 1 auto" } }}>Bulk Export</AppButton>
                <CustomIconButton icon={<Add />} handleClick={() => setShowAddEmployeeStepper(true)} tooltip={i({ id: "EMPLOYEE.ADD_NEW_EMP" })} ariaLabel="Add employee" sx={primaryToolbarIconSx} />
              </Stack>
            )}
          </Stack>,
          pageHeaderActionsTarget,
        )}
      <Card
        className="d-flex flex-column flex-grow-1"
        sx={{
          width: "100%",
          p: { xs: 2, sm: 3, md: 4 },
          gap: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundColor: "background.paper",
          backgroundImage: "none",
          // The page already has a defined card border. A large fixed shadow
          // made the entire employee list look like it was floating, especially
          // in the light Dawn theme.
          boxShadow: "none",
          overflow: "visible",
        }}
      >
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
            sx={{
              backgroundColor: "background.paper",
              backgroundImage: "none",
              "& .MuiDataGrid-main, & .MuiDataGrid-virtualScroller, & .MuiDataGrid-row, & .MuiDataGrid-cell, & .MuiDataGrid-footerContainer": {
                backgroundColor: "background.paper",
                backgroundImage: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                backgroundColor: "background.paper",
                backgroundImage: "none",
              },
            }}
          />
        ) : (
          <EmployeeGridView
            employeeList={employeeList}
            isLoading={isLoading}
            page={paginationValues.pageNo}
            pageSize={paginationValues.records}
            totalRecords={totalRecords}
            onPaginationChange={(pageNo, records) => setPaginationValues({ pageNo, records })}
          />
        )}
      </Card>
      {open && (
        <EmployeeFilter
          open={open}
          id={id}
          anchorEl={anchorEl}
          handleClose={() => setAnchorEl(null)}
        />
      )}
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
