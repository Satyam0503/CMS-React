import { useIntl } from "react-intl";

import { useCallback, useEffect, useState } from "react";

import { AxiosError } from "axios";

import { Box, Typography } from "@mui/material";
import { applicationStatusMapper } from "../../../../utils/common";
import { getAllApplicantList } from "../../recruitment/services";
import { initialFilterValues } from "../../recruitment/applications/components/ApplicationFilter";
import { CustomCard } from "../../../shared/components/CustomCard";
import { Applicant } from "../../recruitment/models";
import { BarChart } from "../../../shared/components/BarChart";
import { CardSkeleton } from "./CardSkeleton";
import { colors } from "../../theme/MuiTheme";


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
  const [loading,setLoading]= useState(true);

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
        const response = await getAllApplicantList({
          ...initialFilterValues,
          maxExperience: null,
          minExperience: null,
          name: "",
        });
        const { success, methodResults } = response.data;
        if (success) {
          setApplicationList(methodResults);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      }
      finally{
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

  if(loading){
    return <CardSkeleton/>
  }

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
          <Typography variant="h5" sx={{color:colors.alpha.neutral[400]}}>{intl.formatMessage({id:"DASHBOARD.APPLICATIONS.NO_APPLICATIONS"})}</Typography>
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
