import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { Add, Check, Visibility } from "@mui/icons-material";
import {
  Grid,
  IconButton,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { useIntl } from "react-intl";
import { CustomisedModal } from "../../components/CustomisedModal";
import Summary from "../Summary";

function createData(
  date: string,
  absent: number,
  firsthalf: number,
  secondhalf: number,
  wfh: number,
  total: number,
  action: string
) {
  return { date, absent, firsthalf, secondhalf, wfh, total, action };
}

const rows = [createData("10/12/24", 159, 6, 24, 4, 5, "")];

export default function LeaveSummary() {
  const [open, setOpen] = React.useState(false);
  const intl = useIntl();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Date</TableCell>
            <TableCell align="left">Absent</TableCell>
            <TableCell align="left">First Half</TableCell>
            <TableCell align="left">Second Half</TableCell>
            <TableCell align="left">Working From Home</TableCell>
            <TableCell align="left">Total</TableCell>
            <TableCell align="left">Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.date}>
              <TableCell component="th" scope="row">
                {row.date}
              </TableCell>
              <TableCell component="th" scope="row">
                {row.absent}
              </TableCell>
              <TableCell align="left">{row.firsthalf}</TableCell>
              <TableCell align="left">{row.secondhalf}</TableCell>
              <TableCell align="left">{row.wfh}</TableCell>
              <TableCell align="left">{row.total}</TableCell>
              <TableCell align="left">
                {row.action}
                <IconButton onClick={() => setOpen(true)}>
                  <Visibility />
                </IconButton>
                <CustomisedModal open={open} handleClose={handleClose}>
                  <Grid container className="d-flex mt-2">
                    <Stack>
                      <Typography variant="h5" className="text-primary mb-2">
                        {intl.formatMessage({ id: "INFO.SUMMARY" })}
                      </Typography>
                    </Stack>
                    <Summary />
                  </Grid>
                </CustomisedModal>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
