import { useIntl } from "react-intl";
import { CustomCard } from "../../components/CustomCard";
import { useCallback, useEffect, useState } from "react";
import DonutApexChart from "../../components/DonutApexChart";
import { getAllEmployees } from "../../employees/components/employeeServices";
import { EmployeeModel } from "../../../../utils/common_types";
import { AxiosError } from "axios";

export const EmployeeChart = () => {
  const [employees, setEmployees] = useState<EmployeeModel[]>([]);
  const intl = useIntl();

  const getEmployeesGenderCount = useCallback(
    (employees: EmployeeModel[]) => {
      const empGenders: { [key: string]: number } = {};
      if (!employees.length) {
        return [];
      }
      employees.forEach((employee) => {
        if (employee.gender in empGenders) {
          empGenders[employee.gender] += 1;
        } else {
          empGenders[employee.gender] = 1;
        }
      });
      return empGenders;
    },
    [employees]
  );

  useEffect(() => {
    async function getEmployees() {
      try {
        const response = await getAllEmployees();
        const { success, methodResults } = response.data;
        if (success) {
          setEmployees(methodResults);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      }
    }
    getEmployees();
  }, []);

  const labels = Object.keys(getEmployeesGenderCount(employees));
  const series = Object.values(getEmployeesGenderCount(employees));

  return (
    <CustomCard
      label={intl.formatMessage({ id: "MENU.TOTAL_EMP" })}
      value={employees.length}
    >
      <DonutApexChart series={series} labels={labels} showDataLabels={true} />
    </CustomCard>
  );
};
