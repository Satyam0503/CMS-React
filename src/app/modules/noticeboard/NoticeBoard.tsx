import * as React from "react";

import {
  Button,
  Card,
  Container,
  Grid,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  Download,
  FilterList,
  ListAltOutlined,
} from "@mui/icons-material";

import { SearchInput } from "../../modules/components/SearchInput";
import { CustomIconButton } from "../../modules/components/CustomIconButton";
import { colors } from "../../modules/theme/MuiTheme";
import { CustomisedTable } from "../../modules/components/CustomisedTable";
import HolidayForm from "../../modules/holidays/HolidayForm";
import { ConfirmationModal } from "../../modules/components/ConfirmationModal";
import { HolidayType } from "../../../utils/common_types";
import dayjs from "dayjs";
import { NoticeBoardTableColumnList } from "../../../utils/constant/Constant";

// function createData(
//   sno: number,
//   title: string,
//   type: string,
//   startdate: string,
//   enddate: string,
//   description: string,
//   action: string
// ) {
//   return { sno, title, type, startdate, enddate, description, action };
// }

// const rows = [
//   createData(
//     1,
//     "New Year",
//     "Public Holiday",
//     "1 Jan'25",
//     "3 Jan'25",
//     "Celebrations",
//     ""
//   ),
// ];

const rows = [
  {
    title: "Test",
    type: "Custom Notice",
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
  endDate: dayjs(Date.now()),
  description: "",
};

export default function NoticeBoard() {
  const [initialNoticeValues, setInitialNoticeValues] =
    React.useState(initialValues);
  const [searchValue, setSearchValue] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [NoticeList, setNoticeList] = React.useState<any[]>(rows);
  const [page, setPage] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const [isLoading, setLoading] = React.useState(false);
  const [isRefresh, setRefresh] = React.useState(false);
  const [isEdit, setEdit] = React.useState(false);
  const [selectedNoticeId, setSelectedNoticeId] = React.useState<string | null>(
    null
  );
  const [isConfirmModalOpen, setConfirmModalOpen] = React.useState(false);

  const intl = useIntl();
  const handleCloseModal = () => {
    setModalOpen(false);
    setEdit(false);
    setInitialNoticeValues(initialValues);
  };

  const handleAddUpdateNotice = (
    values: HolidayType,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    console.log(values);
  };

  const handleNoticeEdit = (row: any) => {
    setEdit(true);
    setModalOpen(true);
  };

  const handleNoticeDeletion = () => {};

  const openConfirmationModal = (noticeId: string) => {
    setConfirmModalOpen(true);
    setSelectedNoticeId(noticeId);
  };
  function closeConfirmationModal() {
    setConfirmModalOpen(false);
    setSelectedNoticeId(null);
  }

  return (
    <>
      <Card sx={{ p: "16px" }}>
        <Stack
          direction="row"
          display={"flex"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          <SearchInput search={searchValue} setSearch={setSearchValue} />
          <Stack direction={"row"} spacing={1}>
            <Button
              startIcon={<ListAltOutlined />}
              variant="outlined"
              size="small"
            >
              <Link
                href="mynoticeboard"
                underline="hover"
                color={colors.alpha.neutral[800]}
              >
                {"My Notice Board"}
              </Link>
            </Button>

            <Stack direction="row" spacing={1}>
              <CustomIconButton tooltip="Filter List" icon={<FilterList />} />
              <CustomIconButton
                tooltip="Post notice"
                icon={<Add />}
                handleClick={() => setModalOpen(true)}
              />
              <CustomIconButton tooltip="Import Excel" icon={<Download />} />
            </Stack>
          </Stack>
        </Stack>
        <Stack sx={{ mt: "1rem" }}>
          <CustomisedTable
            tabName="Notice"
            columns={NoticeBoardTableColumnList}
            rows={NoticeList}
            page={page}
            setPage={setPage}
            totalRecords={totalRecords}
            rowsPerPage={rowPerPage}
            setRowPerPage={setRowPerPage}
            loading={isLoading}
            handleEdit={handleNoticeEdit}
            openConfirmationModal={openConfirmationModal}
          />
        </Stack>
      </Card>

      {isModalOpen && (
        <HolidayForm
          open={isModalOpen}
          handleClose={handleCloseModal}
          initialValues={initialNoticeValues}
          handleAddUpdateHoliday={handleAddUpdateNotice}
        />
      )}
      {isConfirmModalOpen && (
        <ConfirmationModal
          title="Delete Notice"
          content="Are you sure you want to delete this notice?"
          open={isConfirmModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handleNoticeDeletion}
        />
      )}
    </>
  );
}
