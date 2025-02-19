import { Avatar, Card, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { useIntl } from "react-intl";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { colors } from "../../theme/MuiTheme";
import { CustomCard } from "../../components/CustomCard";
import { useEffect, useState } from "react";
import { JobModal } from "../../../../utils/common_types";
import { getAllJobVacancies } from "../../recruitment/services";
import { AxiosError } from "axios";

export default function OpenPositions() {
  const [activeJobs, setActiveJobs] = useState<JobModal[]>([]);
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
      }
    }
    getActiveJobs();
  }, []);

  return (
    <CustomCard
      label={intl.formatMessage({ id: "MENU.OPEN_POSITIONS" })}
      value={activeJobs.length}
    >
      <Stack spacing={1}>
        {activeJobs.slice(-4).map((job) => (
          <Stack direction={"row"} alignItems={"center"} spacing={1}>
            <Avatar variant="rounded">
              {job.title.charAt(0)}
            </Avatar>

            <Stack flexGrow={1}>
              <Typography variant="body1">
                {job.title}
              </Typography>

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
    </CustomCard>
  );
}
