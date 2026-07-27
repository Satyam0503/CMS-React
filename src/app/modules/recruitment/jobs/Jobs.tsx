import * as React from "react";
import { Badge, Card, Stack, Tooltip } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, AssignmentOutlined, FilterList } from "@mui/icons-material";
import { CustomIconButton } from "../../../shared/components/C_IconButton";
import { SearchInput } from "../../../shared/components/SearchInput";
import {
  addJobVacancy,
  deleteJobVacancy,
  editJobVacancy,
  getAllJobVacancies,
} from "../services";
import { toast } from "react-toastify";
import { lazy, Suspense, useEffect, useState } from "react";
import { ViewJobDetails } from "./components/ViewJobDetails";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import { GetAllVacancyPayload, JobModal } from "../models";
import { AddEditJob } from "./components/AddEditJob";
import {
  countAppliedFilter,
  dateFormatter,
  hasModuleFeaturePermission,
  jobTypeDecoder,
  removeUnwantedString,
} from "../../../../utils/common";
import { useAppSelector } from "../../../Redux/hooks";
import { ModulesName, Permission } from "../../../../utils/enums";
import {
  initialJobFilter,
  JobFilter,
  jobStatusDecoder,
} from "./components/JobFilter";
import { usePageData } from "../../../Context/PageDataProvider";
import { AxiosError } from "axios";
import {
  GridActionsCell,
  GridActionsCellItem,
  GridColDef,
  GridPaginationModel,
  GridRenderCellParams,
  GridRowParams,
} from "@mui/x-data-grid";
import clsx from "clsx";
import { StyleStatus } from "../../../shared/components/StyledStatus";
import { Box } from "@mui/system";

const CustomDataGrid = lazy(() =>
  import("../../../shared/components/C_DataGrid").then((module) => ({
    default: module.CustomDataGrid,
  }))
) as typeof import("../../../shared/components/C_DataGrid")["CustomDataGrid"];

const initialValues: JobModal = {
  jobId: "",
  title: "",
  vacancies: 1,
  description: "",
  jobType: 1,
  status: true,
  summary: "",
  location: "",
  workplaceType: "",
  employmentType: "",
  experienceMin: null,
  experienceMax: null,
  department: "",
  functionalArea: "",
  industry: "",
  roleCategory: "",
  educationRequirement: "",
  responsibilities: [],
  requiredSkills: [],
  preferredSkills: [],
  benefits: [],
  keywords: [],
  shiftType: "",
  workingDays: "",
  recruiterContactEmail: "",
  applicationDeadline: null,
  publishToCareerPortal: true,
  publishToMasterPortal: false,
  isFeatured: false,
  isUrgentHiring: false,
};

const useJobTableColumnList = (): GridColDef<JobModal>[] => {
  const { formatMessage: i } = useIntl();

  return [
    {
      field: "title",
      headerName: i({ id: "JOB.JOB_TITLE" }),
      description: i({ id: "JOB.JOB_TITLE" }),
      minWidth: 240,
      hideable: false,
      flex: 1,
      renderCell: (params: any) => {
        return <Box component={"p"}>{params.row.title}</Box>;
      },
    },
    {
      field: "vacancies",
      headerName: i({ id: "JOB.NO_OF_VACANCIES" }),
      description: i({ id: "JOB.NO_OF_VACANCIES" }),
      minWidth: 180,
      hideable: false,
      flex: 1,
      renderCell: (params: any) => {
        return <Box component={"p"}>{params.row.vacancies}</Box>;
      },
    },
    {
      field: "jobType",
      headerName: i({ id: "JOB.TYPE" }),
      description: i({ id: "JOB.TYPE" }),
      minWidth: 180,
      hideable: false,
      flex: 1,
      renderCell: (params: any) => {
        const values = jobTypeDecoder[params.row.jobType];
        return <Box component={"p"}>{i({ id: values })}</Box>;
      },
    },
    {
      field: "status",
      headerName: i({ id: "STATUS" }),
      description: i({ id: "STATUS" }),
      minWidth: 100,
      hideable: false,
      flex: 1,
      renderCell: (param: any) => {
        return (
          <StyleStatus
            label={param.row.status === true ? "ACTIVE" : "INACTIVE"}
            className={clsx({
              success: param.row.status === true,
              danger: param.row.status === false,
            })}
          />
        );
      },
    },
    {
      field: "action",
      headerName: i({ id: "ACTION" }),
      description: i({ id: "ACTION" }),
      minWidth: 100,
      resizable: false,
      sortable: false,
      flex: 1,
      filterable: false,
      renderCell: (param) => <ActionsCell {...param} />,
    },
  ];
};

