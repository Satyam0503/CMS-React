import { Card, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Download, FilterList } from "@mui/icons-material";

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
export default function Employees() {
  const intl = useIntl();
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

  const pageData = usePageData();
  console.log(pageData);
  

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

  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "PAGE.EMPLOYEES" })}
      </Typography>
      <Card sx={{ p: "2rem" }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap-reverse"}
            gap={2}
          >
            <SearchInput search={search} setSearch={handleSearchChange} />

            <Stack direction="row" spacing={1}>
              <CustomIconButton
                icon={<FilterList />}
                handleClick={() => {}}
              />
              {userPermissionForModule.includes(Permission.Create) && (
                <CustomIconButton
                  icon={<Add />}
                  handleClick={() => setModalOpen(true)}
                  tooltip={intl.formatMessage({
                    id: "ADD.EMP.INFO",
                  })}
                  ariaLabel="Add employee"
                />
              )}

              <CustomIconButton
                icon={<Download />}
                tooltip={intl.formatMessage({
                  id: "IMPORT.EXCEL",
                })}
                ariaLabel="import excel"
              />
            </Stack>
          </Stack>

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
          />
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
