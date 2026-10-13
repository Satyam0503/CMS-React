import { Badge, Card } from "@mui/material";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import {
  CommentResponseModel,
  ProcessLogFilterModel,
  ProcessLogPayoadModel,
} from "../models";
import { exportRecruitmentAudit, getProcessLogData } from "../services";
import { SearchInput } from "../../../shared/components/SearchInput";
import { ResponsiveTableToolbar } from "../../../shared/components/ResponsiveTableToolbar";
import { CustomisedTable } from "../../../shared/components/C_Table";
import { ModulesName } from "../../../../utils/enums";
import { ProcessLogTableColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../../shared/components/Pagination";
import { useAppSelector } from "../../../Redux/hooks";
import { CustomIconButton } from "../../../shared/components/C_IconButton";
import { Download, FilterList } from "@mui/icons-material";
import { ProcessLogFilter } from "./components/ProcessLogFilter";
import { countAppliedFilter } from "../../../../utils/common";
import { usePageData } from "../../../Context/PageDataProvider";

export const processLogInitialFilter: ProcessLogFilterModel = {
  jobRole: "",
  activityCategory: [],
  filterFrom: null,
  filterTo: null,
};

const ProcessLogs = () => {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  const [searchValue, setSearchValue] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [processLogList, setProcessLogList] = useState<CommentResponseModel[]>(
    []
  );
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    pageSize: 10,
  });
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const open = Boolean(anchorEl);

  const processLogFilters =
    useAppSelector((state) => state.filters.processLog) ??
    processLogInitialFilter;

  const totalAppliedFilters = countAppliedFilter(processLogFilters);

  const handleSearchChange = (value: string) => {
    if (paginationValues.pageNo > 0 && value.trim().length >= 0) {
      setPaginationValues({ ...paginationValues, pageNo: 0 });
    }
    setSearchValue(value.trim());
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
      pageSize: rowPerPage,
      pageNo: 0,
    });
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseFilter = () => {
    setAnchorEl(null);
  };

  const handleExport = async () => {
    const response = await exportRecruitmentAudit({
      fromUtc: processLogFilters.filterFrom ? new Date(processLogFilters.filterFrom as string).toISOString() : undefined,
      toUtc: processLogFilters.filterTo ? new Date(processLogFilters.filterTo as string).toISOString() : undefined,
      limit: 10000,
    });
    const url = window.URL.createObjectURL(response.data);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "recruitment-audit.csv";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.PROCESS_LOG" }));
  }, [])

  useEffect(() => {
    const payload: ProcessLogPayoadModel = {
      ...processLogFilters,
      pageNo: paginationValues.pageNo + 1,
      pageSize: paginationValues.pageSize,
      applicantName: searchValue,
    };
    setLoading(true);
    getProcessLogData(payload)
      .then((res) => {
        const { success, methodResults, totalRecords } = res.data;
        if (success) {
          setProcessLogList(methodResults);
          setTotalRecords(totalRecords);
        }
      })
      .catch((err) => {
        console.log("Error:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchValue, paginationValues, processLogFilters]);

  return (
    <Card className="d-flex flex-column flex-grow-1 gap-4 p-4 p-md-6">
      <ResponsiveTableToolbar
        search={<SearchInput search={searchValue} setSearch={handleSearchChange} />}
        actions={<>
          <CustomIconButton
            icon={<Download />}
            ariaLabel="Export recruitment audit"
            tooltip="Export recruitment audit"
            handleClick={() => void handleExport()}
            toolbar
          />
          <Badge
          badgeContent={totalAppliedFilters}
          anchorOrigin={{ horizontal: "left", vertical: "top" }}
          color="primary"
        >
          <CustomIconButton
            icon={<FilterList />}
            handleClick={handleFilterClick}
            toolbar
          />
        </Badge>
        </>}
      />
      {open && (
        <ProcessLogFilter
          open={open}
          handleClose={handleCloseFilter}
          anchorEl={anchorEl}
        />
      )}

      <CustomisedTable
        tabName={ModulesName.ProcessLog}
        keyName="id"
        columns={ProcessLogTableColumnList}
        rows={processLogList}
        page={paginationValues.pageNo}
        rowsPerPage={paginationValues.pageSize}
        loading={isLoading}
      />

      {totalRecords > 0 && (
        <Pagination
          page={paginationValues.pageNo}
          rowsPerPage={paginationValues.pageSize}
          setPage={handlePageChange}
          setRowPerPage={handleRowPerPageChange}
          totalRecords={totalRecords}
        />
      )}
    </Card>
  );
};

export default ProcessLogs;

