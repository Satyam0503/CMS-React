import { Card, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { useCallback, useEffect, useState } from "react";
import { ProcessLogModel } from "../models";
import { getProcessLogData } from "../services";
import { SearchInput } from "../../../shared/components/SearchInput";
import { CustomisedTable } from "../../../shared/components/CustomisedTable";
import { ModulesName } from "../../../../utils/enums";
import { ProcessLogTableColumnList } from "../../../../utils/constant/Constant";


const ProcessLogs = () => {
  const intl = useIntl();
  const [searchValue, setSearchValue] = useState("");
  const [totalRecords, setTotalRecords] = useState(0);
  const [isLoading, setLoading] = useState(true);
  const [processLogList, setProcessLogList] = useState<ProcessLogModel[]>([]);
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    records: 10,
  });

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  useEffect(() => {
    setLoading(true);
    getProcessLogData()
      .then((res) => {
        const { success, methodResults, totalRecords } = res.data;
        if (success) {
          setProcessLogList([...methodResults].reverse());
          setTotalRecords(totalRecords);
        }
      })
      .catch((err) => {
        console.log("Error:", err.message);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [searchValue]);
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "PAGE.PROCESS_LOG" })}
      </Typography>
      <Card sx={{ p: "2rem" }}>
        <Stack direction="row">
          <SearchInput search={searchValue} setSearch={handleSearchChange} />
        </Stack>
        <Stack sx={{ mt: "1rem" }}>
          <CustomisedTable
            tabName={ModulesName.ProcessLog}
            keyName="processId"
            columns={ProcessLogTableColumnList}
            rows={processLogList}
            page={paginationValues.pageNo}
            rowsPerPage={paginationValues.records}
            loading={isLoading}
          />
        </Stack>
      </Card>
    </>
  );
};

export default ProcessLogs;
