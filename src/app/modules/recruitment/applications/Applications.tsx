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
  Delete,
  DeleteOutline,
  Download,
  Edit,
  FilterList,
  Search,
  SearchOutlined,
  Visibility,
} from "@mui/icons-material";
import CustomisedButton from "../../components/CustomisedButton";
import ApplicationPreview from "./ApplicationPreview";
import { CustomIconButton } from "../../components/CustomIconButton";

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
    <>
      <Card sx={{ p: "2rem" }}>
        <Stack
          direction="row"
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap-reverse"}
          gap={2}
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
            <CustomIconButton tooltip="Filter List" icon={<FilterList />} />
            <CustomIconButton tooltip="Import Excel" icon={<Download />} />
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
                    <TableCell
                      align="right"
                      sx={{ display: "flex", gap: "5px" }}
                    >
                      {row.action}

                      <IconButton>
                        <Download />
                      </IconButton>
                      <Stack>
                        <ApplicationPreview />
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

      <Dialog open={openModal} onClose={handleCloseModal}>
        <DialogContent sx={{ width: "100%" }}>
          <ApplicationPreview />
        </DialogContent>
      </Dialog>
    </>
  );
}
