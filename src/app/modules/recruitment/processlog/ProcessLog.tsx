import { Badge, Card, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { useCallback, useEffect, useState } from "react";
import {
  CommentResponseModel,
  ProcessLogFilterModel,
  ProcessLogPayoadModel,
} from "../models";
import { getProcessLogData } from "../services";
import { SearchInput } from "../../../shared/components/SearchInput";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { ModulesName } from "../../../../utils/enums";
import { ProcessLogTableColumnList } from "../../../../utils/constant/Constant";
import { Pagination } from "../../../shared/components/Pagination";
import { useAppSelector } from "../../../Redux/hooks";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { FilterList } from "@mui/icons-material";
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
      <Stack
        direction="row"
        className="align-items-center justify-content-between"
      >
        <SearchInput search={searchValue} setSearch={handleSearchChange} />
        <Badge
          badgeContent={totalAppliedFilters}
          anchorOrigin={{ horizontal: "left", vertical: "top" }}
          color="primary"
        >
          <CustomIconButton
            icon={<FilterList />}
            handleClick={handleFilterClick}
          />
        </Badge>
        {open && (
          <ProcessLogFilter
            open={open}
            handleClose={handleCloseFilter}
            anchorEl={anchorEl}
          />
        )}
      </Stack>

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
