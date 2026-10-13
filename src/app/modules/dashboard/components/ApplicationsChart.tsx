import {
  useIntl } from "react-intl";
import { useEffect,
  useState } from "react";
import { AxiosError } from "axios";
import { Box,
  Card,
  MenuItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { applicationStatusMapper } from "../../../../utils/common";
import { CardSkeleton } from "./CardSkeleton";
import { ApplicationStatusModel } from "../model";
import { getAllApplicationStatus } from "../dashboardservices";
import { getAllJobVacancies } from "../../recruitment/services";
import { getVacancyPayload } from "../../recruitment/jobs/Jobs";
import { JobModal } from "../../recruitment/models";
import { BarChart } from "@mui/x-charts/BarChart";


import { AppSelect } from "../../../shared/components/ui";
export const ApplicationsChart = () => {
  const { formatMessage: i } = useIntl();
  const [applicationData, setApplicationData] = useState<ApplicationStatusModel | null>(null);
  const [vacancyList, setVacancyList] = useState<JobModal[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVacancy, setSelectedVacancy] = useState<string>("all");
  const theme = useTheme();

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


  if (loading) {
    return <CardSkeleton />
  }


  return (
    <Card
      className="dashboard-applications-card p-4 d-flex flex-column h-100"
    >
      <Stack direction="row" className="mb-4 justify-content-between flex-wrap">
        <Typography className="fw-bold fs-16">{i({ id: "TITLES.TOTAL_APPLICATIONS" })}</Typography>
        <AppSelect
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
        </AppSelect>
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
            series={[{
              data: applicationData.applicationStatusData.map(item => item.count),
              label: i({ id: "PAGE.APPLICATIONS" }),
              color: theme.palette.primary.main
            }]}
            hideLegend={true}
      xAxis={[
            {
              scaleType: "band",
              data: applicationData.applicationStatusData.map((item) => {
                let key = applicationStatusMapper[item.activityType];

                if (!key && item.activityType !== undefined && item.activityType !== null) {
                  key = `STATUS.${String(item.activityType)}`;
                }

                return i({
                  id: key || "STATUS.UNKNOWN",
                  defaultMessage: String(item.activityType ?? ""),
                });
              }),
              tickPlacement: "middle",
              tickLabelPlacement: "middle",
              categoryGapRatio: 0.3,
              barGapRatio: 0.5,
            },
          ]}


            slotProps={{
              legend: {
                direction: 'horizontal',
                position: { vertical: 'bottom', horizontal: 'center' },
              }
            }}
            borderRadius={4}
            margin={{ top: 5, bottom: 0, left: -25, right: 0 }}
            loading={loading}
          />
        )
      }
    </Card >
  );
};
