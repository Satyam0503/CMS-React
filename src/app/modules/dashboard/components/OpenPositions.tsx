import { alpha, Box, Stack, Typography } from "@mui/material";
import {
  ArrowForwardRounded,
  BugReportOutlined,
  CodeRounded,
  PeopleOutlineRounded,
  TerminalOutlined,
  WorkOutlineRounded,
} from "@mui/icons-material";
import { useIntl } from "react-intl";
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import { Link } from "react-router-dom";
import { JobModal } from "../../recruitment/models";
import { getAllJobVacancies } from "../../recruitment/services";
import { CustomCard } from "../../../shared/components/C_Card";
import { CardSkeleton } from "./CardSkeleton";
import { JobTypeMapper } from "../../../../utils/common";
import { getVacancyPayload } from "../../recruitment/jobs/Jobs";
import { useIsDark } from "../../theme/useIsDark";

const getJobRoleIcon = (title: string) => {
  const lower = title.toLowerCase();
  if (lower.includes("qa") || lower.includes("test") || lower.includes("quality")) {
    return <BugReportOutlined sx={{ fontSize: 18, color: "#0D9488" }} />;
  }
  if (lower.includes("full stack") || lower.includes("react") || lower.includes("frontend")) {
    return <CodeRounded sx={{ fontSize: 18, color: "#0B5CAB" }} />;
  }
  if (lower.includes(".net") || lower.includes("backend") || lower.includes("engineer") || lower.includes("dev")) {
    return <TerminalOutlined sx={{ fontSize: 18, color: "#0284C7" }} />;
  }
  return <WorkOutlineRounded sx={{ fontSize: 18, color: "#0B5CAB" }} />;
};

export default function OpenPositions() {
  const isDark = useIsDark();
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
            <Typography sx={{ fontSize: "0.9rem", color: "#64748B", fontWeight: 500 }}>
              {i({ id: "MESSAGE.NO_ACTIVE_VANCANCY" })}
            </Typography>
          </Box>
        ) : (
          <>
            <Stack spacing={1} sx={{ marginBlockEnd: 1.25 }}>
              {activeJobs.slice(0, 4).map((job) => {
                return (
                  <Stack
                    key={job.jobId}
                    direction="row"
                    spacing={1.5}
                    sx={{
                      alignItems: "center",
                      p: 1.15,
                      borderRadius: "12px",
                      backgroundColor: isDark
                        ? "rgba(255, 255, 255, 0.04)"
                        : "rgba(255, 255, 255, 0.65)",
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: isDark
                        ? "none"
                        : "0 2px 6px rgba(15, 23, 42, 0.03), inset 0 1px 1px rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                      transition: "border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease, background-color 0.18s ease",
                      "&:hover": {
                        backgroundColor: isDark
                          ? "rgba(255, 255, 255, 0.08)"
                          : "rgba(255, 255, 255, 0.92)",
                        borderColor: "primary.main",
                        boxShadow: (theme) => `0 6px 16px ${alpha(theme.palette.primary.main, 0.15)}`,
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 38,
                        height: 38,
                        borderRadius: "10px",
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.12),
                        border: "1px solid",
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.25),
                        display: "grid",
                        placeItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      {getJobRoleIcon(job.title)}
                    </Box>

                    <Stack sx={{ flexGrow: 1, minWidth: 0 }} spacing={0.1}>
                      <Typography
                        noWrap
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          color: "text.primary",
                        }}
                      >
                        {job.title}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: "0.75rem",
                          fontWeight: 500,
                          color: "text.secondary",
                        }}
                      >
                        {i({ id: JobTypeMapper[job.jobType] })}
                      </Typography>
                    </Stack>

                    <Stack
                      direction="row"
                      spacing={0.5}
                      alignItems="center"
                      sx={{
                        px: 1,
                        py: 0.35,
                        borderRadius: "6px",
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        border: "1px solid",
                        borderColor: (theme) => alpha(theme.palette.primary.main, 0.2),
                        color: "text.primary",
                        flexShrink: 0,
                      }}
                    >
                      <PeopleOutlineRounded sx={{ fontSize: 13.5, color: "text.secondary" }} />
                      <Typography sx={{ fontWeight: 700, fontSize: "0.78rem", color: "text.primary" }}>
                        {job.vacancies}
                      </Typography>
                    </Stack>
                  </Stack>
                );
              })}
            </Stack>
            {activeJobs.length > 0 && (
              <Link to="/recruitment/jobs" style={{ alignSelf: "flex-start" }}>
                <Stack
                  direction="row"
                  spacing={0.6}
                  alignItems="center"
                  sx={{
                    px: 1.25,
                    py: 0.55,
                    borderRadius: "8px",
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.06)"
                      : "#F8FAFC",
                    border: "1px solid",
                    borderColor: "divider",
                    color: "text.primary",
                    transition: "all 0.18s ease",
                    "&:hover": {
                      backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                      borderColor: "primary.main",
                      color: "primary.main",
                    },
                  }}
                >
                  <Typography sx={{ fontSize: "0.78rem", fontWeight: 600, color: "inherit" }}>
                    {i({ id: "BUTTON.SEE_MORE" })}
                  </Typography>
                  <ArrowForwardRounded sx={{ fontSize: 14 }} />
                </Stack>
              </Link>
            )}
          </>
        )}
      </Stack>
    </CustomCard>
  );
}

