import { useIntl } from "react-intl";
import { CustomCard } from "../../components/CustomCard";
import { BarChart } from "../../components/BarChart";
import { useCallback, useEffect, useState } from "react";
import { Applicant } from "../../../../utils/common_types";
import { getAllApplicantList } from "../../recruitment/services";
import { AxiosError } from "axios";
import { applicationStatusMapper } from "../../../../utils/common";
import { Box, Typography } from "@mui/material";
import { initialFilterValues } from "../../recruitment/applications/ApplicationFilter";

export const ApplicationsChart = () => {
  const intl = useIntl();
  const [applicationList, setApplicationList] = useState<Applicant[]>([]);
  const [chartData, setChartData] = useState<{
    labels: string[];
    series: number[];
  }>({
    labels: [],
    series: [],
  });

  const getCountOfApplicationStatus = useCallback(() => {
    const applicationStatusCount = applicationList.reduce(
      (status: Record<string, number>, application) => {
        status[applicationStatusMapper[application.activityType]] =
          (status[applicationStatusMapper[application.activityType]] || 0) + 1;
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
        const response = await getAllApplicantList({...initialFilterValues,maxExperience:null, minExperience:null, name:""});
        const { success, methodResults } = response.data;
        if (success) {
          setApplicationList(methodResults);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
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

  return (
    <CustomCard
      label={intl.formatMessage({ id: "MENU.TOTAL_APP" })}
      value={applicationList.length}
    >
      {!applicationList.length ? (
        <Box
          component={"div"}
          sx={{ height: "100%", alignContent: "center", textAlign: "center" }}
        >
          <Typography variant="h5">No Applications</Typography>
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
