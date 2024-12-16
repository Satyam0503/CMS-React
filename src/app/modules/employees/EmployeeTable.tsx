import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import { Grid } from "@mui/material";

interface Column {
  id: "Sno" | "name" | "email" | "phone" | "department" | "address" | "action";
  label: string;
  minWidth?: number;
  align?: "right";
  format?: (value: number) => string;
}

const columns: readonly Column[] = [
  { id: "Sno", label: "#", minWidth: 50 },
  { id: "name", label: "Name", minWidth: 170 },
  { id: "email", label: "Email", minWidth: 100 },
  {
    id: "phone",
    label: "Phone number",
    minWidth: 170,
    align: "right",
  },
  {
    id: "department",
    label: "Department",
    minWidth: 170,
    align: "right",
  },
  {
    id: "address",
    label: "Address",
    minWidth: 170,
    align: "right",
  },
  {
    id: "action",
    label: "Action",
    minWidth: 170,
    align: "right",
  },
];

interface Data {
  Sno: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  address: string;
  action: string;
}

function createData(
  Sno: string,
  name: string,
  email: string,
  phone: string,
  department: string,
  address: string,
  action: string
): Data {
  // const density = name / email;
  return { Sno, name, email, phone, department, address, action };
}

const rows = [
  createData("1", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("2", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("3", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("4", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("5", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("6", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("7", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("8", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("9", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("10", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("11", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("12", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("13", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("14", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("15", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
  createData("16", "India", "IN", "123456", "Testing", "Dehradun", "Delete"),
];

export default function EmployeeTable() {
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Grid item sx={{ width: "100%", overflow: "hidden" }}>
      <TableContainer sx={{ minHeight: 600 }}>
        <Table stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1}>
                    {columns.map((column) => {
                      const value = row[column.id];
                      return (
                        <TableCell key={column.id} align={column.align}>
                          {column.format && typeof value === "number"
                            ? column.format(value)
                            : value}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[10, 25, 100]}
        component="div"
        count={rows.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </Grid>
  );
}
