import { Typography, Card, Stack, Container } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Close, Download, FilterList } from "@mui/icons-material";

import AddUpdateEmployee from "./AddUpdateEmployee";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import {
  addEmployee,
  deleteEmployee,
  getAllEmployees,
  updateEmployee,
} from "./components/employeeServices";
import { toast } from "react-toastify";
import { CustomisedTable } from "../components/CustomisedTable";
import { EmployeeTabTableColumnList } from "../../../utils/constant/Constant";
import dayjs from "dayjs";
import { EmployeeModel, EmployeesDataTypes } from "../../../utils/common_types";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { employeesListMapperforExport } from "../../../utils/common";
import { ViewEmployeeDetails } from "./ViewEmployeeDetails";
import { SearchInput } from "../components/SearchInput";
import { CustomIconButton } from "../components/CustomIconButton";
import { Pagination } from "../components/Pagination";
import { useAppSelector } from "../../Redux/hooks";

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
  status: "",
  address: "",
  // jobRole: "",
  dateOfJoining: null,
  personalEmail: "",
  emergencyContact: "",
  password: "",
};
export default function Employees() {
  const intl = useIntl();
  const token = useAppSelector((state) => state.auth.token)!;
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [employeeInitialValues, setEmployeeInitialValues] =
    useState(employeeInitialValue);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState<
    EmployeeModel | undefined
  >();
  const [page, setPage] = useState<number>(0);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [employeeList, setEmployeeList] = useState<EmployeeModel[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [isEdit, setEdit] = useState(false);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);

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
    if (isEdit) {
      const employeeId = values.employeeId;
      const companyId = values.companyId;
      const payload = {
        ...values,
      };
      updateEmployee(payload, token)
        .then((res) => {
          const { success, message } = res.data;
          if (success) {
            toast.success("Employee Details Updated Successfully");
            setSubmitting(false);
            setRefresh(!isRefresh);
            handleClose();
          }
        })
        .catch((error) => {
          toast.error(error.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      const payload = {
        userId: values.userId,
        companyId: values.companyId,
        employeeId: values.employeeId,
        roleId: values.roleId,
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        dateOfBirth: values.dateOfBirth,
        email: values.email,
        password: values.password,
        // jobRole: values.jobRole,
        department: values.department,
        reportingManager: values.reportingManager,
        teamLead: values.teamLead,
        phoneNumber: values.phoneNumber,
        bloodGroup: values.bloodGroup,
        personalEmail: values.personalEmail,
        emergencyContact: values.emergencyContact,
        dateOfJoining: values.dateOfJoining,
        status: values.status,
        address: values.address,
      };
      addEmployee(payload, token)
        .then((res) => {
          const { success, message } = res.data;
          if (success) {
            setLoading(false);
            setRefresh(!isRefresh);
            toast.success(message);
            setSubmitting(false);
            handleClose();
          }
        })
        .catch((error) => {
          setLoading(false);
          toast.error(error.message);
        });
    }
  }

  function handleEmployeeDeletion(res: string) {
    if (res !== "ok" || selectedEmployee === null) {
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

  const openConfirmationModal = (row: EmployeeModel) => {
    setConfirmModalOpen(true);
    setSelectedEmployeeData(row);
    setSelectedEmployee(row.employeeId);
  };

  function closeConfirmationModal() {
    setConfirmModalOpen(false);
    setSelectedEmployee(null);
  }

  function openViewModal(row: EmployeeModel) {
    setViewModalOpen(true);
    if (row) {
      setSelectedEmployeeData(row);
    }
  }

  function handleEmployeeEdit(row: EmployeeModel) {
    setEmployeeInitialValues({
      userId: row.userId,
      companyId: row.companyId,
      roleId: row.roleId,
      employeeId: row.employeeId,
      firstName: row.firstName,
      lastName: row.lastName,
      gender: row.gender,
      password: row.password,
      email: row.email,
      department: row.department,
      reportingManager: row.reportingManager,
      teamLead: row.teamLead,
      phoneNumber: row.phoneNumber,
      bloodGroup: row.bloodGroup,
      personalEmail: row.personalEmail,
      emergencyContact: row.emergencyContact,
      status: row.status,
      address: row.address,
      dateOfBirth: dayjs(row.dateOfBirth),
      dateOfJoining: dayjs(row.dateOfJoining),
    });
    setModalOpen(true);
    setEdit(true);
  }

  function handleEmployeeExport() {
    const mappedEmployeeData = employeesListMapperforExport(employeeList);
    const worksheet = XLSX.utils.json_to_sheet(mappedEmployeeData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Employees");
    XLSX.writeFile(workbook, "Employees.xlsx");
  }

  useEffect(() => {
    setLoading(true);
    // const payload = {
    //   pageNo: page + 1,
    //   limit: rowPerPage,
    //   name: search,
    // };
    const timeOutId = setTimeout(async () => {
      try {
        const response = await getAllEmployees(token);
        const { success, statusCode, methodResults } = response.data;
        if (!(success && statusCode === 200)) {
          throw new Error("Failed To fetch Data");
        }
        if (methodResults) {
          setEmployeeList(methodResults);
          setTotalRecords(methodResults.length);
          setLoading(false);
        }
      } catch (error: any) {
        setLoading(false);
        toast.error(error.message);
      }
    }, 1500);
    return () => clearTimeout(timeOutId);
  }, [page, rowPerPage, isRefresh, search]);

  return (
    <>
      <Card sx={{ p: "16px" }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <SearchInput search={search} setSearch={setSearch} />
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
                handleClick={handleEmployeeExport}
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
              page={page}
              rowsPerPage={rowPerPage}
              handleEdit={handleEmployeeEdit}
              openConfirmationModal={openConfirmationModal}
              openViewModal={openViewModal}
            />
            {totalRecords > rowPerPage && (
              <Pagination
                page={page}
                rowsPerPage={rowPerPage}
                setRowPerPage={setRowPerPage}
                setPage={setPage}
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
      {selectedEmployeeData && isViewModalOpen && (
        <ViewEmployeeDetails
          open={isViewModalOpen}
          setOpen={setViewModalOpen}
          employeeData={selectedEmployeeData}
        />
      )}
      <ConfirmationModal
        title={"Delete Employee"}
        content="Are you sure you want to delete this employee?"
        open={isConfirmModalOpen}
        handleClose={closeConfirmationModal}
        handleConfirmation={handleEmployeeDeletion}
      />
    </>
  );
}
