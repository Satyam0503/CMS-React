import {
  Add,
  ArrowBack,
  BackHand,
  Close,
  Download,
  EditOutlined,
  FileOpenOutlined,
  FilterList,
  LinkOutlined,
  ListAltOutlined,
  Search,
  Visibility,
} from "@mui/icons-material";
import {
  Card,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useIntl } from "react-intl";
import { CustomisedModal } from "../components/CustomisedModal";
import CustomisedButton from "../components/CustomisedButton";
import AddNotice from "./AddNotice";
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

export default function MyNoticeBoard() {
  const intl = useIntl();

  const [open, setOpen] = useState(false);

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
          {intl.formatMessage({ id: "MENU.MY_NOTICE_BOARD" })}
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
              <ArrowBack />
            </IconButton>
            <IconButton aria-label="filter employee">
              <FilterList />
            </IconButton>
            <Stack onClick={() => setOpen(true)}>
              <AddNotice />
            </Stack>
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
                    <TableCell align="right">{row.action}</TableCell>
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
