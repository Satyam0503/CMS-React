import {
  Card,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  Download,
  FilterList,
  GridView,
  ViewList,
} from "@mui/icons-material";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  addEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
} from "./employeeServices";
import { toast } from "react-toastify";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { EmployeeTabTableColumnList } from "../../../utils/constant/Constant";
import dayjs from "dayjs";
import { EmployeeModel } from "../../../utils/common_types";

import {
  getModulePermissions,
  statusDecoder,
  statusEncoder,
} from "../../../utils/common";
import { ViewEmployeeDetails } from "./components/ViewEmployeeDetails";
import { SearchInput } from "../../shared/components/SearchInput";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { Pagination } from "../../shared/components/Pagination";
import AddUpdateEmployee from "./components/AddUpdateEmployee";
import { ConfirmationModal } from "../../shared/components/ConfirmationModal";
import { ModulesName, Permission } from "../../../utils/enums";
import { useAppSelector } from "../../Redux/hooks";
import { usePageData } from "../../../_themes/layout/core";
import { useNavigate } from "react-router-dom";
import { EmployeeGridView } from "./components/EmployeeGridView";

const employeeInitialValue: EmployeeModel = {
  userId: "",
  employeeId: "",
  roleId: "",
  companyId: "",
  firstName: "",
  lastName: "",
  gender: "",
  email: "",
  dateOfBirth: null,
  department: "",
  reportingManager: "",
  teamLead: "",
  phoneNumber: "",
  bloodGroup: "",
  address: "",
  jobRole: "",
  status: "Active",
  isEmailVerified: false,
  dateOfJoining: null,
  personalEmail: "",
  emergencyContact: "",
  password: null,
};
type ViewMode = "table" | "grid";

