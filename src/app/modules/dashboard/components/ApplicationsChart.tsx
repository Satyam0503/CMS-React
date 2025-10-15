import { useIntl } from "react-intl";
import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Box, Card, MenuItem, Select, Stack, Typography } from "@mui/material";
import { applicationStatusMapper } from "../../../../utils/common";
import { CustomCard } from "../../../shared/components/CustomCard";
import { BarChart } from "../../../shared/components/BarChart";
import { CardSkeleton } from "./CardSkeleton";
import { ApplicationStatusModel } from "../model";
import { getAllApplicationStatus } from "../dashboardservices";
import { getAllJobVacancies } from "../../recruitment/services";
import { getVacancyPayload } from "../../recruitment/jobs/Jobs";
import { JobModal } from "../../recruitment/models";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";


export const ApplicationsChart = () => {
  const { formatMessage: i } = useIntl();
  const [applicationData, setApplicationData] = useState<ApplicationStatusModel | null>(null);
  const [chartData, setChartData] = useState<{
    labels: string[];
    series: number[];
  }>({
    labels: [],
    series: [],
  });
  const [vacancyList, setVacancyList] = useState<JobModal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState<string>("all");
  const { currentLanguage } = useAppLang();

  const getCountOfApplicationStatus = useCallback(() => {
    if (applicationData === null) {
      return chartData;
    }
    const applicationStatusCount = applicationData.applicationStatusData.reduce(
      (status: Record<string, number>, application) => {
        status[i({ id: applicationStatusMapper[application.activityType] })] = application.count;
        return status;
      },
      {}
    );
    return {
      labels: Object.keys(applicationStatusCount),
      series: Object.values(applicationStatusCount),
    };
  }, [applicationData, currentLanguage]);

  useEffect(() => {
    async function getActiveJobs() {
      try {
        const response = await getAllJobVacancies(getVacancyPayload);
        const { success, methodResults } = response.data;
        if (success) {
          setVacancyList(methodResults);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      }
    }
    getActiveJobs();
  }, []);

  useEffect(() => {
    setLoading(true)
    async function getAllApplicationsData() {
      try {
        const { data } = await getAllApplicationStatus(selectedVacancy === "all" ? undefined : selectedVacancy);
        setApplicationData(data.methodResult);
      } catch (error) {
        console.error((error as AxiosError).message);
      }
      finally {
        setLoading(false);
      }
    }
    getAllApplicationsData();
  }, [selectedVacancy]);

  useEffect(() => {
    if (applicationData && applicationData.totalApplications !== 0) {
      const { labels, series } = getCountOfApplicationStatus();
      setChartData({ labels, series });
    }
  }, [applicationData, currentLanguage]);

  if (loading) {
    return <CardSkeleton />
  }


  return (
    <Card
      sx={{ minHeight: "310px" }}
      className="p-4 d-flex flex-column"
    >
      <Stack direction="row" className="mb-4 justify-content-between flex-wrap">
        <Typography variant="h4" sx={{ fontSize: 16 }}>{i({ id: "TITLES.TOTAL_APPLICATIONS" })}</Typography>
        <Select
          id="vacancy-dropdown"
          value={selectedVacancy}
          variant="standard"
          size="small"
          MenuProps={{
            slotProps: {
              paper: {
                sx: {
                  pr: 1,
                  maxHeight: 200
                }
              }
            }
          }}
          onChange={(e) => {
            setSelectedVacancy(e.target.value as string)
          }}
          sx={{
            "& .MuiInput-input": {
              padding: 0
            }
          }}
        >
          <MenuItem value="all">{i({ id: "NOTIFICATION.ALL" })}</MenuItem>
          {vacancyList.map(item => (
            <MenuItem key={item.jobId} value={item.jobId}>{item.title}</MenuItem>
          ))}
        </Select>
      </Stack>
      {
        applicationData === null || applicationData?.totalApplications === 0 ? (
          <Box
            component="div"
            className="h-100 flex-grow-1 align-content-center text-center"
          >
            <Typography variant="h5">{i({ id: "MESSAGE.NO_APPLICATIONS" })}</Typography>
          </Box>
        ) : (
          <BarChart
            labels={chartData.labels}
            series={chartData.series}
            legendOption={{ show: true }}
          />
        )
      }
    </Card >
  );
};
