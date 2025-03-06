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
import { addJobVacancy, editJobVacancy, getAllJobVacancies } from "../services";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";
import { ViewJobDetails } from "./ViewJobDetails";

const initialValues: JobModal = {
  jobId: "",
  companyId: "",
  title: "",
  vacancies: 1,
  description: "",
  jobType: "",
  status: true,
};

export default function Jobs() {
  const intl = useIntl();
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    records: 10,
  });
  const [jobInitialValues, setJobInitialValues] = useState(initialValues);
  const [openModal, setOpenModal] = useState(false);
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [isConfirmationModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobModal | undefined>();
  const [jobList, setJobList] = useState<JobModal[]>([]);
  const [isEdit, setEdit] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRefresh, setRefresh] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);

  const handleSearchChange = React.useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleClose = () => {
    setEdit(false);
    setOpenModal(false);
    setJobInitialValues(initialValues);
  };

  const handleEditJob = (job: JobModal) => {
    setJobInitialValues({
      ...job,
    });
    setOpenModal(true);
    setEdit(true);
  };

  const openConfirmationModal = (job: JobModal) => {
    setConfirmModalOpen(true);
    setSelectedJob(job);
  };

  const closeConfirmationModal = () => {
    setSelectedJob(undefined);
    setConfirmModalOpen(false);
  };

  const handleJobDetailView = (job: JobModal) => {
    setSelectedJob(job);
    setViewModalOpen(true);
  };

  const handledeleteJob = (res: string) => {
    if (res !== "ok" || selectedJob === undefined) {
      toast.error("Error try Again");
      closeConfirmationModal();
    } else {
      //  job deletion logic
      console.log("Job Deleted");
    }
  };

  const handleAddEditJob = async (
    values: JobModal,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    if (isEdit) {
      const payload = {
        ...values,
      };
      const jobId = values.jobId;
      try {
        const response = await editJobVacancy(payload, jobId);
        const { success, message } = response.data;
        if (!success) {
          throw new Error(message);
        }
        toast.success(message);
        setRefresh(!isRefresh);
        handleClose();
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      const payload = {
        ...values,
      };
      try {
        const response = await addJobVacancy(payload);
        const { message, success } = response.data;
        if (!success) {
          throw new Error(message);
        }
        toast.success(message);
        setRefresh(!isRefresh);
        handleClose();
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handlePageChange =  (page:number)=>{
    setPaginationValues({
      ...paginationValues,
      pageNo:page,
    })
  }

  const handleRowPerPageChange = (rowPerPage:number)=>{
    setPaginationValues({
      ...paginationValues,
      records:rowPerPage,
      pageNo:0,
    })
  }

  useEffect(() => {
    setLoading(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await getAllJobVacancies({companyId:""},paginationValues.pageNo+1,paginationValues.records);
        const { success, methodResults,totalRecords } = response.data;
        if (success ) {
          setJobList(methodResults.reverse());
          setTotalRecords(totalRecords);
        }
        setLoading(false);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [isRefresh,paginationValues]);

  return (
    <>
      <Card sx={{ p: 2.6 }}>
        <Stack spacing={2}>
          <Stack
            direction="row"
            justifyContent={"space-between"}
            alignItems={"center"}
            flexWrap={"wrap-reverse"}
            gap={2}
          >
            <SearchInput search={search} setSearch={handleSearchChange} />
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
            page={paginationValues.pageNo}
            rowsPerPage={paginationValues.records}
            handleEdit={handleEditJob}
            openConfirmationModal={openConfirmationModal}
            openViewModal={handleJobDetailView}
            loading={loading}
          />
          {totalRecords > 0 && (
            <Pagination
              page={paginationValues.pageNo}
              setPage={handlePageChange}
              setRowPerPage={handleRowPerPageChange}
              rowsPerPage={paginationValues.records}
              totalRecords={totalRecords}
            />
          )}
          {isConfirmationModalOpen && selectedJob && (
            <ConfirmationModal
              title={"Delete Job"}
              content="Are you sure you want to delete this Job?"
              open={isConfirmationModalOpen}
              handleClose={closeConfirmationModal}
              handleConfirmation={handledeleteJob}
            />
          )}
          {openModal && (
            <JobDescription
              initialValues={jobInitialValues}
              isEdit={isEdit}
              open={openModal}
              handleClose={handleClose}
              handleAddEditJob={handleAddEditJob}
            />
          )}
          {isViewModalOpen && selectedJob && (
            <ViewJobDetails
              open={isViewModalOpen}
              setOpen={setViewModalOpen}
              jobData={selectedJob}
            />
          )}
        </Stack>
      </Card>
    </>
  );
}
