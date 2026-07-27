import { IntlShape, useIntl } from "react-intl";
import { FC, useMemo } from "react";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/C_Card";
import { CardSkeleton } from "./CardSkeleton";
import { GenderModel } from "../model";
import { defaultPieChartSeries, genderMapper } from "../../../../utils/common";
import { MakeOptional } from "@mui/x-date-pickers/internals";
import { PieSeries, PieValueType } from "@mui/x-charts";
import { DonutChart } from "../../../shared/components/DonutChart";
import { useGenderQuery } from "../dashboardQueries";


const createChartData = (data: GenderModel[], intl: IntlShape) => {
  const { formatMessage: i } = intl;
  const chartData: MakeOptional<PieValueType, "id">[] = [];

  data.forEach(item => {
    chartData.push({
      label: i({ id: genderMapper[item.gender] || "GENDER.OTHER" }),
      value: item.count,
    })
  });
  return chartData;
}
const countTotalEmployee = (empData: GenderModel[]) => {
  const totalEmployee = empData.reduce((pv, cv) => {
    return pv += cv.count;
  }, 0);
  return totalEmployee;
}

export const EmployeeChart: FC = () => {
  const intl = useIntl();
  const { formatMessage: i } = intl;
  const { data, isPending: loading } = useGenderQuery();
  const empData = useMemo(
    () => (data?.success ? data.methodResults : []),
    [data],
  );
  const totalEmployee = countTotalEmployee(empData);

  const series: PieSeries[] = useMemo(() => {
    return [
      {
        ...defaultPieChartSeries,
        data: empData.length > 0 ? createChartData(empData, intl) : [],
      }
    ];
  }, [empData, intl])


  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <>
      <CustomCard label={i({ id: "TITLES.TOTAL_EMP" })} value={totalEmployee} applyMinHeight={false}>
        {empData.length == 0 ? (
          <Box
            className="flex-grow-1 align-content-center text-center"
            component="div"
          >
            <Typography variant="h5">
              {i({ id: "MESSAGE.NO_EMPLOYEE" })}
            </Typography>
          </Box>
        ) : (
          <DonutChart loading={loading} series={series} />
        )}
      </CustomCard>
    </>
  );
};
