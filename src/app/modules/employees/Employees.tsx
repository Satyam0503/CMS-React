import { Card, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Download, FilterList } from "@mui/icons-material";

import AddUpdateEmployee from "./AddUpdateEmployee";
import * as XLSX from "xlsx";
import { useCallback, useEffect, useState } from "react";
import {
  addEmployee,
  getAllEmployees,
  updateEmployee,
} from "./components/employeeServices";
import { toast } from "react-toastify";
import { CustomisedTable } from "../components/CustomisedTable";
import { EmployeeTabTableColumnList } from "../../../utils/constant/Constant";
import dayjs from "dayjs";
import { EmployeeModel } from "../../../utils/common_types";
import { ConfirmationModal } from "../components/ConfirmationModal";
import {
  employeesListMapperforExport,
  statusDecoder,
  statusEncoder,
} from "../../../utils/common";
import { ViewEmployeeDetails } from "./ViewEmployeeDetails";
import { SearchInput } from "../components/SearchInput";
import { CustomIconButton } from "../components/CustomIconButton";
import { Pagination } from "../components/Pagination";

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

  function handleEmployeeDeletion(res: string) {
    if (res !== "ok" || selectedEmployee === undefined) {
      toast.error("Please try again");
      closeConfirmationModal();
    } else {
      // deleteEmployee(employeeId, token)
      //   .then((res) => {
      //     const { success, message } = res.data;
      //     if (success) {
      //       toast.success(message);
      //       closeConfirmationModal();
      //       setRefresh(!isRefresh);
      //     }
      //   })
      //   .catch((error) => {
      //     toast.error("Please try again");
      //     closeConfirmationModal();
      //   });
    }
  }

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



  const handlePageChange =  (page:number)=>{
    setPaginationValues({
      ...paginationValues,
      pageNo:page,
    })
  }

  const handleRowPerPageChange = (rowPerPage:number)=>{
    setPaginationValues({
      ...paginationValues,
      records:rowPerPage,
      pageNo:0,
    })
  }
  useEffect(() => {
    setLoading(true);
    const getAllEmployeesList = async () => {
      try {
        const response = await getAllEmployees(
          paginationValues.pageNo+1,
          paginationValues.records
        );
        const { success, statusCode, methodResults,totalRecords } = response.data;
        if (!(success && statusCode === 200)) {
          throw new Error("Failed To fetch Data");
        }
        if (methodResults) {
          setEmployeeList(methodResults.reverse());
          setTotalRecords(totalRecords);
        }
      } catch (error) {
        console.error("error :", error instanceof Error ? error.message :error);
      } finally {
        setLoading(false);
      }
    };
    getAllEmployeesList();
  }, [paginationValues, isRefresh]);

  return (
    <>
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
                tooltip="Filter Employee"
                handleClick={() => {}}
              />
              <CustomIconButton
                icon={<Add />}
                handleClick={() => setModalOpen(true)}
                tooltip="Add Employee"
                ariaLabel="Add employee"
              />
              <CustomIconButton
                icon={<Download />}
                // handleClick={handleEmployeeExport}
                tooltip="Import Excel"
                ariaLabel="import excel"
              />
            </Stack>
          </Stack>

          <CustomisedTable
            tabName="Employee"
            loading={isLoading}
            rows={employeeList}
            columns={EmployeeTabTableColumnList}
            page={paginationValues.pageNo}
            rowsPerPage={paginationValues.records}
            handleEdit={handleEmployeeEdit}
            openConfirmationModal={openConfirmationModal}
            openViewModal={openViewModal}
          />
          {totalRecords > 0  && (
            <Pagination
              page={paginationValues.pageNo}
              rowsPerPage={paginationValues.records}
              setPage = {handlePageChange}
              setRowPerPage={handleRowPerPageChange}
              totalRecords={totalRecords}
            />
          )}
        </Stack>
      </Card>

      {isModalOpen && (
        <AddUpdateEmployee
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
          title={"Delete Employee"}
          content="Are you sure you want to delete this Employee?"
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleEmployeeDeletion}
        />
      )}
    </>
  );
}
