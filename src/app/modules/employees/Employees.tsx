import {
  Typography,
  Card,
  Stack,
  TextField,
  InputAdornment,
  Container,
  IconButton,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  Close,
  Download,
  FilterList,
  SearchOutlined,
} from "@mui/icons-material";

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
import { EmployeesDataTypes } from "../../../utils/common_types";
import { ConfirmationModal } from "../components/ConfirmationModal";
import { employeesListMapperforExport } from "../../../utils/common";
import { ViewEmployeeDetails } from "./ViewEmployeeDetails";
import { SearchInput } from "../components/SearchInput";
import { CustomIconButton } from "../components/CustomIconButton";
const { token } = JSON.parse(localStorage.getItem("kt-auth-react-v") || "{}");

const employeeInitialValue: EmployeesDataTypes = {
  id: "",
  firstName: "",
  lastName: "",
  gender: "",
  email: "",
  role: "",
  dateOfBirth: null,
  employeeId: "",
  department: "",
  reportingManager: "",
  teamLead: "",
  phoneNumber: "",
  bloodGroup: "",
  status: "",
  address: "",
  jobRole: "",
  dateOfJoining: null,
  personalEmail: "",
  emergencyContact: "",
  profilePicture: "",
};
export default function Employees() {
  const intl = useIntl();
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [employeeInitialValues, setEmployeeInitialValues] =
    useState(employeeInitialValue);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedEmployeeData, setSelectedEmployeeData] =
    useState<EmployeesDataTypes>({} as EmployeesDataTypes);
  const [page, setPage] = useState<number>(0);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [employeeList, setEmployeeList] = useState<EmployeesDataTypes[]>([]);
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
    values: EmployeesDataTypes,
    setSubmitting: (isSubmitting: boolean) => void
  ) {
    setLoading(true);
    if (isEdit) {
      const employeeId = values.id;
      const payload = {
        ...values,
      };
      updateEmployee(employeeId, payload, token)
        .then((res) => {
          const { success, message } = res.data;
          if (success) {
            toast.success("Employee Details Updated Successfully");
            setSubmitting(false);
            setRefresh(!isRefresh);
            handleClose();
          }
        })
        .catch((res) => {
          console.log(res);
          toast.error("Network Error.Try Again");
        });
    } else {
      const payload = {
        firstName: values.firstName,
        lastName: values.lastName,
        gender: values.gender,
        employeeId: values.employeeId,
        dateOfBirth: values.dateOfBirth,
        email: values.email,
        jobRole: values.jobRole,
        role: values.role,
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
          console.log(error);
        });
    }
  }

  function handleEmployeeDeletion(res: string) {
    if (res !== "ok" || selectedEmployee === null) {
      toast.error("Please try again");
      closeConfirmationModal();
    } else {
      const employeeId = selectedEmployee;
      deleteEmployee(employeeId, token)
        .then((res) => {
          const { success, message } = res.data;
          if (success) {
            toast.success(message);
            closeConfirmationModal();
            setRefresh(!isRefresh);
          }
        })
        .catch((error) => {
          toast.error("Please try again");
          closeConfirmationModal();
        });
    }
  }

  const openConfirmationModal = (employeeId: string) => {
    setConfirmModalOpen(true);
    setSelectedEmployee(employeeId);
  };

  function closeConfirmationModal() {
    setConfirmModalOpen(false);
    setSelectedEmployee(null);
  }

  function openViewModal(id: string) {
    setViewModalOpen(true);
    setSelectedEmployee(id);
    const employeeDetails = employeeList.find((employee) => employee.id === id);
    if (employeeDetails) {
      setSelectedEmployeeData(employeeDetails);
    }
  }
  function handleEmployeeEdit(row: EmployeesDataTypes) {
    setEmployeeInitialValues({
      id: row.id,
      firstName: row.firstName,
      lastName: row.lastName,
      gender: row.gender,
      employeeId: row.employeeId,
      email: row.email,
      jobRole: row.jobRole,
      role: row.role,
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
    const payload = {
      pageNo: page + 1,
      limit: rowPerPage,
      name: search,
    };
    const timeOutId = setTimeout(() => {
      getAllEmployees(payload, token)
        .then((res) => {
          const { methodResult, success } = res.data;
          if (success) {
            setEmployeeList(methodResult.record);
            setTotalRecords(methodResult.totalEmployees);
            setLoading(false);
          }
        })
        .catch((res) => {
          toast.error(res);
        });
    }, 1500);
    return () => clearTimeout(timeOutId);
  }, [page, rowPerPage, isRefresh, search]);

  return (
    <Container sx={{ pt: "16px" }}>
      <Stack direction="column" spacing={2}>
        <Typography variant="h4" className="my-6">
          {intl.formatMessage({ id: "MENU.EMP" })}
        </Typography>
        <Card sx={{ width: "100%", p: "16px" }}>
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
          <Stack sx={{ mt: "1rem" }}>
            <CustomisedTable
              tabName="Employee"
              totalRecords={totalRecords}
              loading={isLoading}
              rows={employeeList}
              columns={EmployeeTabTableColumnList}
              page={page}
              setPage={setPage}
              rowsPerPage={rowPerPage}
              setRowPerPage={setRowPerPage}
              handleEdit={handleEmployeeEdit}
              openConfirmationModal={openConfirmationModal}
              openViewModal={openViewModal}
            />
          </Stack>
        </Card>
      </Stack>
      {isModalOpen && (
        <AddUpdateEmployee
          open={isModalOpen}
          isEdit={isEdit}
          handleClose={handleClose}
          initialValues={employeeInitialValues}
          SaveAddEditEmployee={SaveAddEditEmployee}
        />
      )}
      {isViewModalOpen && (
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
    </Container>
  );
}
