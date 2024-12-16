import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function createData(
  name: string,
  calories: number,
  fat: number,
  carbs: number
) {
  return { name, calories, fat, carbs };
}

const rows = [
  createData("Casual", 15, 6, 4),
  createData("Medical", 37, 9, 7),
  createData("Earned", 62, 1, 4),
  createData("Paid", 35, 3, 6),
];

export default function CustomisedTable() {
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Leave Type</TableCell>
            <TableCell align="right">Allotted</TableCell>
            <TableCell align="right">Taken</TableCell>
            <TableCell align="right">Available</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
