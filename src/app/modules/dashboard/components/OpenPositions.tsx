import { Avatar, Box, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { JobModal } from "../../recruitment/models";
import { getAllJobVacancies } from "../../recruitment/services";
import { CustomCard } from "../../../shared/components/CustomCard";
import { colors } from "../../theme/MuiTheme";
import { CardSkeleton } from "./CardSkeleton";

export default function OpenPositions() {
  const [activeJobs, setActiveJobs] = useState<JobModal[]>([]);
  const [loading, setLoading] = useState(true);
  const intl = useIntl();
  useEffect(() => {
    async function getActiveJobs() {
      try {
        const response = await getAllJobVacancies();
        const { success, methodResults } = response.data;
        if (success) {
          setActiveJobs(methodResults.filter((job) => job.status === true));
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
      label={intl.formatMessage({ id: "MENU.OPEN_POSITIONS" })}
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
            component={"div"}
            sx={{ height: "100%", alignContent: "center", textAlign: "center" }}
          >
            <Typography variant="h5" sx={{ color: colors.alpha.neutral[400] }}>
              {intl.formatMessage({ id: "DASHBOARD.VACANCY.NOVACANCIES" })}
            </Typography>
          </Box>
        ) : (
          <>
            <Stack spacing={1} sx={{ marginBlockEnd: 1 }}>
              {activeJobs.slice(-4).map((job) => (
                <Stack
                  key={job.jobId}
                  direction={"row"}
                  alignItems={"center"}
                  spacing={1}
                >
                  <Avatar variant="rounded">{job.title.charAt(0)}</Avatar>

                  <Stack flexGrow={1}>
                    <Typography variant="body1">{job.title}</Typography>

                    <Typography
                      variant="body2"
                      sx={{ color: colors.alpha.neutral[400] }}
                    >
                      {job.jobType}
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
                  {intl.formatMessage({ id: "SEE_MORE" })}
                </Typography>
              </Link>
            )}
          </>
        )}
      </Stack>
    </CustomCard>
  );
}
