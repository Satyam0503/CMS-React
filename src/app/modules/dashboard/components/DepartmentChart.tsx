import { FC, useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/CustomCard";
import { BarChart } from "../../../shared/components/BarChart";
import { getAllDepartmentInfo } from '../dashboardservices';
import { CardSkeleton } from "./CardSkeleton";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { useAppSelector } from "../../../Redux/hooks";
import { DepartmentResponseModel } from "../model";


export const DepartmentChart: FC = () => {
  const { formatMessage: i } = useIntl();
  const [chartData, setChartData] = useState<{ labels: string[]; series: number[]; }>({ labels: [], series: [] });
  const [departmentList, setDepartmentList] = useState<DepartmentResponseModel[]>([]);
  const [loading, setLoading] = useState(true);
  const { currentLanguage } = useAppLang();
  const defaultLanguage = useAppSelector(state => state.user.userData?.defaultLanguage!);

  useEffect(() => {
    const getAllDepartmentDetails = async () => {
      try {
        const response = await getAllDepartmentInfo();
        const { success, methodResults } = response.data;
        if (success) {
          setDepartmentList(methodResults);
        }
      } catch (error) {
        console.log(error);
      }
      finally {
        setLoading(false);
      }
    };
    getAllDepartmentDetails();
  }, [])
  
  useEffect(() => {
    if (departmentList.length > 0) {
      setChartData(getDepartmentChartData())
    }
  }, [departmentList, currentLanguage]);

  const getDepartmentChartData = () => {
    if (departmentList.length === 0) {
      return chartData;
    } else {
      const labels: string[] = [];
      const series: number[] = [];
      departmentList.forEach(dep => {
        labels.push(dep.label[currentLanguage] || dep.label[defaultLanguage] || i({ id: "TRANSLATION_MISSING" }));
        series.push(dep.employeeCount);
      });
      return { labels, series };
    }
  }

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
        <BarChart
          labels={chartData.labels}
          series={chartData.series}
          legendOption={{ show: true }}
        />
      )
      }
    </CustomCard >
  );
};
