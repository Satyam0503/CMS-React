import { Alert, Avatar, Box, Card, Chip, Divider, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import ArrowOutwardRounded from "@mui/icons-material/ArrowOutwardRounded";
import { useCallback, useEffect, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { getRecruitmentOnboardingQueue } from "../../services";
import { RecruitmentOnboardingQueueItem } from "../../models";
import { CandidateDisplayInfo } from "./RecruitmentPreboardingQueueCard";

type Props = {
  status?: "PendingActivation" | "InProgress";
  onApplicantSelect?: (applicantId: string) => void;
  applicantLookup?: Record<string, CandidateDisplayInfo>;
};

const getInitials = (name?: string) => {
  if (!name) return "OB";
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "")).toUpperCase() || "OB";
};

export default function RecruitmentOnboardingQueueCard({
  status,
  onApplicantSelect,
  applicantLookup,
}: Props) {
  const [items, setItems] = useState<RecruitmentOnboardingQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRecruitmentOnboardingQueue(status);
      if (data.success) {
        setItems(data.methodResults ?? []);
        setTotal(data.totalRecords ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          gap={1}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>
              Employee Onboarding & Activation Queue
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Track post-handoff onboarding task progress and employee activation readiness.
            </Typography>
          </Box>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Chip size="small" label={`${total} cases`} color="primary" variant="outlined" />
            <AppButton
              size="small"
              variant="outlined"
              startIcon={<RefreshRounded />}
              onClick={() => void load()}
              disabled={loading}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </AppButton>
          </Stack>
        </Stack>

        <Divider />

        {items.length ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
              gap: 1.25,
            }}
          >
            {items.slice(0, 8).map((item) => {
              const candidate = applicantLookup?.[item.applicantId];
              const displayName =
                item.applicantName || candidate?.fullName || `Candidate #${item.applicantId.slice(-6).toUpperCase()}`;
              const subtitle = item.firstBlockingTaskTitle
                ? `Next step: ${item.firstBlockingTaskTitle}`
                : "All onboarding tasks completed";

              return (
                <Tooltip
                  key={item.caseId}
                  title={item.email || candidate?.email ? `${item.email || candidate?.email} (Case: ${item.caseId})` : `Case ID: ${item.caseId} · Applicant ID: ${item.applicantId}`}
                  placement="top"
                  arrow
                >
                  <Stack
                    spacing={1}
                    onClick={() => onApplicantSelect?.(item.applicantId)}
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: "background.paper",
                      border: "1px solid",
                      borderColor: "divider",
                      cursor: onApplicantSelect ? "pointer" : "default",
                      transition: "all 150ms ease",
                      "&:hover": onApplicantSelect
                        ? {
                            borderColor: "primary.main",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
                          }
                        : undefined,
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          fontSize: "0.8rem",
                          fontWeight: 800,
                          bgcolor: "rgba(2, 136, 209, 0.12)",
                          color: "primary.main",
                        }}
                      >
                        {getInitials(candidate?.fullName)}
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {displayName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap display="block">
                          {candidate?.vacancyName ? `${candidate.vacancyName} · ${subtitle}` : subtitle}
                        </Typography>
                      </Box>
                      <Chip size="small" label={item.status} color="primary" variant="outlined" />
                      <Typography variant="caption" fontWeight={800}>
                        {item.completionPercent}%
                      </Typography>
                      {onApplicantSelect && (
                        <ArrowOutwardRounded sx={{ fontSize: 16, color: "text.disabled" }} />
                      )}
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={item.completionPercent}
                      sx={{ height: 6, borderRadius: 99 }}
                    />
                  </Stack>
                </Tooltip>
              );
            })}
          </Box>
        ) : (
          <Alert severity="success">No active preboarding or onboarding cases.</Alert>
        )}
      </Stack>
    </Card>
  );
}
