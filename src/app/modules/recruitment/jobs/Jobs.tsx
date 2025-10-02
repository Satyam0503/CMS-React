import * as React from "react";
import { Badge, Card, Stack } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Download, FilterList } from "@mui/icons-material";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { SearchInput } from "../../../shared/components/SearchInput";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { JobRequirementTableColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../../shared/components/Pagination";
import {
  addJobVacancy,
  deleteJobVacancy,
  editJobVacancy,
  getAllJobVacancies,
} from "../services";
import { toast } from "react-toastify";
import { useEffect, useMemo, useState } from "react";
import { ViewJobDetails } from "./components/ViewJobDetails";
import { ConfirmationModal } from "../../../shared/components/ConfirmationModal";
import { GetAllVacancyPayload, JobModal } from "../models";
import { AddEditJob } from "./components/AddEditJob";
import {
  countAppliedFilter,
  hasModuleFeaturePermission,
  removeUnwantedString,
} from "../../../../utils/common";
import { useAppSelector } from "../../../Redux/hooks";
import { ModulesName, Permission } from "../../../../utils/enums";
import { initialJobFilter, JobFilter, jobStatusDecoder } from "./components/JobFilter";
import { usePageData } from "../../../Context/PageDataProvider";

const initialValues: JobModal = {
  jobId: "",
  title: "",
  vacancies: 1,
  description: "",
  jobType: 1,
  status: true,
};

export const getVacancyPayload: GetAllVacancyPayload = { ...initialJobFilter, status: true, search: "" }

export default function Jobs() {
  const { formatMessage: i } = useIntl();
  const [paginationValues, setPaginationValues] = useState({ pageNo: 0, records: 10, });
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
  const { setPageTitle } = usePageData();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "job-filter" : undefined;
  const userModulesPermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const jobFilters = useAppSelector(state => state.filters.jobs);

  const hasAddPermission = hasModuleFeaturePermission(ModulesName.Jobs, Permission.Create, userModulesPermissions);
  const hasEditPermission = hasModuleFeaturePermission(ModulesName.Jobs, Permission.Edit, userModulesPermissions);

  const handleSearchChange = (value: string) => {
    if (paginationValues.pageNo > 0 && value.trim().length >= 0) {
      setPaginationValues({ ...paginationValues, pageNo: 0 });
    }
    setSearch(value.trim());
  };

  const handleClose = () => {
    setEdit(false);
    setOpenModal(false);
    setJobInitialValues(initialValues);
  };

  const handleEditJob = (job: JobModal) => {
    if (hasEditPermission) {
      setJobInitialValues({
        ...job,
      });
      setOpenModal(true);
      setEdit(true);
    }
  };

  const closeConfirmationModal = () => {
    setSelectedJob(undefined);
    setConfirmModalOpen(false);
  };

  const handleJobDetailView = (job: JobModal) => {
    setSelectedJob(job);
    setViewModalOpen(true);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handledeleteJob = async (res: string) => {
    if (res !== "ok" || selectedJob === undefined) {
      closeConfirmationModal();
    } else {
      try {
        const response = await deleteJobVacancy(selectedJob.jobId);
        const { success } = response.data;
        if (success) {
          setRefresh(!isRefresh);
          toast.success(i({ id: "TOAST.SUCCESS.DELETE" }));
          closeConfirmationModal();
        }
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
        toast.error(i({ id: "TOAST.FAILED.DELETE" }));
      }
    }
  };

  const handleAddEditJob = async (
    values: JobModal,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    const payload = {
      ...values,
      description: removeUnwantedString(values.description),
    };
    if (isEdit) {
      const jobId = values.jobId;
      try {
        const response = await editJobVacancy(payload, jobId);
        const { success, message } = response.data;
        if (!success) {
          toast.error(i({ id: "TOAST.FAILED.UPDATED" }));
        } else {
          toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
          setRefresh(!isRefresh);
          handleClose();
        }
      } catch (error: any) {
        console.error(error.message);
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        const response = await addJobVacancy(payload);
        const { success } = response.data;
        if (!success) {
          toast.error(i({ id: "TOAST.FAILED.JOB_POST" }))
        } else {
          toast.success(i({ id: "TOAST.SUCCESS.JOB_POST" }));
          setRefresh(!isRefresh);
          handleClose();
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationValues({
      ...paginationValues,
      pageNo: page,
    });
  };

  const handleRowPerPageChange = (rowPerPage: number) => {
    setPaginationValues({
      ...paginationValues,
      records: rowPerPage,
      pageNo: 0,
    });
  };

  useEffect(() => {
    setLoading(true);
    const payload: GetAllVacancyPayload = {
      search: search,
      pageNo: paginationValues.pageNo + 1,
      records: paginationValues.records,
      ...(jobFilters ? jobFilters : initialJobFilter),
      status: jobFilters ? jobFilters.status == null ? null : jobStatusDecoder[jobFilters.status] : null,
    };
    (async () => {
      try {
        const response = await getAllJobVacancies(payload);
        const { success, methodResults, totalRecords } = response.data;
        if (success) {
          setJobList(methodResults);
          setTotalRecords(totalRecords);
        }
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [isRefresh, paginationValues, search, jobFilters]);

  useEffect(() => {
    setPageTitle(i({ id: "PAGE.JOBS" }));
  }, []);

  return (
    <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
      <Stack className="flex-row justify-content-between align-items-center gap-4 flex-wrap-reverse" >
        <SearchInput search={search} setSearch={handleSearchChange} />
        <Stack direction="row" spacing={1}>
          <Badge anchorOrigin={{
            horizontal: "left",
            vertical: "top"
          }} color="primary" badgeContent={countAppliedFilter(jobFilters)} >
            <CustomIconButton
              icon={<FilterList />}
              ariaLabel="job filter"
              handleClick={handleFilterClick}
            />
          </Badge>
          {
            hasAddPermission &&
            <CustomIconButton
              icon={<Add />}
              handleClick={() => setOpenModal(true)}
            />
          }
        </Stack>
      </Stack>
      <CustomisedTable
        keyName="jobId"
        columns={JobRequirementTableColumnList}
        rows={jobList}
        page={paginationValues.pageNo}
        rowsPerPage={paginationValues.records}
        openViewModal={handleJobDetailView}
        loading={loading}
        rowClickHandler={handleEditJob}
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
          title={i({
            id: "CONFIRMATION.TITLE.DELETE_JOB",
          })}
          content={i({
            id: "CONFIRMATION.CONTENT.DELETE_JOB",
          })}
          open={isConfirmationModalOpen}
          handleClose={closeConfirmationModal}
          handleConfirmation={handledeleteJob}
        />
      )}
      {openModal && (
        <AddEditJob
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
      {open && (
        <JobFilter
          open={true}
          id={id}
          anchorEl={anchorEl}
          handleClose={() => setAnchorEl(null)}
        />
      )}
    </Card>
  );
}
