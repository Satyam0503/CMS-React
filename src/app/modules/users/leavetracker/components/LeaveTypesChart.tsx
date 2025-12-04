import { Grid, Card, Stack, Typography, Skeleton } from "@mui/material";
import { useCallback } from "react";
import { useIntl } from "react-intl";
import { EmployeeLeaveTypeBalance } from "../../../leaves/model";
import { CustomCard } from "../../../../shared/components/CustomCard";
import {
  defaultPieChartSeries,
} from "../../../../../utils/common";
import { toAbsoluteUrl } from "../../../../../_themes/helpers";
import { DonutChart } from "../../../../shared/components/DonutChart";
import { PieSeries, PieValueType } from "@mui/x-charts";
import { MakeOptional } from "@mui/x-date-pickers/internals";
import { useAppLang } from "../../../../../_themes/i18n/Metronici18n";

interface PropsType {
  leaveBalance: EmployeeLeaveTypeBalance[];
  isLoading: boolean;
}

export const EmployeeLeaveTypesCharts = ({
  leaveBalance,
  isLoading,
}: PropsType) => {
  const { formatMessage: i } = useIntl();
  const { currentLanguage } = useAppLang();
  const getLabelAndDataForLeaveType = useCallback(
    (leaveType: EmployeeLeaveTypeBalance) => {
      const chartData: MakeOptional<PieValueType, "id">[] = [
        {
          label: i({ id: "LEAVE.REMAINING" }),
          value: leaveType.balance,
        },
        {
          label: i({ id: "LEAVE.TAKEN" }),
          value: leaveType.usedBalance,
        },
      ];
      return chartData;
    },
    [currentLanguage]
  );

  if (isLoading) {
    return (
      <Card sx={{ minHeight: "280px" }} className="p-4 d-flex flex-column">
        <Stack spacing={1} className="flex-grow-1 ">
          <Skeleton variant="text" className="fs-20" />
        </Stack>
      </Card>
    );
  }

  if (leaveBalance.length === 0) {
    return (
      <Card className="py-6 d-flex flex-column align-items-center">
        <img
          className="mx-auto"
          src={toAbsoluteUrl("media/Icons/no_data_256.png")}
          style={{ maxWidth: 200 }}
        />
        <Typography variant="h6" className="fs-24">
          {i({ id: "ERROR.OPPS" })}
        </Typography>
        <Typography variant="h6">
          {i({ id: "MESSAGE.NO_LEAVE_DATA_AVAILABLE" })}
        </Typography>
      </Card>
    );
  }

  return (
    <Grid container spacing={2}>
      {leaveBalance.map((type) => {
        const series = [
          {
            ...defaultPieChartSeries,
            data: getLabelAndDataForLeaveType(type),
          },
        ] satisfies PieSeries[];
        return (
          <Grid
            key={type.leavePolicyId}
            size={{
              xs: 12,
              sm: 6,
              md: 4
            }}>
            <CustomCard label={type.name} applyMinHeight={false}>
              <DonutChart
                loading={isLoading}
                series={series}
                centerLabel={type.balance}
              />
            </CustomCard>
          </Grid>
        );
      })}
    </Grid>
  );
};
