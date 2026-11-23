import { Alert, Box, Card, Chip, Grid, LinearProgress, Stack, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import { useCallback, useEffect, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { RecruitmentResumeScanHealth } from "../../models";
import { getRecruitmentResumeScanHealth } from "../../services";

const metrics = [
  { key: "pendingInitialScans", label: "Awaiting first scan" },
  { key: "scannerUnavailable", label: "Scan unavailable" },
  { key: "infectedAwaitingQuarantine", label: "Quarantine pending" },
  { key: "staleCleanScans", label: "Older than 24 hours" },
] as const;

export default function RecruitmentResumeScanHealthCard() {
  const [health, setHealth] = useState<RecruitmentResumeScanHealth>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const { data } = await getRecruitmentResumeScanHealth();
      if (data.success && data.methodResult) setHealth(data.methodResult);
      else setError(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
      <Stack spacing={1.5}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800}>Resume scanning operations</Typography>
            <Typography variant="body2" color="text.secondary">
              Company-wide safety queue for candidate resumes. Candidate files are never included in this summary.
            </Typography>
          </Box>
          <AppButton size="small" variant="outlined" startIcon={<RefreshRounded />} onClick={() => void load()} disabled={loading}>
            Refresh
          </AppButton>
        </Stack>

        {loading && <LinearProgress aria-label="Loading resume scanning status" />}
        {error && (
          <Alert severity="warning" role="status">
            Resume scanning status could not be loaded. Retry shortly; this does not change application decisions.
          </Alert>
        )}
        {health && !error && (
          <>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
              {(() => {
                const scannerLabel = !health.scannerConfigured
                  ? "Scanner not configured"
                  : health.scannerReachable === true
                    ? "Scanner reachable"
                    : health.scannerReachable === false
                      ? "Scanner unreachable"
                      : "Reachability unknown";
                const scannerColor = !health.scannerConfigured || health.scannerReachable === false
                  ? "error"
                  : health.scannerReachable === true
                    ? "success"
                    : "default";
                return <Chip size="small" color={scannerColor} label={scannerLabel} />;
              })()}
              <Typography variant="caption" color="text.secondary">
                {health.scannerReachable === true
                  ? "Connection probe passed; signature freshness is not checked here."
                  : health.scannerReachable === false && health.scannerConfigured
                    ? "The configured scanning service did not respond to its health check."
                    : "Reachability is not confirmed; contact an administrator if this persists."}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ ml: { sm: "auto" } }}>
                {health.applicantsWithResume} candidate records have a resume reference
              </Typography>
            </Stack>
            <Grid container spacing={1}>
              {metrics.map((metric) => {
                const value = health[metric.key];
                return (
                  <Grid size={{ xs: 6, md: 3 }} key={metric.key}>
                    <Box sx={{ p: 1.25, height: "100%", borderRadius: 1.75, bgcolor: "action.hover" }}>
                      <Typography variant="h6" fontWeight={800} lineHeight={1.2}>{value}</Typography>
                      <Typography variant="caption" color="text.secondary">{metric.label}</Typography>
                    </Box>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Stack>
    </Card>
  );
}
