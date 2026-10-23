import { Badge, Box, Card, Stack, Tooltip, useMediaQuery } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { Add, AssignmentOutlined, FilterList, TuneRounded } from "@mui/icons-material";
import { SearchInput } from "../../../shared/components/SearchInput";
import { ResponsiveTableToolbar } from "../../../shared/components/ResponsiveTableToolbar";
import { AddApplicant } from "./components/AddApplicant";
import { CustomIconButton } from "../../../shared/components/C_IconButton";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getAllApplicantList } from "../services";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApplicationPreview } from "./components/ApplicationPreview";
import { RecruitmentLifecycleDrawer } from "./components/RecruitmentLifecycleDrawer";
import {
  ApplicationFilter,
  initialFilterValues,
} from "./components/ApplicationFilter";
import RecruitmentPipelineSummaryCard from "./components/RecruitmentPipelineSummaryCard";
import RecruitmentOnboardingQueueCard from "./components/RecruitmentOnboardingQueueCard";
import { useAppDispatch, useAppSelector } from "../../../Redux/hooks";
import { Applicant, ApplicationPayload } from "../models";
import { ApplicantStatus, ApplicationStatus, ModulesName, Permission } from "../../../../utils/enums";
import {
  applicantStatusDecoder,
  applicationStatusMapper,
  countAppliedFilter,
  dateFormatter,
  getModulePermissions,
} from "../../../../utils/common";
import { usePageData } from "../../../Context/PageDataProvider";
import { GridActionsCell, GridActionsCellItem, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowParams } from "@mui/x-data-grid";
import { StyleStatus } from "../../../shared/components/StyledStatus";
import clsx from "clsx";
import { PaginationModel } from "../../../../utils/common_types";
import { setApplicationFilter } from "../../../Redux/Reducers/filterSlice";
import RecruitmentScreeningQueueCard from "./components/RecruitmentScreeningQueueCard";
import RecruitmentSelectedOfferQueueCard from "./components/RecruitmentSelectedOfferQueueCard";
import RecruitmentPreboardingQueueCard from "./components/RecruitmentPreboardingQueueCard";

const CustomDataGrid = lazy(() =>
  import("../../../shared/components/C_DataGrid").then((module) => ({
    default: module.CustomDataGrid,
  }))
) as typeof import("../../../shared/components/C_DataGrid")["CustomDataGrid"];

const useApplicantTableColumnList = (onOpenLifecycle?: (app: Applicant) => void): GridColDef<Applicant>[] => {
  const { formatMessage: i } = useIntl();
  return [
    {
      field: "name",
      headerName: i({ id: "FORM.FULL_NAME", }),
      description: i({ id: "FORM.FULL_NAME", }),
      minWidth: 150,
      hideable: false,
      flex: 1,
      valueGetter: (value, row) => {
        return `${row.firstName || ''} ${row.lastName || ''}`;
      }
    },
    {
      field: "email",
      headerName: i({ id: "FORM.EMAIL", }),
      description: i({ id: "FORM.EMAIL", }),
      minWidth: 150,
      hideable: false,
      flex: 1,
    },
    {
      field: "vacancyName",
      headerName: i({ id: "JOB.JOB_TITLE", }),
      description: i({ id: "JOB.JOB_TITLE", }),
      minWidth: 180,
      hideable: false,
      flex: 1,
    },
    {
      field: "status",
      headerName: "Candidate Status",
      description: i({ id: "STATUS", }),
      minWidth: 135,
      disableColumnMenu: true,
      hideable: false,
      flex: 1,
      renderCell: (param) => {
        const values = applicantStatusDecoder[param.row.status];
        return (
          <StyleStatus
            label={values}
            className={clsx({
              success: param.row.status === ApplicantStatus.Active,
              danger: param.row.status === ApplicantStatus.InActive,
            })}
          />
        );
      }
    },
    {
      field: "applicationStatus",
      headerName: i({ id: "APPLICATION.STATUS_LABEL" }),
      description: i({ id: "APPLICATION.STATUS_LABEL" }),
      minWidth: 180,
      flex: 1.2,
      disableColumnMenu: true,
      hideable: true,
      sortable: false,
      filterable: false,
      renderCell: (param) => (
        <StyleStatus
          label={applicationStatusMapper[param.row.activityType]}
          className={clsx({
            info: param.row.activityType === ApplicationStatus.New,
            warning: [ApplicationStatus.InProgress, ApplicationStatus.OnHold, ApplicationStatus.Shortlisted].includes(param.row.activityType),
            success: param.row.activityType === ApplicationStatus.Selected,
            danger: param.row.activityType === ApplicationStatus.Rejected
          })}
        />
      )

    },
    {
      field: "experience",
      headerName: i({ id: "FORM.EXPERIENCE" }),
      description: i({ id: "FORM.EXPERIENCE" }),
      minWidth: 135,
      disableColumnMenu: true,
      flex: 1,
      renderCell: (param) => {
        const exp = param.row.experience;
        if (exp == null || exp === undefined) return "-";
        if (exp === 0) return "Fresher (0 yr)";
        if (exp >= 12) {
          const yrs = (exp / 12).toFixed(1);
          return `${yrs} ${exp >= 24 ? "years" : "year"}`;
        }
        return `${exp} months`;
      }
    },
    {
      field: "applyDate",
      headerName: i({ id: "APPLICATION.APPLIED_DATE", }),
      description: i({ id: "APPLICATION.APPLIED_DATE", }),
      minWidth: 200,
      flex: 1,
      valueFormatter: (value) => (
        dateFormatter(value, "DD MMM YYYY hh:mm A")
      )
    },
    {
      field: "action",
      headerName: i({ id: "ACTION", }),
      description: i({ id: "ACTION", }),
      minWidth: 100,
      disableColumnMenu: true,
      resizable: false,
      sortable: false,
      flex: 0.8,
      filterable: false,
      display: "flex",
      renderCell: (param) => (<ActionsCell {...param} onOpenLifecycle={onOpenLifecycle} />)
    }
  ]
}

