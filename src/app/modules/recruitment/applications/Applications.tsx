import { Badge, Card, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Download, FilterList } from "@mui/icons-material";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { ApplicationTabTableColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../../shared/components/Pagination";
import { SearchInput } from "../../../shared/components/SearchInput";
import { AddApplicant } from "./components/AddApplicant";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getAllApplicantList } from "../services";
import { useNavigate } from "react-router-dom";
import { ApplicationPreview } from "./components/ApplicationPreview";
import {
  ApplicationFilter,
  initialFilterValues,
} from "./components/ApplicationFilter";
import { useAppSelector } from "../../../Redux/hooks";
import { Applicant } from "../models";
import { ModulesName, Permission } from "../../../../utils/enums";
import { getModulePermissions } from "../../../../utils/common";

const initialFilter = {
  ...initialFilterValues,
  minExperience: null,
  maxExperience: null,
  name: "",
};

export const Applications = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    records: 10,
  });
  const [search, setSearch] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [applicationsList, setApplicationsList] = useState<Applicant[]>([]);
  const [viewApplicant, setViewApplicant] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<
    Applicant | undefined
  >();
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const applicationFilters = useAppSelector(
    (state) => state.filters.application
  );
  const open = Boolean(anchorEl);
  const id = open ? "application-filter" : undefined;
  const isFilterAvailable = applicationFilters !== null;
  const countAppliedFilter = (filter: Record<string, any> | null) => {
    if (!filter || Object.keys(filter).length === 0) {
      return 0;
    } else {
      let count = 0;

      Object.keys(filter).forEach((element) => {
        if (filter[element] !== null) {
          if (Array.isArray(filter[element])) {
            count += Boolean(filter[element].length) ? 1 : 0;
          } else if (typeof filter[element] === "string") {
            count += Boolean(filter[element]) ? 1 : 0;
          } else if (typeof filter[element] === "number") {
            count += filter[element] >= 0 ? 1 : 0;
          }
        }
      });
      return count;
    }
  };
  const totalAppliedFilter = countAppliedFilter(applicationFilters);

  const userModulesPermissions =
    useAppSelector((state) => state.user.userData?.modulePermission) ?? [];

  const userPermissionsForModule = useMemo(
    () => getModulePermissions(ModulesName.Jobs, userModulesPermissions),
    [userModulesPermissions]
  );

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleApplicantEdit = (applicant: Applicant) => {
    if (applicant) {
      navigate(`/recruitment/applicant/${applicant.applicantId}`);
    }
  };

  const handleOpenPreview = (applicant: Applicant) => {
    setViewApplicant(true);
    setSelectedApplicant(applicant);
  };

  const closePreview = () => {
    setViewApplicant(false);
    setSelectedApplicant(undefined);
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
    const payload = {
      ...applicationFilters,
      name: search,
      minExperience:
        typeof applicationFilters?.minExperience === "string"
          ? null
          : applicationFilters?.minExperience! * 12,
      maxExperience:
        typeof applicationFilters?.maxExperience === "string"
          ? null
          : applicationFilters?.maxExperience! * 12,
    };

    const timeoutId = setTimeout(async () => {
      try {
        const { data } = await getAllApplicantList(
          isFilterAvailable ? payload : { ...initialFilter, name: search },
          paginationValues.pageNo + 1,
          paginationValues.records
        );
        setApplicationsList(data.methodResults.reverse());
        setTotalRecords(data.totalRecords);
      } catch (error) {
        console.error(
          "Error fetching data:",
          error instanceof Error ? error.message : error
        );
      } finally {
        setLoading(false);
      }
    }, 1000);
    return () => clearTimeout(timeoutId);
  }, [refresh, applicationFilters, search, paginationValues]);

  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "USER.APPLICATIONS" })}
      </Typography>
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
              <Badge
                badgeContent={totalAppliedFilter}
                anchorOrigin={{ horizontal: "left", vertical: "top" }}
                color="info"
              >
                <CustomIconButton
                  icon={<FilterList />}
                  tooltip="Filter Application"
                  ariaLabel="Filter Application"
                  handleClick={handleFilterClick}
                />
              </Badge>
              {userPermissionsForModule.includes(Permission.Create) && (
                <CustomIconButton
                  icon={<Add />}
                  handleClick={() => setAddModalOpen(true)}
                />
              )}

              <CustomIconButton
                icon={<Download />}
                tooltip="Import Excel"
                ariaLabel="import excel"
              />
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
          <Stack>
            <CustomisedTable
              tabName={ModulesName.Applications}
              keyName="applicantId"
              rows={applicationsList}
              columns={ApplicationTabTableColumnList}
              page={paginationValues.pageNo}
              rowsPerPage={paginationValues.records}
              handleEdit={handleApplicantEdit}
              openViewModal={handleOpenPreview}
              loading={loading}
            />
          </Stack>

          {totalRecords > 0 && (
            <Pagination
              page={paginationValues.pageNo}
              setPage={handlePageChange}
              rowsPerPage={paginationValues.records}
              setRowPerPage={handleRowPerPageChange}
              totalRecords={totalRecords}
            />
          )}
        </Stack>
      </Card>

      {isAddModalOpen && (
        <AddApplicant
          open={isAddModalOpen}
          setOpen={setAddModalOpen}
          refresh={refresh}
          setRefresh={setRefresh}
        />
      )}

      {viewApplicant && selectedApplicant && (
        <ApplicationPreview
          open={viewApplicant}
          handleClose={closePreview}
          applicantData={selectedApplicant}
        />
      )}
    </>
  );
};
