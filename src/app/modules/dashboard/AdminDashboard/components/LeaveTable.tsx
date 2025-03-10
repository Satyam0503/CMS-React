import {
  Add,
  ArrowBack,
  BackHand,
  Close,
  Delete,
  DeleteOutline,
  Download,
  Edit,
} from "@mui/icons-material";
import {
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import { CustomIconButton } from "../../../components/CustomIconButton";

function createData(
  sno: number,
  date: string,
  type: string,
  count: string,
  reason: string,
  status: string,
  action: string
) {
  return { sno, date, type, count, reason, status, action };
}

const rows = [
  createData(
    1,
    "New Year",
    "Public Holiday",
    "1 Jan'25",
    "3 Jan'25",
    "approved",
    ""
  ),
  createData(
    1,
    "New Year",
    "Public Holiday",
    "1 Jan'25",
    "3 Jan'25",
    "pending",
    ""
  ),
];

export default function AttendanceTable() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid container p={3}>
      <Typography variant="h6" mb={1}>
        {intl.formatMessage({ id: "MENU.LEAVE.DETAILS" })}
      </Typography>

      <TableContainer>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="left">#</TableCell>
              <TableCell align="left">Date</TableCell>
              <TableCell align="left">Type</TableCell>
              <TableCell align="right">Count</TableCell>
              <TableCell align="right">Reason</TableCell>
              <TableCell align="right">Status</TableCell>
              <TableCell align="center">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.sno}>
                <TableCell>{row.sno}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.type}</TableCell>
                <TableCell align="right">{row.count}</TableCell>
                <TableCell align="right">{row.reason}</TableCell>
                <TableCell align="right">{row.status}</TableCell>
                <TableCell align="right">
                  {row.action}
                  <CustomIconButton icon={<Edit />} handleClick={() => {}} />
                  <CustomIconButton
                    icon={<DeleteOutline />}
                    handleClick={() => {}}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
}
