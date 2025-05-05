import { useIntl } from "react-intl";
import { FC, useCallback, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/CustomCard";
import DonutApexChart from "../../../shared/components/DonutApexChart";
import { CardSkeleton } from "./CardSkeleton";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { getAllGenderInfo } from '../dashboardservices';

// interface PropsType {
//   employees: GetAllEmployeeResponseModel[];
// }

export const EmployeeChart: FC = () => {
  const intl = useIntl();
  const [chartData, setChartData] = useState<{
    labels: string[];
    series: number[];
  }>({
    labels: [],
    series: [],
  });
  const [loading, setLoading] = useState(true);
  const [allEmpCount, setAllEmpCount] = useState<number>(0);

/*  const getEmployeesGenderCount = useCallback(() => {
    const genderCount = employees.reduce(
      (acc: { [key: string]: number }, employee) => {
        acc[employee.gender] = (acc[employee.gender] || 0) + 1;
        return acc;
      },
      {}
    );
    return {
      labels: Object.keys(genderCount),
      series: Object.values(genderCount),
    };
  }, [employees]);
*/


/*
  useEffect(() => {
    if (employees.length) {
      const { labels, series } = getEmployeesGenderCount();
      setChartData({ labels, series });
      setLoading(false);
    }
  }, [employees, getEmployeesGenderCount]);

  if (loading) {
    return <CardSkeleton />;
  }
  */

  useEffect(()=>{

        const getAllGenderDetails = async () => {
          try {
            const response = await getAllGenderInfo();
            const { success, methodResults } = response.data;
           if (success) {
              var labels: string[] = [];
              var series: number[] = [];
              methodResults.forEach((data)=>{
                labels.push(data.gender || "null");
                series.push(data.count || 0);
              })
              setChartData({labels, series});
              setAllEmpCount(series.reduce((acc,value)=>{ return acc+value},0));
          }
          } catch (error) {
            console.log(error);
          }
        };
    getAllGenderDetails();

  },[])

  return (
    <>
    <CustomCard
      label={intl.formatMessage({ id: "MENU.TOTAL_EMP" })}
      value={allEmpCount}
    >
      {!allEmpCount ? (
        <Box
          component={"div"}
          sx={{ height: "100%", alignContent: "center", textAlign: "center" }}
        >
          <Typography variant="h5">
            {intl.formatMessage({ id: "DASHBOARD.EMPLOYEE.NOEMPLOYEE" })}
          </Typography>
        </Box>
      ) : (
        <DonutApexChart series={chartData.series} labels={chartData.labels} />
      )}
    </CustomCard>
    </>
  );
};
