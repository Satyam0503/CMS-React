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
  address: "",
  jobRole: "",
  status: "Active",
  isEmailVerified: false,
  dateOfJoining: null,
  personalEmail: "",
  emergencyContact: "",
  password: "",
};
export default function Employees() {
  const intl = useIntl();
  const currentUser = useAppSelector((state) => state.user.userData);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [employeeInitialValues, setEmployeeInitialValues] =
    useState(employeeInitialValue);
  const [selectedEmployee, setSelectedEmployee] = useState<
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
      const payload = {
        ...values,
        status: statusEncoder(values.status as string)
      };
      const userId=values.userId;
      updateEmployee(payload,userId)
        .then((res) => {
          const { success, message,statusCode } = res.data;
          if (!(success)) {
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
        password: "",
        jobRole: values.jobRole,
        department: values.department,
        reportingManager: values.reportingManager,
        teamLead: values.teamLead,
        phoneNumber: values.phoneNumber,
        bloodGroup: values.bloodGroup,
        personalEmail: values.personalEmail,
        emergencyContact: values.emergencyContact,
        dateOfJoining: values.dateOfJoining,
        status:statusEncoder(values.status as string),
        address: values.address,
        isEmailVerified: values.isEmailVerified,
      };
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
        .finally(()=>{
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
      userId: employee.userId,
      companyId: employee.companyId,
      roleId: employee.roleId,
      employeeId: employee.employeeId,
      firstName: employee.firstName,
      lastName: employee.lastName,
      gender: employee.gender,
      password: employee.password,
      email: employee.email,
      department: employee.department,
      reportingManager: employee.reportingManager,
      teamLead: employee.teamLead,
      phoneNumber: employee.phoneNumber,
      jobRole: employee.jobRole,
      bloodGroup: employee.bloodGroup,
      personalEmail: employee.personalEmail,
      emergencyContact: employee.emergencyContact,
      status: statusDecoder(employee.status as boolean),
      address: employee.address,
      dateOfBirth: dayjs(employee.dateOfBirth),
      dateOfJoining: dayjs(employee.dateOfJoining),
      isEmailVerified: employee.isEmailVerified,
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
        const response = await getAllEmployees();
        const { success, statusCode, methodResults } = response.data;
        if (!(success && statusCode === 200)) {
          throw new Error("Failed To fetch Data");
        }
        if (methodResults) {
          setEmployeeList(methodResults);
          setTotalRecords(methodResults.length);
        }
      } catch (error: any) {
        toast.error(error.message);
      }
      finally{
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timeOutId);
  }, [page, rowPerPage, isRefresh, search]);

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
      {selectedEmployee && isViewModalOpen && (
        <ViewEmployeeDetails
          open={isViewModalOpen}
          setOpen={setViewModalOpen}
          employeeData={selectedEmployee}
        />
      )}
      <ConfirmationModal
        title={"Delete Employee"}
        content="Are you sure you want to delete this Employee?"
        open={isConfirmModalOpen}
        handleClose={closeConfirmationModal}
        handleConfirmation={handleEmployeeDeletion}
      />
    </>
  );
}
