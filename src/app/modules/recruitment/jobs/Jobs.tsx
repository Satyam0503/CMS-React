import * as React from "react";

import { Card, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Download, FilterList } from "@mui/icons-material";

import JobDescription from "./JobDescription";

import { CustomIconButton } from "../../components/CustomIconButton";
import { SearchInput } from "../../components/SearchInput";
import { CustomisedTable } from "../../components/CustomisedTable";
import { JobRequirementTableColumnList } from "../../../../utils/constant/Constant";

import { Pagination } from "../../components/Pagination";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { JobModal } from "../../../../utils/common_types";
import { addJobVacancy } from "../services";
import { useAppSelector } from "../../../Redux/hooks";

import { toast } from "react-toastify";
import { statusDecoder } from "../../../../utils/common";
import { useEffect } from "react";

const initialValues: JobModal = {
  jobId: "",
  title: "",
  vacancies: 1,
  description: "",
  jobType: "",
  status: "Active",
};

export default function Jobs() {
  const intl = useIntl();
  const [openModal, setOpenModal] = React.useState(false);
  const [page, setPage] = React.useState<number>(0);
  const [search, setSearch] = React.useState("");
  const [totalRecords, setTotalRecords] = React.useState(0);
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const [isConfirmationModalOpen, setConfirmModalOpen] = React.useState(false);
  const [selectedJob, setSelectedJob] = React.useState<any | undefined>();
  const [jobList, setJobList] = React.useState<any[]>([]);
  const [isEdit, setEdit] = React.useState(false);

  const token = useAppSelector((state) => state.auth.token)!;

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleClose = () => {
    setEdit(false);
    setOpenModal(false);
  };

  const handleEditJob = () => {};

  const handleAddEditJob = async (
    values: JobModal,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    if (isEdit) {
      // handle Edit logic
    } else {
      const payload = { ...values, status:statusDecoder(values.status as string) };
      try {
        const response = await addJobVacancy(payload, token);
        const { message, success } = response.data;
        if (!success) {
          throw new Error(message);
        }
        toast.success(message);
        setSubmitting(false);
        handleClose();
      } catch (error: any) {
        toast.error(error.message);
        setSubmitting(false);
      } finally {
      }
    }
  };

  const deleteJob = () => {
    // write job deletion logic
    console.log("Job Deleted");
  };
  const openConfirmationModal = (job: any) => {
    setConfirmModalOpen(true);
    setSelectedJob(job);
  };

  const closeConfirmationModal = () => {
    setSelectedJob(undefined);
    setConfirmModalOpen(false);
  };

  useEffect(()=>{
    // fetch all jobs;
  },[]);

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
            rows={jobList}
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
          {openModal && (
            <JobDescription
              initialValues={initialValues}
              isEdit={isEdit}
              open={openModal}
              handleClose={handleClose}
              handleAddEditJob={handleAddEditJob}
            />
          )}
        </Stack>
      </Card>
    </>
  );
}
