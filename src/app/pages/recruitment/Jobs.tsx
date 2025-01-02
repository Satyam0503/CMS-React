import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import {
  Card,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  Link,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  AddOutlined,
  Close,
  Delete,
  DeleteOutline,
  Download,
  FileCopyOutlined,
  FilterList,
  LinkOutlined,
  SearchOutlined,
  Visibility,
} from "@mui/icons-material";
import CustomisedButton from "../../modules/components/CustomisedButton";
import CustomisedSearch from "../../modules/components/CustomisedSearch";
import Holidays from "../holidays/Holidays";
import { CustomisedModal } from "../../modules/components/CustomisedModal";
import JobDescription from "./JobDescription";
import JobDetail from "./JobDetail";

function createData(
  sno: number,
  title: string,
  type: string,
  startdate: string,
  enddate: string,
  description: string,
  action: string
) {
  return { sno, title, type, startdate, enddate, description, action };
}

const rows = [
  createData(
    1,
    "New Year",
    "Public Holiday",
    "1 Jan'25",
    "3 Jan'25",
    "Celebrations",
    ""
  ),
];

export default function Jobs() {
  const intl = useIntl();
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <Grid
      container
      sx={{ maxWidth: "1200px", mx: "auto", my: "20px" }}
      spacing={2}
    >
      <Stack>
        <Typography variant="h4" sx={{ pb: "20px" }}>
          {intl.formatMessage({ id: "REQUIREMENT.JOBS" })}
        </Typography>
      </Stack>
      <Card sx={{ width: "100%", p: "16px" }}>
        <Stack alignItems={"center"}>
          <CustomisedSearch />
        </Stack>
        <Stack sx={{ mt: "1rem" }}>
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="simple table">
              <TableHead>
                <TableRow>
                  <TableCell align="left">#</TableCell>
                  <TableCell align="left">Title</TableCell>
                  <TableCell align="left">Type</TableCell>
                  <TableCell align="right">Start Date</TableCell>
                  <TableCell align="right">End Date</TableCell>
                  <TableCell align="right">Description</TableCell>
                  <TableCell align="center">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.sno}>
                    <TableCell>{row.sno}</TableCell>
                    <TableCell>{row.title}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell align="right">{row.startdate}</TableCell>
                    <TableCell align="right">{row.enddate}</TableCell>
                    <TableCell align="right">{row.description}</TableCell>
                    <TableCell
                      align="right"
                      sx={{
                        display: "flex",
                        gap: "4px",
                        mr: "10px",
                      }}
                    >
                      {row.action}
                      <Stack>
                        <JobDetail />
                      </Stack>

                      <IconButton>
                        <DeleteOutline />
                      </IconButton>

                      <Stack>
                        <JobDescription />
                      </Stack>
                      <IconButton>
                        <LinkOutlined />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Card>
    </Grid>
  );
}
