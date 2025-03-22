import {
  Card,
  Container,
  Grid,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";

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
import { useCallback, useState } from "react";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { HolidayTabTableColumnList } from "../../../utils/constant/Constant";
import { SearchInput } from "../../shared/components/SearchInput";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import HolidayForm from "./components/HolidayForm";
import { ConfirmationModal } from "../../shared/components/ConfirmationModal";

// remove this array later
const rows = [
  {
    id: "2",
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

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

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
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.HOLIDAYS" })}
      </Typography>
      <Card sx={{ p: "2rem" }}>
        <Stack
          direction="row"
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
          flexWrap={"wrap-reverse"}
          gap={2}
        >
          <SearchInput search={searchValue} setSearch={handleSearchChange} />
          <Stack direction="row" spacing={1}>
            <CustomIconButton tooltip="Filter List" icon={<FilterList />} />
            <CustomIconButton
              tooltip="Add Holiday"
              icon={<Add />}
              handleClick={() => setModalOpen(true)}
            />
            <CustomIconButton
              tooltip={intl.formatMessage({
                id: "IMPORT.EXCEL",
              })}
              icon={<Download />}
            />
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
        </Stack>
      </Card>

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
