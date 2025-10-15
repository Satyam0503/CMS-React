import { IntlShape, useIntl } from "react-intl";
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/CustomCard";
import { CardSkeleton } from "./CardSkeleton";
import { getAllGenderInfo } from "../dashboardservices";
import { GenderModel } from "../model";
import { genderMapper } from "../../../../utils/common";
import { PieChart } from "@mui/x-charts/PieChart";
import { MakeOptional } from "@mui/x-date-pickers/internals";
import { PieSeries, PieValueType } from "@mui/x-charts";


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
  let totalEmployee = empData.reduce((pv, cv) => {
    return pv += cv.count;
  }, 0);
  return totalEmployee;
}

export const EmployeeChart: FC = () => {
  const intl = useIntl();
  const { formatMessage: i } = intl;
  const [empData, setEmpData] = useState<GenderModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmployee, setTotalEmployee] = useState(0);

  const series: PieSeries[] = useMemo(() => {
    return [
      {
        innerRadius: '60%',
        outerRadius: '100%',
        paddingAngle: 2,
        startAngle: -90,
        highlightScope: { fade: 'global', highlight: 'item' },
        highlighted: { additionalRadius: 2 },
        cornerRadius: 4,
        data: empData.length > 0 ? createChartData(empData, intl) : [],
      }
    ];
  }, [empData])


  useEffect(() => {
    const getAllGenderDetails = async () => {
      try {
        const { data } = await getAllGenderInfo();
        if (data.success) {
          setEmpData(data.methodResults);
          setTotalEmployee(countTotalEmployee(data.methodResults));
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getAllGenderDetails();
  }, []);

  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <>
      <CustomCard label={i({ id: "TITLES.TOTAL_EMP" })} value={totalEmployee}>
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
          <PieChart
            series={series}
            loading={loading}
            hideLegend={false}
            height={200}
            slotProps={{
              legend: {
                direction: 'horizontal',
                position: {
                  vertical: 'bottom',
                  horizontal: 'center'
                },
                sx: {
                  gap: '10px',
                  marginTop: 2,
                  ['.MuiChartsLegend-series']: {
                    gap: '5px',
                  },
                },
              }
            }}
          />
        )}
      </CustomCard>
    </>
  );
};
