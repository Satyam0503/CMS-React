import { Alert, Box, Card, Chip, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import FilterAltOffRounded from "@mui/icons-material/FilterAltOffRounded";
import { useCallback, useEffect, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { getRecruitmentAnalytics } from "../../services";
import { RecruitmentAnalytics } from "../../models";

type Props = {
  vacancyId?: string | null;
  activeStage?: number | null;
  onStageSelect?: (stage: number) => void;
  onClearStage?: () => void;
};

const stages = [
  { key: "New", label: "New", value: 0, color: "#0288d1", bg: "rgba(2, 136, 209, 0.08)" },
  { key: "InProgress", label: "In Review", value: 1, color: "#ed6c02", bg: "rgba(237, 108, 2, 0.08)" },
  { key: "Shortlisted", label: "Shortlisted", value: 3, color: "#7b1fa2", bg: "rgba(123, 31, 162, 0.08)" },
  { key: "OnHold", label: "On Hold", value: 2, color: "#f57c00", bg: "rgba(245, 124, 0, 0.08)" },
  { key: "Selected", label: "Selected", value: 4, color: "#2e7d32", bg: "rgba(46, 125, 50, 0.09)" },
  { key: "Rejected", label: "Rejected", value: 5, color: "#d32f2f", bg: "rgba(211, 47, 47, 0.08)" },
] as const;

export default function RecruitmentPipelineSummaryCard({
  vacancyId,
  activeStage,
  onStageSelect,
  onClearStage,
}: Props) {
  const [analytics, setAnalytics] = useState<RecruitmentAnalytics>();
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRecruitmentAnalytics(vacancyId ?? undefined);
      if (data.success) setAnalytics(data.methodResult ?? undefined);
    } finally {
      setLoading(false);
    }
  }, [vacancyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalCount = analytics?.totalApplicants ?? stages.reduce(
    (sum, item) => sum + (analytics?.byStage?.[item.key] ?? 0),
    0
  );

  return (
    <Card
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2.5,
        border: "1px solid",
        borderColor: "divider",
        background:
          "linear-gradient(180deg, rgba(32,128,125,0.03) 0%, rgba(255,255,255,0) 100%)",
      }}
    >
      <Stack spacing={1.5}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ sm: "center" }}
          gap={1}
        >
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Typography variant="subtitle1" fontWeight={800}>
              Recruitment Pipeline Funnel
            </Typography>
            <Chip
              size="small"
              label={`${totalCount} total tracked`}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 700 }}
            />
            {analytics?.averageTimeToHireDays !== null && analytics?.averageTimeToHireDays !== undefined && <Chip size="small" label={`${analytics.averageTimeToHireDays}d avg time-to-hire · ${analytics.timeToHireSampleSize ?? 0} hires`} color="secondary" variant="outlined" sx={{ fontWeight: 700 }} />}
            {activeStage !== null && activeStage !== undefined && onClearStage && (
              <Chip
                size="small"
                icon={<FilterAltOffRounded sx={{ fontSize: 15 }} />}
                label="Clear stage filter"
                color="secondary"
                onClick={onClearStage}
                sx={{ fontWeight: 700 }}
              />
            )}
          </Stack>
          <AppButton
            size="small"
            variant="outlined"
            startIcon={<RefreshRounded />}
            onClick={() => void load()}
            disabled={loading}
          >
            Refresh
          </AppButton>
        </Stack>

        <Divider />

        {analytics ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "repeat(2, minmax(0, 1fr))",
                sm: "repeat(3, minmax(0, 1fr))",
                lg: "repeat(6, minmax(0, 1fr))",
              },
              gap: 1.25,
            }}
          >
            {stages.map((stage) => {
              const count = analytics.byStage?.[stage.key] ?? 0;
              const share = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
              const isSelected = activeStage === stage.value;
              return (
                <Box
                  key={stage.key}
                  role={onStageSelect ? "button" : undefined}
                  tabIndex={onStageSelect ? 0 : undefined}
                  onClick={() => onStageSelect?.(stage.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      onStageSelect?.(stage.value);
                    }
                  }}
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: isSelected ? stage.color : "divider",
                    bgcolor: isSelected ? stage.bg : "background.paper",
                    cursor: onStageSelect ? "pointer" : "default",
                    transition: "all 160ms ease",
                    boxShadow: isSelected ? `0 0 0 2px ${stage.color}33` : "none",
                    "&:hover": onStageSelect
                      ? {
                          transform: "translateY(-2px)",
                          borderColor: stage.color,
                          bgcolor: stage.bg,
                          boxShadow: "0 6px 16px rgba(15, 23, 42, 0.06)",
                        }
                      : undefined,
                  }}
                >
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography
                        variant="caption"
                        fontWeight={750}
                         sx={{ color: "text.secondary", textTransform: "uppercase", letterSpacing: 0.4 }}
                      >
                        {stage.label}
                      </Typography>
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          bgcolor: stage.color,
                        }}
                      />
                    </Stack>
                    <Stack direction="row" alignItems="baseline" justifyContent="space-between">
                      <Typography variant="h5" fontWeight={850} sx={{ color: "text.primary", lineHeight: 1.1 }}>
                        {count}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" fontWeight={600}>
                        {share}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={share}
                      sx={{
                        height: 5,
                        borderRadius: 99,
                        bgcolor: "action.hover",
                        "& .MuiLinearProgress-bar": {
                          bgcolor: stage.color,
                          borderRadius: 99,
                        },
                      }}
                    />
                  </Stack>
                </Box>
              );
            })}
          </Box>
        ) : (
          <Alert severity="info">Pipeline summary is not available yet.</Alert>
        )}
      </Stack>
    </Card>
  );
}
