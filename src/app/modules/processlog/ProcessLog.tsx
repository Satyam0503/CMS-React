import { Card, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomIconButton } from "../../shared/components/CustomIconButton";
import {
  Add,
  Download,
  FilterList,
  ListAltOutlined,
} from "@mui/icons-material";
import CustomisedButton from "../../shared/components/CustomisedButton";
import React from "react";
import { SearchInput } from "../../shared/components/SearchInput";
import { CustomisedTable } from "../../shared/components/CustomisedTable";
import { ProgressLogModel } from "../../../utils/common_types";
import { ProcessLogTableColumnList } from "../../../utils/constant/Constant";

const ProcessLogs = () => {
  const intl = useIntl();
  const [searchValue, setSearchValue] = React.useState("");
  const [page, setPage] = React.useState(0);
  const [rowPerPage, setRowPerPage] = React.useState<number>(10);
  const [isLoading, setLoading] = React.useState(false);
  const [ProgressLogList, setProgressLogList] = React.useState<
    ProgressLogModel[]
  >([]);
  const handleSearchChange = React.useCallback((value: string) => {
    setSearchValue(value);
  }, []);
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.PROCESS_LOG" })}
      </Typography>
      <Card sx={{ p: "2rem" }}>
        <Stack direction="row">
          <SearchInput search={searchValue} setSearch={handleSearchChange} />
        </Stack>
        <Stack sx={{ mt: "1rem" }}>
          <CustomisedTable
            tabName="Process Log"
            columns={ProcessLogTableColumnList}
            rows={ProgressLogList}
            page={page}
            rowsPerPage={rowPerPage}
            loading={isLoading}
          />
        </Stack>
      </Card>
    </>
  );
};

export default ProcessLogs;
