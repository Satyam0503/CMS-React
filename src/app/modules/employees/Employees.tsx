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
import DownloadCV from "./DownloadCV";
import SortEmployee from "./SortEmployee";
import { useEffect, useState } from "react";
import {
  addEmployee,
  getAllEmployees,
  updateEmployee,
} from "./employeeServices";
import { toast } from "react-toastify";
import { CustomisedTable } from "../components/CustomisedTable";
import { EmployeeTabTableColumnList } from "../../../Constant";
import dayjs, { Dayjs } from "dayjs";
import { EmployeesDataTypes } from "../../../common_types";
const { token } = JSON.parse(localStorage.getItem("kt-auth-react-v") || "{}");

// export interface employeeInitialValueType {
//   id?:string;
//   firstName: string;
//   lastName: string;
//   gender: string;
//   email: string;
//   role: string;
//   employeeId: string;
//   department: string;
//   dateOfBirth: Dayjs | null;
//   reportingManager: string;
//   teamLead: string;
//   phoneNumber: string;
//   bloodGroup: string;
//   status: string,
//   address: string,
//   jobRole: string,
//   dateOfJoining: Dayjs | null,
//   personalEmail: string,
//   emergencyContact: string,
//   profilePicture?: string | File | null,
// }
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
  const [page, setPage] = useState<number>(0);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [isLoading, setLoading] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
  const [search, setSearch] = useState<string>("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [isEdit, setEdit] = useState(false);

  function handleClose() {
    setModalOpen(false);
    setEmployeeInitialValues(employeeInitialValue);
    setEdit(false);
  }

  function SaveAddEditEmployee(values: EmployeesDataTypes) {
    setLoading(true);
    if (isEdit) {
      console.log(values);
      const employeeId = values.id;
      const payload = {
        ...values,
      };
      updateEmployee(employeeId, payload, token)
        .then((res) => {
          const { success, message } = res.data;
          if (success) {
            toast.success(message);
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
          console.log(res);
          setLoading(false);
          setRefresh(!isRefresh);
          toast.success(res.data.message);
          handleClose();
        })
        .catch((error) => {
          setLoading(false);
          toast.error(error.message);
          console.log(error);
        });
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
            <Stack>
              <TextField
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setSearch("")}
                        sx={{
                          border: 0,
                          padding: "2px",
                          "&:hover, &.Mui-selected, &.Mui-selected:hover": {
                            border: "none",
                            background: "none",
                          },
                        }}
                      >
                        <Close />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                placeholder="Search something ..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="filter employee">
                <FilterList />
              </IconButton>
              <IconButton
                aria-label="add employee"
                onClick={() => setModalOpen(true)}
              >
                <Add />
              </IconButton>
              <IconButton aria-label="import excel">
                <Download />
              </IconButton>
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
            />
          </Stack>
        </Card>
      </Stack>
      {isModalOpen && (
        <AddUpdateEmployee
          open={isModalOpen}
          isEdit={isEdit}
          handleClose={handleClose}
          // setRefresh={setRefresh}
          initialValues={employeeInitialValues}
          SaveAddEditEmployee={SaveAddEditEmployee}
        />
      )}
    </Container>
  );
}
