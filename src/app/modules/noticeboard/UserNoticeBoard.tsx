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
import { ConfirmationModal } from "../../modules/components/ConfirmationModal";
import { NoticeModel } from "../../../utils/common_types";
import { NoticeBoardTableColumnList } from "../../../utils/constant/Constant";
import { AddNotice } from "./AddNotice";

const rows = [
  {
    title: "Test",
    type: "Custom Notice",
    startDate: new Date(),
    endDate: new Date(),
    description: "Test",
  },
];

const initialValues: NoticeModel = {
  id: "",
  type: "",
  target: "",
  group: "",
  message: "",
};

export default function UserNoticeBoard() {
  const [initialNoticeValues, setInitialNoticeValues] =
    React.useState(initialValues);
  const [searchValue, setSearchValue] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);
  const [NoticeList, setNoticeList] = React.useState<NoticeModel[]>([]);
  const [page, setPage] = React.useState(0);
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const [isLoading, setLoading] = React.useState(false);
  const [isRefresh, setRefresh] = React.useState(false);
  const [isEdit, setEdit] = React.useState(false);
  const [selectedNotice, setSelectedNotice] =
    React.useState<NoticeModel | null>(null);
  const [isConfirmModalOpen, setConfirmModalOpen] = React.useState(false);

  const intl = useIntl();

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleCloseModal = () => {
    setModalOpen(false);
    setEdit(false);
    setInitialNoticeValues(initialValues);
  };

  const handleAddEditNotice = (
    values: NoticeModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    console.log(values);
  };

  const handleNoticeEdit = (notice: NoticeModel) => {
    setEdit(true);
    setModalOpen(true);
  };

  const handleNoticeDeletion = () => {};

  const openConfirmationModal = (notice: NoticeModel) => {
    setConfirmModalOpen(true);
    setSelectedNotice(notice);
  };
  function closeConfirmationModal() {
    setConfirmModalOpen(false);
    setSelectedNotice(null);
  }

  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.USER.NOTICE_BOARD" })}
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
          <Stack direction={"row"} flexWrap={"wrap"} gap={2}>
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
            tabName="Notice Board"
            columns={NoticeBoardTableColumnList}
            rows={NoticeList}
            page={page}
            rowsPerPage={rowPerPage}
            loading={isLoading}
            handleEdit={handleNoticeEdit}
            openConfirmationModal={openConfirmationModal}
          />
        </Stack>
      </Card>

      {isModalOpen && (
        <AddNotice
          initialValues={initialNoticeValues}
          open={isModalOpen}
          handleClose={handleCloseModal}
          handleAddEditNotice={handleAddEditNotice}
          isEdit={isEdit}
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
