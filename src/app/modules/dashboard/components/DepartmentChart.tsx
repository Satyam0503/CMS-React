import { FC } from "react";
import { useIntl } from "react-intl";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/CustomCard";
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
      {departmentList.length === 0 ? (
        <Box component="div" className="flex-grow-1 align-content-center text-center ">
          <Typography variant="h5">{i({ id: "MESSAGE.NO_DEPARTMENTS" })}</Typography>
        </Box>
      ) : (
        <DonutChart loading={loading} series={chartSeries} centerLabel={departmentList.length} />
      )
      }
    </CustomCard >
  );
};
