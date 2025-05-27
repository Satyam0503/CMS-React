import { useIntl } from "react-intl";
import { useCallback, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Box, Typography } from "@mui/material";
import { applicationStatusMapper } from "../../../../utils/common";
import { getAllApplicantList } from "../../recruitment/services";
import { CustomCard } from "../../../shared/components/CustomCard";
import { Applicant } from "../../recruitment/models";
import { BarChart } from "../../../shared/components/BarChart";
import { CardSkeleton } from "./CardSkeleton";


export const ApplicationsChart = () => {
  const { formatMessage } = useIntl();
  const [applicationList, setApplicationList] = useState<Applicant[]>([]);
  const [chartData, setChartData] = useState<{
    labels: string[];
    series: number[];
  }>({
    labels: [],
    series: [],
  });
  const [loading, setLoading] = useState(true);

  const getCountOfApplicationStatus = useCallback(() => {
    const applicationStatusCount = applicationList.reduce(
      (status: Record<string, number>, application) => {
        status[formatMessage({ id: applicationStatusMapper[application.activityType] })] =
          (status[formatMessage({ id: applicationStatusMapper[application.activityType] })] || 0) + 1;
        return status;
      },
      {}
    );
    return {
      labels: Object.keys(applicationStatusCount),
      series: Object.values(applicationStatusCount),
    };
  }, [applicationList]);

  useEffect(() => {
    async function getAllApplications() {
      try {
        const response = await getAllApplicantList(null);
        const { success, methodResults } = response.data;
        if (success) {
          setApplicationList(methodResults);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      }
      finally {
        setLoading(false);
      }
    }
    getAllApplications();
  }, []);

  useEffect(() => {
    if (applicationList.length) {
      const { labels, series } = getCountOfApplicationStatus();
      setChartData({ labels, series });
    }
  }, [applicationList, getCountOfApplicationStatus]);

  if (loading) {
    return <CardSkeleton />
  }

  return (
    <CustomCard
      label={formatMessage({ id: "MENU.TOTAL_APP" })}
      value={applicationList.length}
    >
      {!applicationList.length ? (
        <Box
          component={"div"}
          sx={{ height: "100%", alignContent: "center", textAlign: "center" }}
        >
          <Typography variant="h5">{formatMessage({ id: "DASHBOARD.APPLICATIONS.NO_APPLICATIONS" })}</Typography>
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
