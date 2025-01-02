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
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  AddOutlined,
  Close,
  Download,
  FilterList,
  SearchOutlined,
} from "@mui/icons-material";
import CustomisedButton from "../../modules/components/CustomisedButton";

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
    "Delete"
  ),
];

export default function Applications() {
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
    <Grid
      container
      sx={{ maxWidth: "1200px", mx: "auto", my: "20px" }}
      spacing={2}
    >
      <Stack>
        <Typography variant="h4" sx={{ pb: "20px" }}>
          {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
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
                  <InputAdornment position="start">Applications</InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
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
            <IconButton onClick={handleOpenModal}>
              <Add />
            </IconButton>
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
                  <TableCell align="right">Action</TableCell>
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
                    <TableCell align="right">{row.action}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Card>

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogContent sx={{ width: "100%" }}></DialogContent>
      </Dialog>
      <CustomisedButton className={"button-large"} label={"Save"} />
    </Grid>
  );
}
