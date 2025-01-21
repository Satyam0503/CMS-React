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
  Visibility,
} from "@mui/icons-material";
import JobDetail from "./JobDetail";
import JobDescription from "./JobDescription";
import Setting from "../../users/usersetting/Setting";
import { CustomIconButton } from "../../components/CustomIconButton";
import { SearchInput } from "../../components/SearchInput";
import { CustomisedTable } from "../../components/CustomisedTable";
import { JobRequirementTableColumnList } from "../../../../utils/constant/Constant";
import dayjs from "dayjs";
import { Pagination } from "../../components/Pagination";
import { ConfirmationModal } from "../../components/ConfirmationModal";

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

const jobs = [
  {
    jobTitle: "Demo",
    department: "Development",
    noOfPosition: 2,
    interviewDate: dayjs(),
    jobType: "Remote",
    jobTime: "FullTime",
    status: 2,
  },
];

export default function Jobs() {
  const intl = useIntl();
  const [openModal, setOpenModal] = React.useState(false);
  const [page, setPage] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const [isConfirmationModalOpen, setConfirmModalOpen] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<any | undefined>();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleEditJob = () => {
    
  };

  const deleteJob =()=>{
    // write job deletion logic
      console.log("Job Deleted");
  }
  const openConfirmationModal = (job: any) => {
    setConfirmModalOpen(true);
    setSelectedJob(job);
  };

  const closeConfirmationModal= ()=>{
    setSelectedJob(undefined);
    setConfirmModalOpen(false);
  }
  return (
    <>
      <Card sx={{ p: "2rem" }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap-reverse"}
            gap={2}
          >
            <SearchInput search={search} setSearch={setSearch} />
            <Stack direction="row" spacing={1}>
              <CustomIconButton
                tooltip="Filter employee"
                icon={<FilterList />}
              />
              <CustomIconButton
                tooltip="Add job description"
                icon={<Add />}
                handleClick={() => setOpenModal(true)}
              />
              <CustomIconButton tooltip="Import Excel" icon={<Download />} />
            </Stack>
          </Stack>
          <CustomisedTable
            columns={JobRequirementTableColumnList}
            rows={jobs}
            page={page}
            rowsPerPage={rowPerPage}
            handleEdit={handleEditJob}
            openConfirmationModal={openConfirmationModal}
          />
          {totalRecords > rowPerPage && (
            <Pagination
              page={page}
              setPage={setPage}
              setRowPerPage={setRowPerPage}
              
              rowsPerPage={rowPerPage}
              totalRecords={totalRecords}
            />
          )}
          {isConfirmationModalOpen && selectedJob && (
            <ConfirmationModal
              title={"Delete Job"}
              content="Are you sure you want to delete this Job?"
              open={isConfirmationModalOpen}
              handleClose={closeConfirmationModal}
              handleConfirmation={deleteJob}
            />
          )}
        </Stack>
      </Card>
    </>
  );
}