function ActionsCell(props: GridRenderCellParams) {
  const { formatMessage: i } = useIntl();
  const [view, setView] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobModal | undefined>();
  const closePreview = () => {
    setView(false);
  };

  const handleJobDetailView = (job: JobModal) => {
    setSelectedJob(job);
    setViewModalOpen(true);
  };

  return (
    <>
      <GridActionsCell {...props}>
        <GridActionsCellItem
          icon={
            <Tooltip title={i({ id: "TOOLTIP.VIEW_CV" })}>
              <AssignmentOutlined />
            </Tooltip>
          }
          label={i({ id: "TOOLTIP.VIEW_CV" })}
          onClick={(e) => {
            console.log(props);

            setView(true);
            handleJobDetailView(props.row);
            e.stopPropagation();
          }}
        />
      </GridActionsCell>
      {isViewModalOpen && selectedJob && (
        <ViewJobDetails
          open={isViewModalOpen}
          setOpen={setViewModalOpen}
          jobData={selectedJob}
        />
      )}
    </>
  );
}

export const getVacancyPayload: GetAllVacancyPayload = {
  ...initialJobFilter,
  status: true,
  search: "",
};

export default function Jobs() {
  const { formatMessage: i } = useIntl();
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
  const { setPageTitle } = usePageData();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? "job-filter" : undefined;
  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const jobFilters = useAppSelector((state) => state.filters.jobs);
  const columnList = useJobTableColumnList();

  const hasAddPermission = hasModuleFeaturePermission(
    ModulesName.Jobs,
    Permission.Create,
    userModulesPermissions
  );
  const hasEditPermission = hasModuleFeaturePermission(
    ModulesName.Jobs,
    Permission.Edit,
    userModulesPermissions
  );

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

  const handleEditJob = (param: GridRowParams<JobModal>) => {
    if (hasEditPermission) {
      setJobInitialValues({
        ...param.row,
      });
      setOpenModal(true);
      setEdit(true);
    }
  };

  const closeConfirmationModal = () => {
    setSelectedJob(undefined);
    setConfirmModalOpen(false);
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
      workplaceType:
        values.jobType === 3 ? "Remote" : values.jobType === 2 ? "Hybrid" : "On-site",
      publishToMasterPortal:
        !!values.publishToCareerPortal && !!values.publishToMasterPortal,
    };
    if (isEdit) {
      const jobId = values.jobId;
      try {
        const response = await editJobVacancy(payload, jobId);
        const { success } = response.data;
        if (!success) {
          toast.error(i({ id: "TOAST.FAILED.UPDATED" }));
        } else {
          toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
          setRefresh(!isRefresh);
          handleClose();
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      } finally {
        setSubmitting(false);
      }
    } else {
      try {
        const response = await addJobVacancy(payload);
        const { success } = response.data;
        if (!success) {
          toast.error(i({ id: "TOAST.FAILED.JOB_POST" }));
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

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationValues({
      pageNo: model.page,
      records: model.pageSize,
    });
  };

  useEffect(() => {
    setLoading(true);
    const payload: GetAllVacancyPayload = {
      search: search,
      pageNo: paginationValues.pageNo + 1,
      records: paginationValues.records,
      ...(jobFilters ? jobFilters : initialJobFilter),
      status: jobFilters
        ? jobFilters.status == null
          ? null
          : jobStatusDecoder[jobFilters.status]
        : null,
    };
    (async () => {
      try {
        const response = await getAllJobVacancies(payload);
        const { success, methodResults, totalRecords } = response.data;
        if (success) {
          setJobList(methodResults);
          setTotalRecords(totalRecords);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
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
      <Stack className="flex-row justify-content-between align-items-center gap-4 flex-wrap-reverse">
        <SearchInput search={search} setSearch={handleSearchChange} />
        <Stack direction="row" spacing={1}>
          <Badge
            anchorOrigin={{
              horizontal: "left",
              vertical: "top",
            }}
            color="primary"
            badgeContent={countAppliedFilter(jobFilters)}
          >
            <CustomIconButton
              icon={<FilterList />}
              ariaLabel="job filter"
              handleClick={handleFilterClick}
            />
          </Badge>
          {hasAddPermission && (
            <CustomIconButton
              icon={<Add />}
              handleClick={() => setOpenModal(true)}
            />
          )}
        </Stack>
      </Stack>
      <Suspense fallback={null}>
        <CustomDataGrid
          keyName="jobId"
          loading={loading}
          columns={columnList}
          row={jobList}
          rowClickHandler={handleEditJob}
          rowCount={totalRecords}
          paginationModel={{
            page: paginationValues.pageNo,
            pageSize: paginationValues.records,
          }}
          handlePaginationModelChange={handlePaginationModelChange}
        />
      </Suspense>
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
