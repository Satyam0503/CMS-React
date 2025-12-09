import { PieSeries } from "@mui/x-charts/PieChart";
import { useEffect, useMemo, useState } from "react";
import { LeaveRequestSummary } from "../model";
import { getLeaveRequestSummary } from "../leaveServices";
import { IntlShape, useIntl } from "react-intl";
import { MakeOptional } from "@mui/x-date-pickers/internals";
import { PieValueType } from "@mui/x-charts";
import {
  defaultPieChartSeries,
  leaveRequestStatusMapper,
} from "../../../../utils/common";
import { DonutChart } from "../../../shared/components/DonutChart";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { Card, Stack, Typography } from "@mui/material";

type CreateChartDataType = (
  data: LeaveRequestSummary,
  view: "type" | "statusValues",
  intl: IntlShape
) => MakeOptional<PieValueType, "id">[];

const createChartData: CreateChartDataType = (data, view, intl) => {
  const { formatMessage: i } = intl;
  const chartData: MakeOptional<PieValueType, "id">[] = [];
  if (view === "statusValues") {
    for (const key in data.leaveStatusSummary) {
      // if (!Object.hasOwnProperty(data.leaveStatusSummary, key)) continue;
      chartData.push({
        label: i({ id: leaveRequestStatusMapper[key] }),
        value: data.leaveStatusSummary[key],
      });
    }
  }
  return chartData;
};

export const LeaveRequestSummaryChart = () => {
  const intl = useIntl();
  const { formatMessage: i } = intl;
  const [loading, setLoading] = useState(true);
  const [leaveRequestSummary, setLeaveRequestSummary] =
    useState<LeaveRequestSummary>();
  const { currentLanguage } = useAppLang();
  const series: PieSeries[] = useMemo(() => {
    return [
      {
        ...defaultPieChartSeries,
        data: leaveRequestSummary
          ? createChartData(leaveRequestSummary!, "statusValues", intl)
          : [],
      },
    ];
  }, [leaveRequestSummary, currentLanguage]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getLeaveRequestSummary();
        if (data.success) {
          // console.log(data.methodResult);
          setLeaveRequestSummary(data.methodResult);
        }
      } catch (error) {
        console.error((error as Error).message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  return (
    <Card
      sx={{
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        p: 2,
      }}
    >
      <Stack className="mb-2 gap-2 flex-row align-items-center">
        <Typography className="fw-bold fs-16">
          {i({ id: "LEAVE.TITLES.LEAVE_REQUESTS" })}
        </Typography>

        <Typography variant="body2">
          ({i({ id: "LEAVE.LAST_30_DAYS" })})
        </Typography>
      </Stack>
      <DonutChart
        loading={loading}
        series={series}
        centerLabel={leaveRequestSummary?.totalRequests}
      />
    </Card>
  );
};
