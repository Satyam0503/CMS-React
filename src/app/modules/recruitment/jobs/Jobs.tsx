import * as React from "react";
import { Badge, Card, Chip, Stack, Tooltip, Typography, useMediaQuery } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, AssignmentOutlined, FilterList } from "@mui/icons-material";
import { CustomIconButton } from "../../../shared/components/C_IconButton";
import { SearchInput } from "../../../shared/components/SearchInput";
import { ResponsiveTableToolbar } from "../../../shared/components/ResponsiveTableToolbar";
import {
  addJobVacancy,
  deleteJobVacancy,
  editJobVacancy,
  getAllJobVacancies,
  getRecruitmentEnterpriseConfig,
} from "../services";
import { toast } from "react-toastify";
import { lazy, Suspense, useEffect, useState } from "react";
import { ViewJobDetails } from "./components/ViewJobDetails";
import { ConfirmationModal } from "../../../shared/components/ConfirmModal";
import { GetAllVacancyPayload, JobModal, RecruitmentEnterpriseConfig } from "../models";
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
  screeningPassScore: null,
  screeningCriteria: [],
};

const useJobTableColumnList = (
  enterpriseConfig: RecruitmentEnterpriseConfig | null,
  jobList: JobModal[]
): GridColDef<JobModal>[] => {
  const { formatMessage: i } = useIntl();

  // Column is visible if:
  // 1. Company enabled screening review/scorecards/per-job workflow customization, OR
  // The Screening Threshold column is opt-in and ONLY displayed when:
  // 1. Company has explicitly configured an active screening threshold (> 0) with auto-advance (non-Simple mode), OR
  // 2. At least one job in the list explicitly has a screening pass score configured (> 0).
  const isCompanyScreeningEnabled = Boolean(
    enterpriseConfig &&
      enterpriseConfig.recruitmentMode !== "Simple" &&
      enterpriseConfig.autoAdvanceOnScreening &&
      (enterpriseConfig.screeningPassScore ?? 0) > 0
  );

  const hasAnyJobSpecificThreshold = jobList.some(
    (job) => typeof job.screeningPassScore === "number" && job.screeningPassScore > 0
  );

  const showScreeningThreshold = isCompanyScreeningEnabled || hasAnyJobSpecificThreshold;

  const columns: GridColDef<JobModal>[] = [
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
  ];

  if (showScreeningThreshold) {
    columns.push({
      field: "screeningPassScore",
      headerName: "Screening Threshold",
      description: "Minimum screening score required to advance candidates",
      minWidth: 175,
      hideable: true,
      flex: 1,
      renderCell: (params: any) => {
        const score = params.row.screeningPassScore;
        const hasScore = typeof score === "number" && score > 0;
        const isDirectHire = params.row.workflowMode === "Direct";
        const criteria = params.row.screeningCriteria as string[] | undefined;
        const hasCriteria = criteria && criteria.length > 0;

        if (isDirectHire) {
          return (
            <Tooltip title="Direct Hire: fast-track offer without screening threshold gate" arrow>
              <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem" }}>
                  — (Direct Hire)
                </Typography>
              </Box>
            </Tooltip>
          );
        }

        if (hasScore) {
          const tooltip = hasCriteria
            ? `Pass Threshold: ≥ ${score}% | Role Criteria: ${criteria.join(", ")}`
            : `Role-specific Pass Threshold: ≥ ${score}%`;
          return (
            <Tooltip title={tooltip} arrow>
              <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                <Chip
                  size="small"
                  variant="filled"
                  color="primary"
                  label={`≥ ${score}% (Role)`}
                  sx={{
                    fontWeight: 750,
                    fontSize: "0.72rem",
                  }}
                />
              </Box>
            </Tooltip>
          );
        }

        const companyThreshold =
          enterpriseConfig &&
          enterpriseConfig.recruitmentMode !== "Simple" &&
          enterpriseConfig.autoAdvanceOnScreening &&
          (enterpriseConfig.screeningPassScore ?? 0) > 0
            ? enterpriseConfig.screeningPassScore
            : null;

        if (companyThreshold) {
          return (
            <Tooltip title={`Inherits company policy threshold: ≥ ${companyThreshold}%`} arrow>
              <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
                <Chip
                  size="small"
                  variant="outlined"
                  color="default"
                  label={`≥ ${companyThreshold}% (Company)`}
                  sx={{
                    fontWeight: 750,
                    fontSize: "0.72rem",
                  }}
                />
              </Box>
            </Tooltip>
          );
        }

        return (
          <Tooltip title="No screening threshold gate configured for this position" arrow>
            <Box sx={{ display: "flex", alignItems: "center", height: "100%" }}>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
                —
              </Typography>
            </Box>
          </Tooltip>
        );
      },
    });
  }

  columns.push(
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
    }
  );

  return columns;
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
  const [enterpriseConfig, setEnterpriseConfig] = useState<RecruitmentEnterpriseConfig | null>(null);

  useEffect(() => {
    let active = true;
    getRecruitmentEnterpriseConfig()
      .then((res) => {
        if (active && res.data?.methodResult) {
          setEnterpriseConfig(res.data.methodResult);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isRefresh]);

  const columnList = useJobTableColumnList(enterpriseConfig, jobList);
  const compactView = useMediaQuery("(max-width:599px)");
  const responsiveColumns = React.useMemo(
    () => columnList.map((column) => {
      if (!compactView) return column;
      if (column.field === "jobType") return { ...column, hideable: true };
      if (column.field === "title") return { ...column, minWidth: 175, flex: 1.5 };
      if (column.field === "vacancies") return { ...column, minWidth: 78, flex: 0.55 };
      if (column.field === "status") return { ...column, minWidth: 74, flex: 0.6 };
      if (column.field === "action") return { ...column, minWidth: 48, flex: 0.35 };
      return column;
    }).filter((column) => !compactView || (column.field !== "jobType" && column.field !== "screeningPassScore")),
    [columnList, compactView],
  );

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
    <Card sx={{ p: { xs: 1.5, sm: 2.5, md: 3 }, borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: "0 12px 32px rgba(46, 38, 69, 0.08)", minWidth: 0, overflow: "hidden" }}>
      <ResponsiveTableToolbar
        search={
          <Box sx={{ minWidth: 0 }}>
          <SearchInput search={search} setSearch={handleSearchChange} />
          </Box>
        }
        actions={<Stack direction="row" spacing={0.75} sx={{ "& button": { width: 40, height: 40, minWidth: 40, borderRadius: 1.75, bgcolor: "background.paper", border: "1px solid", borderColor: "color-mix(in srgb, var(--mui-palette-primary-main) 25%, transparent)", "&:hover": { bgcolor: "color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)" } } }}>
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
              tooltip="Filter jobs"
              handleClick={handleFilterClick}
              toolbar
            />
          </Badge>
          {hasAddPermission && (
            <CustomIconButton
              icon={<Add />}
              tooltip="Add job"
              ariaLabel="Add job"
              handleClick={() => setOpenModal(true)}
              toolbar
            />
          )}
        </Stack>}
      />
      <Suspense fallback={null}>
        <CustomDataGrid
          keyName="jobId"
          loading={loading}
          columns={responsiveColumns}
          row={jobList}
          rowClickHandler={handleEditJob}
          rowCount={totalRecords}
          paginationModel={{
            page: paginationValues.pageNo,
            pageSize: paginationValues.records,
          }}
          handlePaginationModelChange={handlePaginationModelChange}
          sx={{
            minHeight: { xs: 385, sm: 430 },
            "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover" },
            "& .MuiDataGrid-cell": { px: { xs: 1, sm: 1.5 } },
            "& .MuiDataGrid-columnHeader": { px: { xs: 1, sm: 1.5 } },
            "& .MuiDataGrid-footerContainer": { flexWrap: "wrap", minHeight: 52 },
            "& .MuiTablePagination-toolbar": { px: { xs: 0.5, sm: 1 }, flexWrap: "wrap", justifyContent: "flex-end" },
            "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } },
          }}
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
