import * as React from "react";
import { Card, IconButton, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { Download, FilterList } from "@mui/icons-material";
import { CustomisedTable } from "../../components/CustomisedTable";
import { ApplicationTabTableColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../components/Pagination";
import { SearchInput } from "../../components/SearchInput";
import dayjs from "dayjs";
import ApplicationPreview from "./ApplicationPreview";

const application = [
  {
    jobTitle: "Demo",
    exprience: 2,
    applyDate: dayjs(),
    location: "Dehradun",
    noticePeriod: "3 months",
    status: 3,
  },
];

export default function Applications() {
  const intl = useIntl();
  const [openModal, setOpenModal] = React.useState(false);
  const [page, setPage] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const [applicationsList, setApplicationsList] =
    React.useState<any[]>(application);
  const [viewApplicant, setViewApplicant] = React.useState(false);
  const [selectedApplicant, setSelectedApplicant] = React.useState<
    any | undefined
  >();

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleEdit = (row: any) => {};

  const handleViewApplicant = () => {
    setViewApplicant(true);
  };
  return (
    <>
      <Card sx={{ p: "16px" }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <SearchInput search={search} setSearch={setSearch} />
            <Stack direction="row" spacing={1}>
              <IconButton aria-label="filter employee">
                <FilterList />
              </IconButton>
              <IconButton aria-label="import excel">
                <Download />
              </IconButton>
            </Stack>
          </Stack>

          <CustomisedTable
            rows={applicationsList}
            columns={ApplicationTabTableColumnList}
            page={page}
            rowsPerPage={rowPerPage}
            handleEdit={handleEdit}
            openViewModal={handleViewApplicant}
          />

          {totalRecords > rowPerPage && (
            <Pagination
              page={page}
              setPage={setPage}
              rowsPerPage={rowPerPage}
              setRowPerPage={setRowPerPage}
              totalRecords={totalRecords}
            />
          )}
        </Stack>
      </Card>
      {viewApplicant && (
        <ApplicationPreview open={viewApplicant} setOpen={setViewApplicant} />
      )}
    </>
  );
}
