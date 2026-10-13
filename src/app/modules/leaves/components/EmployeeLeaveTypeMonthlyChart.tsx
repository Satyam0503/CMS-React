import { Box, Card, Stack, Typography, useTheme } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { getMonthlyLeaveTakenSummary, getAllLeaveRequest, getMyProfileLeaveRequest } from "../leaveServices";
import { GetLeaveRequestPayLoad, MonthlyLeaveTakenSummary } from "../model";
import { LEAVE_REQUEST_STATUS } from "../../../../utils/enums";

type Props = {
  employeeId?: string | null;
  year?: number;
};

export const EmployeeLeaveTypeMonthlyChart = ({ employeeId, year }: Props) => {
  const { formatMessage: i } = useIntl();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState<any[]>([]);
  const [labels, setLabels] = useState<string[]>([]);
  const targetYear = year ?? new Date().getFullYear();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const start = dayjs(new Date(targetYear, 0, 1)).startOf("day").toISOString();
        const end = dayjs(new Date(targetYear, 11, 31)).endOf("day").toISOString();

        const payload: GetLeaveRequestPayLoad = {
          pageNo: 1,
          pageSize: 1000,
          startDate: start as any,
          endDate: end as any,
          status: LEAVE_REQUEST_STATUS.APPROVED,
          ...(employeeId ? { employeeId } : {}),
        } as GetLeaveRequestPayLoad;

        const res = employeeId
          ? await getAllLeaveRequest(payload)
          : await getMyProfileLeaveRequest(payload);

        const items = res.data.methodResults ?? [];

        // group by leavePolicyName then by month
        const map = new Map<string, number[]>();
        items.forEach((it: any) => {
          const policy = it.leavePolicyName ?? "Unknown";
          const m = new Date(it.startDate).getMonth();
          if (!map.has(policy)) map.set(policy, Array(12).fill(0));
          map.get(policy)![m] += 1;
        });

        const lbls = dayjs.monthsShort();
        setLabels(lbls);

        const seriesData = Array.from(map.entries()).map(([name, data]) => ({ label: name, data, color: undefined }));
        setSeries(seriesData);
      } catch (error) {
        console.error("EmployeeLeaveTypeMonthlyChart error:", error);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employeeId, year]);

  return (
    <Card sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0, p: 2 }}>
      <Stack className="mb-2 flex-row justify-content-between">
        <Typography className="fw-bold fs-16">{i({ id: "LEAVE.TITLES.EMPLOYEE_LEAVE_BREAKDOWN", defaultMessage: "Employee Leave Breakdown" })}</Typography>
        <Typography className="fw-bold fs-16">{targetYear}</Typography>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <BarChart
          series={series.map((item) => ({ ...item, stack: "policy" }))}
          xAxis={[{ scaleType: "band", data: labels }]}
          yAxis={[{ width: 50 }]}
          slotProps={{ legend: { direction: "horizontal", position: { vertical: "bottom", horizontal: "center" } } }}
          loading={loading}
          style={{ width: "100%", height: "320px", display: "block" }}
        />
      </Box>
    </Card>
  );
};

export default EmployeeLeaveTypeMonthlyChart;
