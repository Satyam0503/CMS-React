import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { colors } from "../../modules/theme/MuiTheme";
import { Checkbox, Typography } from "@mui/material";
import { useIntl } from "react-intl";

function createData(name: string) {
  return { name };
}

const rows = [
  createData("Contacts"),
  createData("Attendance"),
  createData("Project"),
  createData("Leaves"),
  createData("Post Notice"),
];

export default function AdminPermissions() {
  const label = { inputProps: { "aria-label": "Checkbox demo" } };
  const intl = useIntl();
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            <TableCell sx={{ color: colors.alpha.neutral[800] }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "600" }}>
                {intl.formatMessage({ id: "MENU.MODULE" })}
              </Typography>
            </TableCell>
            <TableCell sx={{ color: colors.alpha.neutral[800] }} align="right">
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "600" }}>
                {intl.formatMessage({ id: "MENU.SUP.ADMIN" })}
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ color: colors.alpha.neutral[800] }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "600" }}>
                {intl.formatMessage({ id: "MENU.ADMIN" })}
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ color: colors.alpha.neutral[800] }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "600" }}>
                {intl.formatMessage({ id: "MENU.MGMT" })}
              </Typography>
            </TableCell>
            <TableCell align="right" sx={{ color: colors.alpha.neutral[800] }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: "600" }}>
                {intl.formatMessage({ id: "MENU.USER" })}
              </Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
              }}
            >
              <TableCell
                component="th"
                scope="row"
                sx={{ color: colors.alpha.neutral[800] }}
              >
                {row.name}
              </TableCell>
              <TableCell align="right">
                <Checkbox {...label} defaultChecked />
              </TableCell>
              <TableCell align="right">
                <Checkbox {...label} defaultChecked />
              </TableCell>
              <TableCell color="primary" align="right">
                <Checkbox {...label} defaultChecked />
              </TableCell>
              <TableCell
                align="right"
                sx={{ color: colors.alpha.primary[500] }}
              >
                <Checkbox {...label} defaultChecked />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
