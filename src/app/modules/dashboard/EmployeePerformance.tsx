import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function createData(
  sno: number,
  name: string,
  performance: string,
  graph: string
) {
  return { sno, name, performance, graph };
}

const rows = [createData(1, "Ganesh Singh", "Good", "")];

export default function EmployeePerformance() {
  return (
    <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell align="left">#</TableCell>
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">Performance</TableCell>
            <TableCell align="right">Graph</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.sno}
              </TableCell>
              <TableCell align="left">{row.name}</TableCell>
              <TableCell align="left">{row.performance}</TableCell>
              <TableCell align="right">{row.graph}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
