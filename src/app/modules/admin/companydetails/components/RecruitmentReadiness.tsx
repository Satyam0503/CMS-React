import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Chip, CircularProgress, LinearProgress, Stack, Typography } from "@mui/material";
import { CheckCircleRounded, RadioButtonUncheckedRounded, RefreshRounded, SettingsRounded } from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { getRecruitmentReadiness } from "../../../recruitment/services";
import type { RecruitmentReadiness as RecruitmentReadinessState } from "../../../recruitment/services";
import { AppButton } from "../../../../shared/components/ui";

export function RecruitmentReadiness() {
  const [state, setState] = useState<RecruitmentReadinessState | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await getRecruitmentReadiness();
      if (!data.success || !data.methodResult) throw new Error(data.message || "Unable to load recruitment readiness.");
      setState(data.methodResult);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  if (error) {
    return (
      <Alert
        severity="warning"
        action={<AppButton size="small" color="inherit" startIcon={<RefreshRounded />} onClick={() => void load()}>Retry</AppButton>}
      >
        Recruitment readiness could not be loaded. Confirm that your role has Jobs view permission, then retry.
      </Alert>
    );
  }

  if (!state) return <Box sx={{ display: "grid", placeItems: "center", minHeight: 180 }}><CircularProgress size={24} /></Box>;

  const renderItems = (items: RecruitmentReadinessState["required"]) => (
    <Stack spacing={1}>
      {items.map((item) => (
        <Stack key={item.code} direction="row" spacing={1} alignItems="flex-start">
          <Box sx={{ color: item.complete ? "success.main" : "text.disabled", mt: 0.15 }}>
            {item.complete ? <CheckCircleRounded fontSize="small" /> : <RadioButtonUncheckedRounded fontSize="small" />}
          </Box>
          <Typography variant="body2" sx={{ color: item.complete ? "text.secondary" : "text.primary", fontWeight: item.complete ? 400 : 650 }}>
            {item.label}
          </Typography>
        </Stack>
      ))}
    </Stack>
  );

  return (
    <Stack spacing={2} sx={{ p: { xs: 1.5, sm: 2.5 }, border: "1px solid", borderColor: "divider", borderRadius: 3, bgcolor: "background.paper" }}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}>
        <Box>
          <Typography variant="h6" fontWeight={800}>Recruitment readiness</Typography>
          <Typography variant="body2" color="text.secondary">Complete the required setup before publishing your first job.</Typography>
        </Box>
        <Chip size="small" color={state.readyToPublishJobs ? "success" : "warning"} label={state.readyToPublishJobs ? "Ready to publish" : "Setup in progress"} />
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <LinearProgress aria-label="Recruitment setup progress" variant="determinate" value={state.completionPercent} sx={{ flex: 1, height: 8, borderRadius: 8 }} />
        <Typography variant="body2" fontWeight={700}>{state.completionPercent}%</Typography>
      </Stack>
      <Typography variant="caption" color="text.secondary">Mode: {state.mode} · Timezone: {state.timezone}</Typography>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
        <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Required before publishing</Typography>
          {renderItems(state.required)}
        </Box>
        <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>Recommended controls</Typography>
          {renderItems(state.recommended)}
        </Box>
      </Box>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end">
        <AppButton variant="outlined" startIcon={<RefreshRounded />} disabled={loading} onClick={() => void load()}>{loading ? "Checking…" : "Check again"}</AppButton>
        <AppButton component={RouterLink} to="/recruitment-settings" variant="contained" startIcon={<SettingsRounded />}>Open recruitment setup</AppButton>
      </Stack>
    </Stack>
  );
}