import { FC, useCallback, useEffect, useState } from "react";
import { EmployeeModel } from "../../../../../utils/common_types";
import { CustomCard } from "../../../components/CustomCard";
import { useIntl } from "react-intl";
import { Box, Typography } from "@mui/material";
import { BarChart } from "../../../components/BarChart";

interface PropsTypes {
  employees: EmployeeModel[];
}

export const DepartmentChart: FC<PropsTypes> = ({ employees }) => {
  const intl = useIntl();
  const [chartData, setChartData] = useState<{
    labels: string[];
    series: number[];
  }>({ labels: [], series: [] });

  const getDepartmentsEmployeeCount = useCallback(() => {
    const departmentEmployeeCount = employees.reduce(
      (department: Record<string, number>, employee) => {
        department[employee.department] =
          (department[employee.department] || 0) + 1;
        return department;
      },
      {}
    );
    return {
      labels: Object.keys(departmentEmployeeCount),
      series: Object.values(departmentEmployeeCount),
    };
  }, [employees]);

  useEffect(() => {
    if (employees.length) {
      const { labels, series } = getDepartmentsEmployeeCount();
      setChartData({ labels, series });
    }
  }, [employees, getDepartmentsEmployeeCount]);

  return (
    <CustomCard
      label={intl.formatMessage({ id: "MENU.DEPT" })}
      value={chartData.labels.length}
    >
      {!employees.length ? (
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
