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

import HolidayForm from "./HolidayForm";
import { auto } from "@popperjs/core";
import { Add, Close, Download, FilterList, SearchOutlined } from "@mui/icons-material";
import { HolidayType } from "../../../utils/common_types";
import dayjs from "dayjs";
import { useState } from "react";
import { CustomisedTable } from "../../modules/components/CustomisedTable";
import { HolidayTabTableColumnList } from "../../../Constant";
import { ConfirmationModal } from "../../modules/components/ConfirmationModal";

// remove this array later
const rows = [
  {
    title: "Test",
    type: "Custom Holiday",
    startDate: Date.now(),
    endDate: Date.now(),
    description: "Test",
  }
];

const initialValues: HolidayType = {
  id: "",
  title: "",
  type: "",
  startDate: dayjs(Date.now()),
  endDate: dayjs(Date.now()),
  description: ""
}

export default function Holidays() {
  const [initialHolidayValues, setInitialHolidayValues] = useState(initialValues);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [holidayList, setHolidayList] = useState<any[]>(rows);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [isLoading, setLoading] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState<string | null>(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const intl = useIntl();
  const handleCloseModal = () => {
    setModalOpen(false);
    setEdit(false);
    setInitialHolidayValues(initialValues);
  };

  const handleAddUpdateHoliday = (values: HolidayType, setSubmitting: (isSubmitting: boolean) => void) => {
    // write logic to add-update holidays
    console.log(values);
  }

  const handleHolidayEdit = (row: any) => {
    //  set initial values with updated holiday value
    setEdit(true)
    setModalOpen(true);
  }

  const handleHolidayDeletion = () => {
    // logic for holiday deletion
  }

  const openConfirmationModal = (holidayId: string) => {
    setConfirmModalOpen(true);
    setSelectedHolidayId(holidayId);
  }
  function closeConfirmationModal() {
    setConfirmModalOpen(false);
    setSelectedHolidayId(null);
  }

  return (
    <>
      <Grid container sx={{ maxWidth: "1200px" }} mx={auto} my={6} spacing={2}>
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
                    <InputAdornment position="start">
                      <SearchOutlined />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        sx={{ border: "none" }}
                        onClick={() => setSearchValue("")}
                      >
                        <Close />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                variant="outlined"
                placeholder="Search something ..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
              />
            </Stack>
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="filter employee">
                <FilterList />
              </IconButton>
              <IconButton
                aria-label="Add Holiday"
                onClick={() => setModalOpen(true)}
              >
                <Add />
              </IconButton>
              <IconButton aria-label="import excel">
                <Download />
              </IconButton>
            </Stack>
          </Stack>
          <Stack sx={{ mt: "1rem" }}>
            <CustomisedTable
              tabName="Holiday"
              columns={HolidayTabTableColumnList}
              rows={holidayList}
              page={page}
              setPage={setPage}
              totalRecords={totalRecords}
              rowsPerPage={rowPerPage}
              setRowPerPage={setRowPerPage}
              loading={isLoading}
              handleEdit={handleHolidayEdit}
              openConfirmationModal={openConfirmationModal}
            />
          </Stack>
        </Card>
      </Grid>
      {
        isModalOpen &&
        <HolidayForm
          open={isModalOpen}
          handleClose={handleCloseModal}
          initialValues={initialHolidayValues}
          handleAddUpdateHoliday={handleAddUpdateHoliday}
        />
      }
      {
        isConfirmModalOpen &&
        <ConfirmationModal
          title="Delete Holiday"
          content="Are you sure you want to delete this holiday?"
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleHolidayDeletion}
        />
      }
    </>
  );
}
