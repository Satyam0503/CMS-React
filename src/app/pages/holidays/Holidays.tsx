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
import {
  Add,
  Close,
  Download,
  FilterList,
  SearchOutlined,
} from "@mui/icons-material";
import { HolidayType } from "../../../utils/common_types";
import dayjs from "dayjs";
import { useState } from "react";
import { CustomisedTable } from "../../modules/components/CustomisedTable";
import { HolidayTabTableColumnList } from "../../../Constant";
import { ConfirmationModal } from "../../modules/components/ConfirmationModal";
import { SearchInput } from "../../modules/components/SearchInput";
import { CustomIconButton } from "../../modules/components/CustomIconButton";
import { Pagination } from "../../modules/components/Pagination";


// remove this array later
const rows = [
  {
    id:"2",
    title: "Test",
    type: "Custom Holiday",
    startDate: new Date(),
    endDate: new Date(),
    description: "Test",
  },
];

const initialValues: HolidayType = {
  id: "",
  title: "",
  type: "",
  startDate: dayjs(Date.now()),
  endDate: null,
  description: "",
};

export default function Holidays() {
  const [initialHolidayValues, setInitialHolidayValues] =
    useState(initialValues);
  const [searchValue, setSearchValue] = useState("");
  const [isModalOpen, setModalOpen] = useState(false);
  const [holidayList, setHolidayList] = useState<any[]>(rows);
  const [page, setPage] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [rowPerPage, setRowPerPage] = useState<number>(10);
  const [isLoading, setLoading] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
  const [isEdit, setEdit] = useState(false);
  const [selectedHolidayId, setSelectedHolidayId] = useState<string | null>(
    null
  );
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const intl = useIntl();
  const handleCloseModal = () => {
    setModalOpen(false);
    setEdit(false);
    setInitialHolidayValues(initialValues);
  };

  const handleAddUpdateHoliday = (
    values: HolidayType,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    // write logic to add-update holidays
    console.log(values);
  };

  const handleHolidayEdit = (row: any) => {
    //  set initial values with updated holiday value
    setEdit(true);
    setModalOpen(true);
  };

  const handleHolidayDeletion = () => {
    // logic for holiday deletion
  };

  const openConfirmationModal = (holidayId: string) => {
    setConfirmModalOpen(true);
    setSelectedHolidayId(holidayId);
  };
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
            <SearchInput search={searchValue} setSearch={setSearchValue} />
            <Stack direction="row" spacing={1}>
              <CustomIconButton tooltip="Filter List" icon={<FilterList/>}  />
              <CustomIconButton tooltip="Add Holiday" icon={<Add/>} handleClick={()=>setModalOpen(true)}/>
              <CustomIconButton tooltip="Import Excel" icon={<Download/>} />
            </Stack>
          </Stack>
          <Stack sx={{ mt: "1rem" }}>
            <CustomisedTable
              tabName="Holiday"
              columns={HolidayTabTableColumnList}
              rows={holidayList}
              page={page}
              rowsPerPage={rowPerPage}
              loading={isLoading}
              handleEdit={handleHolidayEdit}
              openConfirmationModal={openConfirmationModal}
            />
            {
              ( totalRecords > rowPerPage ) &&
              <Pagination
                page={page}
                setPage={setPage}
                rowsPerPage={rowPerPage}
                setRowPerPage={setRowPerPage}
                totalRecords={totalRecords}
              />
            }
          </Stack>
        </Card>
      </Grid>
      {isModalOpen && (
        <HolidayForm
          open={isModalOpen}
          handleClose={handleCloseModal}
          initialValues={initialHolidayValues}
          handleAddUpdateHoliday={handleAddUpdateHoliday}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmationModal
          title="Delete Holiday"
          content="Are you sure you want to delete this holiday?"
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleHolidayDeletion}
        />
      )}
    </>
  );
}