export default function Employees() {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  const navigate = useNavigate();
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [employeeInitialValues, setEmployeeInitialValues] =
    useState(employeeInitialValue);
  const [selectedEmployee, setSelectedEmployee] = useState<
    EmployeeModel | undefined
  >();
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    records: 10,
  });
  const [employeeList, setEmployeeList] = useState<EmployeeModel[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [isEdit, setEdit] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const userPermissionForModule = useMemo(
    () => getModulePermissions(ModulesName.Employees, userModulesPermissions),
    [userModulesPermissions]
  ); 

  const currentEmpId = useAppSelector((state) => state.user.userData?.userId);
  const [viewMode, setViewMode] =
    useState<ViewMode>("table");

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  function handleClose() {
    setModalOpen(false);
    setEmployeeInitialValues(employeeInitialValue);
    setEdit(false);
  }
  function SaveAddEditEmployee(
    values: EmployeeModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    setLoading(true);
    const payload = {
      ...values,
      status: statusEncoder(values.status as string),
    };
    if (isEdit) {
      const userId = values.userId;
      updateEmployee(payload, userId)
        .then((res) => {
          const { success, message, statusCode } = res.data;
          if (!success) {
            throw new Error(message);
          }
          toast.success(message);
          setRefresh(!isRefresh);
          handleClose();
        })
        .catch((error) => {
          toast.error(error.message);
        })
        .finally(() => {
          setSubmitting(false);
          setLoading(false);
        });
    } else {
      addEmployee(payload)
        .then((res) => {
          const { success, message } = res.data;
          if (!success) {
            throw new Error(message);
          }
          setRefresh(!isRefresh);
          toast.success(message);
          setSubmitting(false);
          handleClose();
        })
        .catch((error) => {
          toast.error(error.message);
        })
        .finally(() => {
          setLoading(false);
          setSubmitting(false);
        });
    }
  }

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
        toast.error("Something Went Wrong");
        console.error(
          "Error :",
          error instanceof Error ? error.message : error
        );
      } finally {
        closeConfirmationModal();
      }
    }
  };

  const openConfirmationModal = (employee: EmployeeModel) => {
    setConfirmModalOpen(true);
    setSelectedEmployee(employee);
  };

  function closeConfirmationModal() {
    setConfirmModalOpen(false);
    setSelectedEmployee(undefined);
  }

  function openViewModal(employee: EmployeeModel) {
    setViewModalOpen(true);
    if (employee) {
      setSelectedEmployee(employee);
    }
  }

  function handleEmployeeEdit(employee: EmployeeModel) {
    setEmployeeInitialValues({
      ...employee,
      status: statusDecoder(employee.status as boolean),
      dateOfBirth: dayjs(employee.dateOfBirth),
      dateOfJoining: dayjs(employee.dateOfJoining),
    });
    setModalOpen(true);
    setEdit(true);
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

  const rowClickHandler = (employee: EmployeeModel) => {
    const empId = employee.userId;
    empId === currentEmpId
      ? navigate("/myprofile")
      : navigate(`/employee/${empId}`);
  };

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    nextView: ViewMode
  ) => {
    setViewMode(nextView);
  };

  useEffect(() => {
    setLoading(true);
    const getAllEmployeesList = async () => {
      try {
        const response = await getAllEmployees(
          paginationValues.pageNo + 1,
          paginationValues.records
        );
        const { success, statusCode, methodResults, totalRecords } =
          response.data;
        if (!(success && statusCode === 200)) {
          throw new Error("Failed To fetch Data");
        }
        if (methodResults) {
          setEmployeeList(methodResults.reverse());
          setTotalRecords(totalRecords);
        }
      } catch (error) {
        console.error(
          "error :",
          error instanceof Error ? error.message : error
        );
      } finally {
        setLoading(false);
      }
    };
    getAllEmployeesList();
  }, [paginationValues, isRefresh]);

  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.EMPLOYEES" }));
  }, []);

  return (
    <>
      <Card sx={{ p: "2rem" }} className="d-flex flex-column flex-grow-1">
        <Stack spacing={2} className="flex-grow-1">
          <Stack
            direction="row"
            gap={2}
            className="justify-content-between flex-wrap-reverse align-items-center"
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
                  height:32,
                }}
              >
                <ToggleButton value="table" aria-label="table">
                  <ViewList />
                </ToggleButton>
                <ToggleButton value="grid" aria-label="grid">
                  <GridView />
                </ToggleButton>
              </ToggleButtonGroup>
              <CustomIconButton icon={<FilterList />} handleClick={() => {}} />
              {userPermissionForModule.includes(`${ModulesName.Employees}.${Permission.Create}`) && (
                <CustomIconButton
                  icon={<Add />}
                  handleClick={() => setModalOpen(true)}
                  tooltip={intl.formatMessage({
                    id: "ADD.EMP.INFO",
                  })}
                  ariaLabel="Add employee"
                />
              )}
            </Stack>
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
              handleEdit={handleEmployeeEdit}
              openConfirmationModal={openConfirmationModal}
              openViewModal={openViewModal}
              rowClickHandler={rowClickHandler}
            />
          ) : (
            <EmployeeGridView
              employeeList={employeeList}
              isLoading={isLoading}
            />
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
        </Stack>
      </Card>

      {isModalOpen && (
        <AddUpdateEmployee
          employeeList={employeeList}
          open={isModalOpen}
          isEdit={isEdit}
          handleClose={handleClose}
          initialValues={employeeInitialValues}
          SaveAddEditEmployee={SaveAddEditEmployee}
        />
      )}
      {selectedEmployee && isViewModalOpen && (
        <ViewEmployeeDetails
          open={isViewModalOpen}
          setOpen={setViewModalOpen}
          employeeData={selectedEmployee}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmationModal
          title={intl.formatMessage({ id: "TITLE.DELETE_EMP" })}
          content={intl.formatMessage({ id: "CONFIRMATION.DELETE_EMP" })}
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleEmployeeDeletion}
        />
      )}
    </>
  );
}
