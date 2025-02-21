import { useIntl } from "react-intl";
import { CustomCard } from "../../components/CustomCard";
import { FC, memo, useCallback, useEffect, useState } from "react";
import DonutApexChart from "../../components/DonutApexChart";
import { EmployeeModel } from "../../../../utils/common_types";
import { Box, Typography } from "@mui/material";

interface PropsType {
  employees: EmployeeModel[];
}

export const EmployeeChart: FC<PropsType> = memo(({ employees }) => {
  const intl = useIntl();
  const [chartData, setChartData] = useState<{
    labels: string[];
    series: number[];
  }>({
    labels: [],
    series: [],
  });

  const getEmployeesGenderCount = useCallback(() => {
    const genderCount = employees.reduce(
      (acc: { [key: string]: number }, employee) => {
        acc[employee.gender] = (acc[employee.gender] || 0) + 1;
        return acc;
      },
      {}
    );
    return {
      labels:Object.keys(genderCount),
      series:Object.values(genderCount),
    };
  }, [employees]);

  useEffect(()=>{
    if(employees.length){ 
      const {labels,series} = getEmployeesGenderCount();
      setChartData({labels,series});
    }
  },[employees,getEmployeesGenderCount])  
  
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
          <Typography variant="h5">No Employees</Typography>
        </Box>
      ) : (
        <DonutApexChart series={chartData.series} labels={chartData.labels} />
      )}
    </CustomCard>
  );
});