function ActionsCell(props: GridRenderCellParams & { onOpenLifecycle?: (app: Applicant) => void }) {
  const { formatMessage: i } = useIntl();
  const [view, setView] = useState(false);
  const closePreview = () => {
    setView(false);
  }
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
            setView(true)
            e.stopPropagation();
          }}
        />
        {props.onOpenLifecycle && (
          <GridActionsCellItem
            icon={
              <Tooltip title="Manage Pipeline Stage & Workflow">
                <TuneRounded color="primary" sx={{ fontSize: 19 }} />
              </Tooltip>
            }
            label="Manage Stage"
            onClick={(e) => {
              e.stopPropagation();
              props.onOpenLifecycle?.(props.row);
            }}
          />
        )}
      </GridActionsCell>
      {
        view &&
        <ApplicationPreview
          open={view}
          handleClose={closePreview}
          applicantData={props.row}
        />
      }
    </>
  );
}


export const Applications = () => {
  const { setPageTitle } = usePageData();
  const [searchParam] = useSearchParams();
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const [lifecycleApplicant, setLifecycleApplicant] = useState<Applicant | null>(null);
  const columnList = useApplicantTableColumnList(setLifecycleApplicant);
  const compactView = useMediaQuery("(max-width:599px)");
  const responsiveColumns = useMemo(
    () => columnList
      .filter((column) => !compactView || !["email", "experience", "applyDate", "status"].includes(column.field))
      .map((column) => {
        if (!compactView) return column;
        if (column.field === "name") return { ...column, minWidth: 140, flex: 1.25 };
        if (column.field === "vacancyName") return { ...column, minWidth: 112, flex: 0.9 };
        if (column.field === "applicationStatus") return { ...column, minWidth: 92, flex: 0.7 };
        if (column.field === "action") return { ...column, minWidth: 48, flex: 0.3 };
        return column;
      }),
    [columnList, compactView],
  );
  const navigate = useNavigate();
  const [paginationValues, setPaginationValues] = useState<PaginationModel>({ pageNo: 0, pageSize: 10, });
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [applicationsList, setApplicationsList] = useState<Applicant[]>([]);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const applicationFilters = useAppSelector((state) => state.filters.application);
  const open = Boolean(anchorEl);
  const id = open ? "application-filter" : undefined;
  const totalAppliedFilter = countAppliedFilter(applicationFilters);

  const userModulesPermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const jobId = searchParam.get("jobId");

  const userPermissionsForModule = useMemo(
    () => getModulePermissions(ModulesName.Applications, userModulesPermissions),
    [userModulesPermissions]
  );

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSearchChange = (value: string) => {
    if (paginationValues.pageNo > 0 && value.trim().length >= 0) {
      setPaginationValues({ ...paginationValues, pageNo: 0 });
    }
    setSearch(value.trim());
  };

  const rowClickHandler = (param: GridRowParams<Applicant>) => {
    navigate(`/recruitment/applicant/${param.row.applicantId}`);
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    setPaginationValues({
      pageNo: model.page,
      pageSize: model.pageSize
    })
  }

  useEffect(() => {
    setLoading(true);
    const payload = {
      ...(applicationFilters ? {
        ...applicationFilters,
        minExperience: applicationFilters.minExperience ? (applicationFilters.minExperience! * 12) : null,
        maxExperience: applicationFilters.maxExperience ? (applicationFilters.maxExperience! * 12) : null,
      } :
        { ...initialFilterValues }
      ),
      name: search,
      pageNo: paginationValues.pageNo + 1,
      pageSize: paginationValues.pageSize
    } satisfies ApplicationPayload;

    const getApplicantList = async () => {
      try {
        const { data } = await getAllApplicantList(payload);
        setApplicationsList(data.methodResults);
        setTotalRecords(data.totalRecords);
      } catch (error) {
        console.error(error instanceof Error ? error.message : error);
      } finally {
        setLoading(false);
      }
    }
    getApplicantList();
  }, [refresh, applicationFilters, search, paginationValues]);

  useEffect(() => {
    if (jobId) {
      dispatch(setApplicationFilter(applicationFilters ? {
        ...applicationFilters, vacancyIds: [jobId]
      } : { ...initialFilterValues, vacancyIds: [jobId] }))
    }
    setPageTitle(intl.formatMessage({ id: "PAGE.APPLICATIONS" }));
  }, [jobId]);


  const [activeQueueTab, setActiveQueueTab] = useState<"none" | "screening" | "offers" | "preboarding" | "onboarding" | "all">("none");

  const applicantLookup = useMemo(() => {
    const map: Record<string, { fullName: string; email?: string; vacancyName?: string }> = {};
    for (const row of applicationsList) {
      if (row.applicantId) {
        map[row.applicantId] = {
          fullName: `${row.firstName || ""} ${row.lastName || ""}`.trim(),
          email: row.email,
          vacancyName: row.vacancyName,
        };
      }
    }
    return map;
  }, [applicationsList]);

  const activeStageFilter =
    applicationFilters?.activityTypes && applicationFilters.activityTypes.length === 1
      ? applicationFilters.activityTypes[0]
      : null;

  const queueTabs: Array<{
    id: typeof activeQueueTab;
    label: string;
  }> = [
    { id: "none", label: "Applications Table Only" },
    { id: "screening", label: "Screening Queue" },
    { id: "offers", label: "Selected & Offers" },
    { id: "preboarding", label: "Preboarding Readiness" },
    { id: "onboarding", label: "Onboarding Queue" },
    { id: "all", label: "All Queues" },
  ];

  return (
    <>
      <Card
        className="d-flex flex-column flex-grow-1"
        sx={{
          gap: { xs: 1.75, md: 2.25 },
          p: { xs: 1.5, sm: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 12px 32px rgba(46, 38, 69, 0.08)",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <ResponsiveTableToolbar
          search={<Box
            sx={{
              minWidth: 0,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "action.hover",
                transition: "background-color .2s, box-shadow .2s",
                "&.Mui-focused": {
                  bgcolor: "background.paper",
                  boxShadow: "0 0 0 3px color-mix(in srgb, var(--mui-palette-primary-main) 16%, transparent)",
                },
              },
            }}
          >
            <SearchInput search={search} setSearch={handleSearchChange} />
          </Box>}
          actions={<Stack
            direction="row"
            spacing={1}
            sx={{
              "& button": {
                width: 40,
                height: 40,
                minWidth: 40,
                borderRadius: 1.75,
                bgcolor: "background.paper",
                border: "1px solid",
                borderColor: "color-mix(in srgb, var(--mui-palette-primary-main) 25%, transparent)",
                "&:hover": { bgcolor: "color-mix(in srgb, var(--mui-palette-primary-main) 10%, transparent)" },
              },
            }}
          >
            <Badge
              badgeContent={totalAppliedFilter}
              anchorOrigin={{ horizontal: "left", vertical: "top" }}
              color="primary"
            >
              <CustomIconButton
                icon={<FilterList />}
                ariaLabel="Filter Application"
                tooltip="Filter applications"
                handleClick={handleFilterClick}
                toolbar
              />
            </Badge>
            {userPermissionsForModule.includes(`${ModulesName.Applications}.${Permission.Create}`) && (
              <CustomIconButton
                icon={<Add />}
                ariaLabel="Add application"
                tooltip="Add application"
                handleClick={() => setAddModalOpen(true)}
                toolbar
              />
            )}
          </Stack>}
        />
        <RecruitmentPipelineSummaryCard
          vacancyId={jobId}
          activeStage={activeStageFilter}
          onStageSelect={(stage) => {
            setPaginationValues((current) => ({ ...current, pageNo: 0 }));
            dispatch(
              setApplicationFilter({
                ...initialFilterValues,
                ...(jobId ? { vacancyIds: [jobId] } : {}),
                activityTypes: activeStageFilter === stage ? [] : [stage],
              })
            );
          }}
          onClearStage={() => {
            setPaginationValues((current) => ({ ...current, pageNo: 0 }));
            dispatch(
              setApplicationFilter({
                ...initialFilterValues,
                ...(jobId ? { vacancyIds: [jobId] } : {}),
                activityTypes: [],
              })
            );
          }}
        />

        {/* Operational Queue Workspace Switcher */}
        <Stack
          direction="row"
          spacing={0.85}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: "action.hover",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {queueTabs.map((tab) => {
            const active = activeQueueTab === tab.id;
            return (
              <Box
                key={tab.id}
                role="button"
                tabIndex={0}
                onClick={() => setActiveQueueTab(tab.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setActiveQueueTab(tab.id);
                  }
                }}
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 1.5,
                  fontSize: "0.78rem",
                  fontWeight: active ? 800 : 600,
                  cursor: "pointer",
                  bgcolor: active ? "primary.main" : "background.paper",
                  color: active ? "primary.contrastText" : "text.primary",
                  border: "1px solid",
                  borderColor: active ? "primary.main" : "divider",
                  boxShadow: active ? "0 4px 12px rgba(32, 128, 125, 0.22)" : "none",
                  transition: "all 150ms ease",
                  "&:hover": {
                    borderColor: "primary.main",
                  },
                }}
              >
                {tab.label}
              </Box>
            );
          })}
        </Stack>

        {(activeQueueTab === "screening" || activeQueueTab === "all") && (
          <RecruitmentScreeningQueueCard
            vacancyId={jobId}
            onApplicantSelect={(applicantId) => navigate(`/recruitment/applicant/${applicantId}`)}
          />
        )}
        {(activeQueueTab === "offers" || activeQueueTab === "all") && (
          <RecruitmentSelectedOfferQueueCard
            vacancyId={jobId}
            onApplicantSelect={(applicantId) => navigate(`/recruitment/applicant/${applicantId}`)}
          />
        )}
        {(activeQueueTab === "preboarding" || activeQueueTab === "all") && (
          <RecruitmentPreboardingQueueCard
            applicantLookup={applicantLookup}
            onApplicantSelect={(applicantId) => navigate(`/recruitment/applicant/${applicantId}`)}
          />
        )}
        {(activeQueueTab === "onboarding" || activeQueueTab === "all") && (
          <RecruitmentOnboardingQueueCard
            applicantLookup={applicantLookup}
            onApplicantSelect={(applicantId) => navigate(`/recruitment/applicant/${applicantId}`)}
          />
        )}
        {open && (
          <ApplicationFilter
            open={open}
            id={id}
            anchorEl={anchorEl}
            handleClose={() => setAnchorEl(null)}
          />
        )}

        <Suspense fallback={null}>
          <CustomDataGrid
            keyName="applicantId"
            loading={loading}
            columns={responsiveColumns}
            row={applicationsList}
            rowClickHandler={rowClickHandler}
            rowCount={totalRecords}
            paginationModel={{ page: paginationValues.pageNo, pageSize: paginationValues.pageSize }}
            handlePaginationModelChange={handlePaginationModelChange}
            sx={{
              minHeight: { xs: 385, sm: 460 },
              "& .MuiDataGrid-columnHeaders": { bgcolor: "action.hover" },
              "& .MuiDataGrid-cell": { px: { xs: 1, sm: 1.5 } },
              "& .MuiDataGrid-columnHeader": { px: { xs: 1, sm: 1.5 } },
              "& .MuiDataGrid-footerContainer": { flexWrap: "wrap", minHeight: 52 },
              "& .MuiTablePagination-toolbar": { px: { xs: 0.5, sm: 1 }, flexWrap: "wrap", justifyContent: "flex-end" },
              "& .MuiTablePagination-spacer": { display: { xs: "none", sm: "block" } },
            }}
          />
        </Suspense>

      </Card>
      {isAddModalOpen && (
        <AddApplicant
          open={isAddModalOpen}
          setOpen={setAddModalOpen}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      )}
      {lifecycleApplicant && (
        <RecruitmentLifecycleDrawer
          open={Boolean(lifecycleApplicant)}
          applicant={lifecycleApplicant}
          onClose={() => setLifecycleApplicant(null)}
          onSaved={() => {
            setRefresh((prev) => !prev);
            setLifecycleApplicant(null);
          }}
        />
      )}
    </>
  );
};






