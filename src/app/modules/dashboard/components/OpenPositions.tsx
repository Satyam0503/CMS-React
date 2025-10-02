import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { JobModal } from "../../recruitment/models";
import { getAllJobVacancies } from "../../recruitment/services";
import { CustomCard } from "../../../shared/components/CustomCard";
import { CardSkeleton } from "./CardSkeleton";
import { JobTypeMapper } from "../../../../utils/common";
import { getVacancyPayload } from "../../recruitment/jobs/Jobs";

export default function OpenPositions() {
  const [activeJobs, setActiveJobs] = useState<JobModal[]>([]);
  const [loading, setLoading] = useState(true);
  const { formatMessage: i } = useIntl();
  useEffect(() => {
    async function getActiveJobs() {
      try {
        const response = await getAllJobVacancies(getVacancyPayload);
        const { success, methodResults } = response.data;
        if (success) {
          setActiveJobs(methodResults);
        }
      } catch (error) {
        console.error((error as AxiosError).message);
      } finally {
        setLoading(false);
      }
    }
    getActiveJobs();
  }, []);
  if (loading) {
    return <CardSkeleton />;
  }

  return (
    <CustomCard
      label={i({ id: "TITLES.OPEN_JOB_ROLE" })}
      value={activeJobs.length}
    >
      <Stack
        sx={{
          flexGrow: 1,
          justifyContent: "space-between",
        }}
      >
        {!activeJobs.length ? (
          <Box
            component="div"
            className="h-100 flex-grow-1 align-content-center text-center"
          >
            <Typography variant="h5">
              {i({ id: "MESSAGE.NO_ACTIVE_VANCANCY" })}
            </Typography>
          </Box>
        ) : (
          <>
            <Stack spacing={1} sx={{ marginBlockEnd: 1 }}>
              {activeJobs.slice(0, 4).map((job) => (
                <Stack
                  key={job.jobId}
                  direction={"row"}
                  alignItems={"center"}
                  spacing={1}
                >
                  <Avatar variant="rounded" sx={{ bgcolor: "secondary.main" }}>{job.title.charAt(0)}</Avatar>

                  <Stack flexGrow={1}>
                    <Typography variant="body1">{job.title}</Typography>
                    <Typography
                      variant="body2"
                    >
                      {i({ id: JobTypeMapper[job.jobType] })}
                    </Typography>
                  </Stack>

                  <Typography variant="h6">{job.vacancies}</Typography>
                </Stack>
              ))}
            </Stack>
            {activeJobs.length > 0 && (
              <Link to="/recruitment/jobs">
                <Typography
                  sx={{ fontSize: "12px", textDecoration: "underline" }}
                >
                  {i({ id: "BUTTON.SEE_MORE" })}
                </Typography>
              </Link>
            )}
          </>
        )}
      </Stack>
    </CustomCard>
  );
}
