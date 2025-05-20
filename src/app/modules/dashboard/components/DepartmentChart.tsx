import { FC, useCallback, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/CustomCard";
import { BarChart } from "../../../shared/components/BarChart";
import { EmployeeModel } from "../../../../utils/common_types";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { getAllDepartmentInfo } from '../dashboardservices';

// interface PropsTypes {
//   employees: GetAllEmployeeResponseModel[];
// }

export const DepartmentChart: FC = () => {
  const intl = useIntl();
  const [chartData, setChartData] = useState<{
    labels: string[];
    series: number[];
  }>({ labels: [], series: [] });
  const [allDepCount, setAllDepCount] = useState<number>(0);


  // const getDepartmentsEmployeeCount = useCallback(() => {
  //   const departmentEmployeeCount = employees.reduce(
  //     (department: Record<string, number>, employee) => {
  //       department[employee.department] =
  //         (department[employee.department] || 0) + 1;
  //       return department;
  //     },
  //     {}
  //   );
  //   return {
  //     labels: Object.keys(departmentEmployeeCount),
  //     series: Object.values(departmentEmployeeCount),
  //   };
  // }, [employees]);

  // useEffect(() => {
  //   if (employees.length) {
  //     const { labels, series } = getDepartmentsEmployeeCount();
  //     setChartData({ labels, series });
  //   }
  // }, [employees, getDepartmentsEmployeeCount]);


    useEffect(()=>{
  
          const getAllDepartmentDetails = async () => {
            try {
              const response = await getAllDepartmentInfo();
              const { success, methodResults } = response.data;
              if (success) {
                console.log(methodResults)
                var labels: string[] = [];
                var series: number[] = [];

                // selecting current language from localStorage for pushing correct labels, else pushin 'en' label values.
                const current_lang: string | null = localStorage.getItem("i18nConfig") || "null";
                const lang = current_lang!="null" ? JSON.parse(current_lang).selectedLang : "en";

                methodResults.forEach((data)=>{
                  data.titles.forEach((title) => {
                    if(title.language == lang){
                      labels.push(title.label || "null");
                    }
                  })
                  
                  series.push(data.employeeCount || 0);
                })
                
                setChartData({labels, series});
                setAllDepCount(methodResults.length);
            }
            } catch (error) {
              console.log(error);
            }
          };
          getAllDepartmentDetails();  
    },[])

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
