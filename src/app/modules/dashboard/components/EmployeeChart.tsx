import { useIntl } from "react-intl";
import { FC, useCallback, useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import { CustomCard } from "../../../shared/components/CustomCard";
import DonutApexChart from "../../../shared/components/DonutApexChart";
import { CardSkeleton } from "./CardSkeleton";
import { getAllGenderInfo } from "../dashboardservices";
import { GenderModel } from "../model";
import { genderMapper } from "../../../../utils/common";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";

export const EmployeeChart: FC = () => {
  const { formatMessage: i } = useIntl();
  const [empData, setEmpData] = useState<GenderModel[]>([]);
  const [chartData, setChartData] = useState<{
    labels: string[];
    series: number[];
  }>({
    labels: [],
    series: [],
  });
  const [loading, setLoading] = useState(true);
  const [totalEmployee, setTotalEmployee] = useState(0);
  const { currentLanguage } = useAppLang();

  const generateChartData = useCallback(() => {
    let totalEmployee = 0;
    if (empData.length === 0) {
      return {...chartData,totalEmployee};
    } else {
      const labels: string[] = [];
      const series: number[] = [];
      empData.forEach((item) => {
        labels.push(i({ id: genderMapper[item.gender] || "GENDER.OTHER"}));
        series.push(item.count);
        totalEmployee +=item.count;
      });
      return { labels, series, totalEmployee };
    }
  }, [empData, currentLanguage]);

  useEffect(() => {
    const getAllGenderDetails = async () => {
      try {
        const { data } = await getAllGenderInfo();
        if (data.success) {
          setEmpData(data.methodResults);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    getAllGenderDetails();
  }, []);

  useEffect(() => {
    if (empData.length > 0) {
      const { labels, series,totalEmployee } = generateChartData();
      setChartData({ labels, series });
      setTotalEmployee(totalEmployee);
    }
  }, [empData, currentLanguage]);

  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <>
      <CustomCard label={i({ id: "TITLES.TOTAL_EMP" })} value={totalEmployee}>
        {chartData.labels.length == 0 ? (
          <Box
            className="flex-grow-1 align-content-center text-center"
            component="div"
          >
            <Typography variant="h5">
              {i({ id: "MESSAGE.NO_EMPLOYEE" })}
            </Typography>
          </Box>
        ) : (
          <DonutApexChart series={chartData.series} labels={chartData.labels} />
        )}
      </CustomCard>
    </>
  );
};
