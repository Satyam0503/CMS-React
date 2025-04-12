import { useIntl } from "react-intl";
import { FC, useCallback, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/CustomCard";
import DonutApexChart from "../../../shared/components/DonutApexChart";
import { CardSkeleton } from "./CardSkeleton";
import { GetAllEmployeeResponseModel } from "../../employees/models";

interface PropsType {
  employees: GetAllEmployeeResponseModel[];
}

export const EmployeeChart: FC<PropsType> = ({ employees }) => {
  const intl = useIntl();
  const [chartData, setChartData] = useState<{
    labels: string[];
    series: number[];
  }>({
    labels: [],
    series: [],
  });
  const [loading, setLoading] = useState(true);

  const getEmployeesGenderCount = useCallback(() => {
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

  return (
    <CustomCard
      label={intl.formatMessage({ id: "MENU.TOTAL_EMP" })}
      value={employees.length}
    >
      {!employees.length ? (
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
  );
};
