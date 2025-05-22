import * as React from "react";

import { Card, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import {
  Add,
  Download,
  FilterList,
  ListAltOutlined,
} from "@mui/icons-material";

import { SearchInput } from "../../shared/components/SearchInput";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { NoticeModel } from "../../../utils/common_types";
import { NoticeBoardTableColumnList } from "../../../utils/constant/Constant";
import { AddNotice } from "./components/AddNotice";
import { ConfirmationModal } from "../../shared/components/ConfirmationModal";
import { useNavigate } from "react-router-dom";
import CustomisedButton from "../../shared/components/CustomisedButton";
import { usePageData } from "../../../_themes/layout/core";
import dayjs from "dayjs";

// Original
// const rows = [
//   {
//     title: "Test",
//     type: "Custom Notice",
//     startDate: new Date(),
//     endDate: new Date(),
//     description: "Test",
//   },
// ];

// By Rajdeep
const rows = [
  {
    id: "1",
    name: "Rajdeep Rautela",
    date: new Date(),
    type: "General",
    message: "This is my first task. Learning continues...",
  },
];

// const initialValues: NoticeModel = {
//   id: "",
//   type: "",
//   target: "",
//   group: "",
//   message: "",
// };

// By Rajdeep
const initialValues: NoticeModel = {
  id: "",
  name: "",
  date: dayjs(Date.now()),
  type: "",
  message: "",
};

export default function NoticeBoard() {
  const [initialNoticeValues, setInitialNoticeValues] =
    React.useState(initialValues);
  const [searchValue, setSearchValue] = React.useState("");
  const [isModalOpen, setModalOpen] = React.useState(false);

  // const [NoticeList, setNoticeList] = React.useState<NoticeModel[]>([]); // original
  const [NoticeList, setNoticeList] = React.useState<any[]>(rows); // By Rajdeep

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
  const { setPageTitle } = usePageData();

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
  const navigate = useNavigate();

  const openConfirmationModal = (notice: NoticeModel) => {
    setConfirmModalOpen(true);
    setSelectedNotice(notice);
  };
  function closeConfirmationModal() {
    setConfirmModalOpen(false);
    setSelectedNotice(null);
  }

  React.useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.NOTICE_BOARD" }));
  }, []);

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
          <SearchInput search={searchValue} setSearch={handleSearchChange} />
          <Stack direction={"row"} flexWrap={"wrap"} gap={1}>
            <Stack>
              <CustomisedButton
                variant="outlined"
                Icon={<ListAltOutlined />}
                iconPosition="end"
                label="My Notice Board"
                handleClick={() => {
                  navigate("/noticeboard/usernoticeboard");
                }}
                style={{ paddingBlock: 5 }}
              />
            </Stack>

            <Stack direction="row" spacing={1}>
              <CustomIconButton tooltip="Filter List" icon={<FilterList />} />
              <CustomIconButton
                tooltip="Post notice"
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
