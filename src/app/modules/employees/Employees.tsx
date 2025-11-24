import {
  Card,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Badge,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Add, FilterList, GridView, ViewList } from "@mui/icons-material";

import { useEffect, useMemo, useState } from "react";
import { deleteEmployee, getAllEmployees } from "./employeeServices";
import { toast } from "react-toastify";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { EmployeeTabTableColumnList } from "../../../utils/constant/Constant";

import { getModulePermissions } from "../../../utils/common";
import { SearchInput } from "../../shared/components/SearchInput";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { Pagination } from "../../shared/components/Pagination";
import { ConfirmationModal } from "../../shared/components/ConfirmationModal";
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

type ViewMode = "table" | "grid";

const Employees = () => {
  const { formatMessage: i } = useIntl();
  const { setPageTitle } = usePageData();
  const navigate = useNavigate();
  const [showAddEmployeeStepper, setShowAddEmployeeStepper] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<
    GetAllEmployeeResponseModel | undefined
  >();
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

  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "employee-filter" : undefined;

  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const userPermissionForModule = useMemo(
    () => getModulePermissions(ModulesName.Employees, userModulesPermissions),
    [userModulesPermissions]
  );

  const currentEmpId = useAppSelector((state) => state.user.userData?.userId);
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  const employeeFilters = useAppSelector((state) => state.filters.employee);
  const totalAppliedFilter = countAppliedFilter(employeeFilters);

  const handleSearchChange = (value: string) => {
    if (paginationValues.pageNo > 0 && value.trim().length >= 0) {
      setPaginationValues({ ...paginationValues, pageNo: 0 });
    }
    setSearch(value.trim());
  };

  const handleEmployeeDeletion = async (res: string) => {
    if (res !== "ok" || selectedEmployee === undefined) {
      closeConfirmationModal();
    } else {
      try {
        const response = await deleteEmployee(selectedEmployee.userId);
        const { success, message } = response.data;
        if (success) {
          toast.success(message);
          closeConfirmationModal();
          setRefresh(!isRefresh);
        }
      } catch (error) {
        toast.error(i({ id: "ERROR.SOMETHING_WRONG" }));
        console.error(
          "Error :",
          error instanceof Error ? error.message : error
        );
      } finally {
        closeConfirmationModal();
      }
    }
  };

  const openConfirmationModal = (employee: GetAllEmployeeResponseModel) => {
    setConfirmModalOpen(true);
    setSelectedEmployee(employee);
  };

  function closeConfirmationModal() {
    setConfirmModalOpen(false);
    setSelectedEmployee(undefined);
  }

  const handlePageChange = (page: number) => {
    setPaginationValues({
      ...paginationValues,
      pageNo: page,
    });
  };

  const handleRowPerPageChange = (rowPerPage: number) => {
    setPaginationValues({
      ...paginationValues,
      records: rowPerPage,
      pageNo: 0,
    });
  };

  const rowClickHandler = (employee: GetAllEmployeeResponseModel) => {
    const empId = employee.userId;
    empId === currentEmpId
      ? navigate("/profile")
      : navigate(`/employees/${empId}`);
  };

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    nextView: ViewMode
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
              `${ModulesName.Employees}.${Permission.Create}`
            ) && (
              <CustomIconButton
                icon={<Add />}
                handleClick={() => setShowAddEmployeeStepper(true)}
                tooltip={i({ id: "EMPLOYEE.ADD_NEW_EMP" })}
                ariaLabel="Add employee"
              />
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
          <CustomisedTable
            tabName={ModulesName.Employees}
            keyName="userId"
            loading={isLoading}
            rows={employeeList}
            columns={EmployeeTabTableColumnList}
            page={paginationValues.pageNo}
            rowsPerPage={paginationValues.records}
            openConfirmationModal={openConfirmationModal}
            rowClickHandler={rowClickHandler}
          />
        ) : (
          <EmployeeGridView employeeList={employeeList} isLoading={isLoading} />
        )}

        {totalRecords > 0 && (
          <Pagination
            page={paginationValues.pageNo}
            rowsPerPage={paginationValues.records}
            setPage={handlePageChange}
            setRowPerPage={handleRowPerPageChange}
            totalRecords={totalRecords}
          />
        )}
      </Card>
      {showAddEmployeeStepper && (
        <AddEmployeeStepper
          open={showAddEmployeeStepper}
          handleReresh={handleReresh}
          handleClose={() => setShowAddEmployeeStepper(false)}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmationModal
          title={i({ id: "CONFIRMATION.TITLE.DELETE_EMP" })}
          content={i({ id: "CONFIRMATION.CONTENT.DELETE_EMP" })}
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleEmployeeDeletion}
        />
      )}
    </>
  );
};

export default Employees;
