import { Badge, Box, Card, Stack, Tooltip, useMediaQuery } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { Add, AssignmentOutlined, FilterList } from "@mui/icons-material";
import { SearchInput } from "../../../shared/components/SearchInput";
import { ResponsiveTableToolbar } from "../../../shared/components/ResponsiveTableToolbar";
import { AddApplicant } from "./components/AddApplicant";
import { CustomIconButton } from "../../../shared/components/C_IconButton";
import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { getAllApplicantList } from "../services";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ApplicationPreview } from "./components/ApplicationPreview";
import {
  ApplicationFilter,
  initialFilterValues,
} from "./components/ApplicationFilter";
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

const CustomDataGrid = lazy(() =>
  import("../../../shared/components/C_DataGrid").then((module) => ({
    default: module.CustomDataGrid,
  }))
) as typeof import("../../../shared/components/C_DataGrid")["CustomDataGrid"];

const useApplicantTableColumnList = (): GridColDef<Applicant>[] => {
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
      headerName: i({ id: "STATUS", }),
      description: i({ id: "STATUS", }),
      minWidth: 100,
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
      minWidth: 100,
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
      minWidth: 100,
      flex: 1,
      renderCell: (param) => {
        const experience = (param.row.experience / 12).toFixed(1);
        return (
          <FormattedMessage id={"PLURAL.YEAR"} values={{ years: experience }} />
        );
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
      resizable: false,
      sortable: false,
      flex: 1,
      filterable: false,
      display: "flex",
      renderCell: (param) => (<ActionsCell {...param} />)
    }
  ]
}

function ActionsCell(props: GridRenderCellParams) {
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
        {/* <GridActionsCellItem
          icon={<Delete />}
          label="Delete Application"
          showInMenu
        /> */}
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
  const columnList = useApplicantTableColumnList();
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


  return (
    <>
      <Card
        className="d-flex flex-column flex-grow-1"
        sx={{
          gap: { xs: 1.75, md: 2.5 },
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
        <RecruitmentScreeningQueueCard vacancyId={jobId} />
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
    </>
  );
};



