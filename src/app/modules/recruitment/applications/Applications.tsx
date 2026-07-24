import { Badge, Box, Card, Stack, Tooltip } from "@mui/material";
import { FormattedMessage, useIntl } from "react-intl";
import { Add, AssignmentOutlined, FilterList } from "@mui/icons-material";
import { SearchInput } from "../../../shared/components/SearchInput";
import { AddApplicant } from "./components/AddApplicant";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
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

const CustomDataGrid = lazy(() =>
  import("../../../shared/components/CustomDataGrid").then((module) => ({
    default: module.CustomDataGrid,
  }))
) as typeof import("../../../shared/components/CustomDataGrid")["CustomDataGrid"];

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
          gap: { xs: 2.5, md: 3 },
          p: { xs: 2, sm: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          backgroundImage: "none",
          boxShadow: "0 12px 36px rgba(15,23,42,.06)",
        }}
      >
        <Stack
          direction={{ xs: "column", sm: "row" }}
          sx={{
            gap: 1.5,
            alignItems: { xs: "stretch", sm: "center" },
          }}
        >
          <Box
            sx={{
              flex: "1 1 auto",
              minWidth: 0,
              order: { xs: 2, sm: 1 },
              "& .MuiFormControl-root": { width: "100%" },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2.5,
                bgcolor: "action.hover",
                transition: "background-color .2s, box-shadow .2s",
                "&.Mui-focused": {
                  bgcolor: "background.paper",
                  boxShadow: "0 0 0 3px rgba(156,75,214,.12)",
                },
              },
            }}
          >
            <SearchInput search={search} setSearch={handleSearchChange} />
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{
              flexShrink: 0,
              order: { xs: 1, sm: 2 },
              justifyContent: { xs: "flex-end", sm: "initial" },
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
                handleClick={handleFilterClick}
              />
            </Badge>
            {userPermissionsForModule.includes(`${ModulesName.Applications}.${Permission.Create}`) && (
              <CustomIconButton
                icon={<Add />}
                handleClick={() => setAddModalOpen(true)}
              />
            )}
          </Stack>
          {open && (
            <ApplicationFilter
              open={open}
              id={id}
              anchorEl={anchorEl}
              handleClose={() => setAnchorEl(null)}
            />
          )}
        </Stack>

        <Suspense fallback={null}>
          <CustomDataGrid
            keyName="applicantId"
            loading={loading}
            columns={columnList}
            row={applicationsList}
            rowClickHandler={rowClickHandler}
            rowCount={totalRecords}
            paginationModel={{ page: paginationValues.pageNo, pageSize: paginationValues.pageSize }}
            handlePaginationModelChange={handlePaginationModelChange}
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

