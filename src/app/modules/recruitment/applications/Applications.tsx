import * as React from "react";
import { Card, IconButton, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Download, FilterList } from "@mui/icons-material";
import { CustomisedTable } from "../../components/CustomisedTable";
import { ApplicationTabTableColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../components/Pagination";
import { SearchInput } from "../../components/SearchInput";
import dayjs from "dayjs";
import ApplicationPreview from "./ApplicationPreview";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { AddApplicant } from "./AddApplicant";
import { CustomIconButton } from "../../components/CustomIconButton";

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
  const [isConfirmModalOpen, setConfirmModalOpen] = React.useState(false);
  const handleEdit = (applicant: any) => {};
  const openConfirmationModal = (applicant: any) => {
    setConfirmModalOpen(true);
    setSelectedApplicant(applicant);
  };

  const handleOpenPreview = (applicant: any) => {
    setViewApplicant(true);
    setSelectedApplicant(applicant);
  };

  const closePreview = () => {
    setViewApplicant(false);
    setSelectedApplicant(undefined);
  };

  const handleResumeDownload = () => {
    console.log("download resume");
  };

  const handleApplicantDeletion = () => {
    console.log("delete Applicant");
  };
  return (
    <>
      <Card sx={{ p: 2.6 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            display={"flex"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <SearchInput search={search} setSearch={setSearch} />

            <Stack direction="row" spacing={1}>
              <CustomIconButton
                icon={<FilterList />}
                tooltip="Filter Application"
                ariaLabel="Filter Application"
              />
              <AddApplicant />

              <CustomIconButton
                icon={<Download />}
                tooltip="Import Excel"
                ariaLabel="import excel"
              />
            </Stack>
          </Stack>

          <CustomisedTable
            rows={applicationsList}
            columns={ApplicationTabTableColumnList}
            page={page}
            rowsPerPage={rowPerPage}
            handleEdit={handleEdit}
            openConfirmationModal={openConfirmationModal}
            openViewModal={handleOpenPreview}
            handleDownload={handleResumeDownload}
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

      {viewApplicant && selectedApplicant && (
        <ApplicationPreview
          open={viewApplicant}
          handleClose={closePreview}
          applicantData={selectedApplicant}
        />
      )}
      <ConfirmationModal
        title={"Delete Applicant"}
        content="Are you sure you want to delete this applicant?"
        open={isConfirmModalOpen}
        handleClose={() => setConfirmModalOpen(false)}
        handleConfirmation={handleApplicantDeletion}
      />
    </>
  );
}
