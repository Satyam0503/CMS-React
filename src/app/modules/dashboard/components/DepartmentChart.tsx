import { FC } from "react";
import { useIntl } from "react-intl";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/C_Card";
import { CardSkeleton } from "./CardSkeleton";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";
import { DepartmentResponseModel } from "../model";
import { DonutChart } from "../../../shared/components/DonutChart";
import { PieSeries } from "@mui/x-charts";
import { defaultPieChartSeries } from "../../../../utils/common";
import { useDepartmentsQuery } from "../dashboardQueries";


export const DepartmentChart: FC = () => {
  const { formatMessage: i } = useIntl();
  const { data, isPending: loading } = useDepartmentsQuery();
  const departmentList: DepartmentResponseModel[] = data?.success ? data.methodResults : [];
  const { currentLanguage } = useAppLang();
  const defaultLanguage = useAppSelector(
    (state) => state.user.userData?.defaultLanguage ?? ""
  );
  // A pie series where every department has 0 employees (e.g. a brand-new company whose
  // only employee has no department yet) renders as one indistinct full ring instead of
  // a real breakdown, so treat it the same as having no departments to chart.
  const hasAssignedEmployees = departmentList.some((dep) => dep.employeeCount > 0);

  const chartSeries = [
    {
      ...defaultPieChartSeries,
      data: departmentList.map((dep) => ({
        label: dep.label[currentLanguage] || dep.label[defaultLanguage] || i({ id: "TRANSLATION_MISSING" }),
        value: dep.employeeCount,
      })),
      valueFormatter: (v) => {
        return `${v.value} ${i({ id: "MODULES.EMPLOYEES" })}`;
      },
    }
  ] satisfies PieSeries[];

  if (loading) {
    return <CardSkeleton />
  }

  return (
    <CustomCard
      label={i({ id: "TITLES.DEPARTMENT" })}
      value={departmentList.length}
    >
      {!hasAssignedEmployees ? (
        <Box component="div" className="flex-grow-1 align-content-center text-center ">
          <Typography variant="h5">{i({ id: departmentList.length === 0 ? "MESSAGE.NO_DEPARTMENTS" : "MESSAGE.NO_DEPARTMENT_EMPLOYEES" })}</Typography>
        </Box>
      ) : (
        <DonutChart loading={loading} series={chartSeries} centerLabel={departmentList.length} />
      )
      }
    </CustomCard >
  );
};
