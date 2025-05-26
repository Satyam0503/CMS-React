import { FC, useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/CustomCard";
import { BarChart } from "../../../shared/components/BarChart";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { getAllDepartmentInfo } from '../dashboardservices';


export const DepartmentChart: FC = () => {
  const intl = useIntl();
  const [chartData, setChartData] = useState<{ labels: string[]; series: number[]; }>({ labels: [], series: [] });
  const [allDepCount, setAllDepCount] = useState<number>(0);

  useEffect(() => {
    const getAllDepartmentDetails = async () => {
      try {
        const response = await getAllDepartmentInfo();
        const { success, methodResults } = response.data;
        if (success) {
          var labels: string[] = [];
          var series: number[] = [];

          methodResults.forEach((data) => {
            labels.push(data.label || "null");
            series.push(data.employeeCount || 0);
          })

          setChartData({ labels, series });
          setAllDepCount(methodResults.length);
        }
      } catch (error) {
        console.log(error);
      }
    };
    getAllDepartmentDetails();
  }, [])

  return (
    <CustomCard
      label={intl.formatMessage({ id: "MENU.DEPT" })}
      value={allDepCount}
    >
      {!allDepCount ? (
        <Box
          component={"div"}
          sx={{ height: "100%", alignContent: "center", textAlign: "center" }}
        >
          <Typography variant="h5">No Employees</Typography>
        </Box>
      ) : (
        <BarChart
          labels={chartData.labels}
          series={chartData.series}
          legendOption={{ show: true }}
        />
      )}
    </CustomCard>
  );
};
