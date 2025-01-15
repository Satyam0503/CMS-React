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
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  AttachFile,
  Close,
  DeleteOutline,
  Download,
  Edit,
  FilterList,
  LinkOutlined,
  Search,
} from "@mui/icons-material";
import JobDetail from "./JobDetail";
import JobDescription from "./JobDescription";
import Setting from "../../../modules/users/usersetting/Setting";

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
  const [openModal, setOpenModal] = React.useState(false);

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleAddHoliday = () => {
    handleCloseModal();
  };

  return (
    <>
      <Stack>
        <Typography variant="h4" sx={{ pb: "20px" }}>
          {intl.formatMessage({ id: "REQUIREMENT.JOBS" })}
        </Typography>
      </Stack>
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
                    <Search />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton sx={{ border: "none" }}>
                      <Close />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              placeholder="Search ..."
            />
          </Stack>
          <Stack direction="row" spacing={1}>
            <IconButton aria-label="filter employee">
              <FilterList />
            </IconButton>
            <IconButton onClick={() => setOpenModal(true)}>
              <Add />
            </IconButton>
            {openModal && (
              <JobDescription open={openModal} handleClose={handleCloseModal} />
            )}
            <IconButton aria-label="import excel">
              <Download />
            </IconButton>
          </Stack>
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

                      <IconButton>
                        <LinkOutlined />
                      </IconButton>
                      <IconButton>
                        <AttachFile />
                      </IconButton>
                      <Stack>
                        <JobDetail />
                      </Stack>
                      <IconButton>
                        <DeleteOutline />
                      </IconButton>
                      <IconButton>
                        <Edit />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Card>
    </>
  );
}
