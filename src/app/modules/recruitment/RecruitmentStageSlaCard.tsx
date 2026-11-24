import { useCallback, useEffect, useState } from "react";
import { Alert, Box, Chip, CircularProgress, Stack, TextField, Typography, alpha, useTheme } from "@mui/material";
import TimerOutlined from "@mui/icons-material/TimerOutlined";
import { AppButton } from "../../shared/components/ui";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import { getRecruitmentSlaPolicies, getRecruitmentStageSla, upsertRecruitmentSlaPolicy } from "./services";
import { RecruitmentStageSlaPolicy, RecruitmentStageSlaReport } from "./models";
import RecruitmentCapabilityNotice from "./RecruitmentCapabilityNotice";
import { isRecruitmentFeatureDisabled, responseDataFromError } from "./recruitmentCapabilityUtils";

const newKey = () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export default function RecruitmentStageSlaCard() {
  const theme = useTheme();
  const [report, setReport] = useState<RecruitmentStageSlaReport>();
  const [policies, setPolicies] = useState<RecruitmentStageSlaPolicy[]>([]);
  const [stage, setStage] = useState("");
  const [location, setLocation] = useState("");
  const [targetHours, setTargetHours] = useState("48");
  const [enabled, setEnabled] = useState(true);
  const [editingId, setEditingId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [featureDisabled, setFeatureDisabled] = useState(false);
  const [loadError, setLoadError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reportResponse, policyResponse] = await Promise.all([getRecruitmentStageSla(), getRecruitmentSlaPolicies()]);
      if (!reportResponse.data.success || !policyResponse.data.success) {
        const response = !reportResponse.data.success ? reportResponse.data : policyResponse.data;
        if (isRecruitmentFeatureDisabled(response)) {
          setFeatureDisabled(true);
          setLoadError(undefined);
        } else {
          setFeatureDisabled(false);
          setLoadError(response.message || "Stage aging could not be loaded.");
        }
        setReport(undefined);
        return;
      }
      setFeatureDisabled(false);
      setLoadError(undefined);
      setReport(reportResponse.data.methodResult ?? undefined);
      setPolicies(policyResponse.data.methodResult ?? []);
    } catch (error) {
      const response = responseDataFromError(error);
      setReport(undefined);
      if (isRecruitmentFeatureDisabled(response)) {
        setFeatureDisabled(true);
        setLoadError(undefined);
      } else {
        setFeatureDisabled(false);
        setLoadError((response as { message?: string } | undefined)?.message || "Stage aging could not be loaded. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const resetEditor = () => {
    setEditingId(undefined);
    setStage("");
    setLocation("");
    setTargetHours("48");
    setEnabled(true);
  };

  const editPolicy = (policy: RecruitmentStageSlaPolicy) => {
    setEditingId(policy.policyId);
    setStage(policy.stage);
    setLocation(policy.location ?? "");
    setTargetHours(String(policy.targetHours));
    setEnabled(policy.enabled);
  };

  const savePolicy = async () => {
    const hours = Number(targetHours);
    if (!stage.trim() || stage.trim().length > 100 || !Number.isInteger(hours) || hours < 1 || hours > 8760) {
      toast.error("Enter a stage and an SLA between 1 hour and 1 year.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await upsertRecruitmentSlaPolicy({ stage: stage.trim(), location: location.trim() || null, targetHours: hours, enabled, idempotencyKey: newKey() });
      if (!data.success) throw new Error(data.message || "Unable to save the stage SLA.");
      toast.success("Stage SLA saved.");
      resetEditor();
      await load();
    } catch (error) {
      toast.error((error as Error).message || "Unable to save the stage SLA.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <CircularProgress size={22} aria-label="Loading stage aging SLAs" />;
  if (featureDisabled || loadError || !report) return <RecruitmentCapabilityNotice feature="Stage aging SLA tracking" settingsArea="Enterprise Operations → Stage aging SLAs" disabled={featureDisabled} errorMessage={loadError} onRetry={() => void load()} retrying={loading} />;

  const overdue = report.overdueApplications > 0;
  return (
    <Box sx={{ p: { xs: 2, sm: 2.5 }, border: "1px solid", borderColor: overdue ? alpha(theme.palette.warning.main, 0.4) : "divider", borderRadius: "12px", bgcolor: "background.paper", minWidth: 0 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1.25}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <TimerOutlined color={overdue ? "warning" : "primary"} />
            <Box>
              <Typography variant="subtitle1" fontWeight={800}>Application stage aging</Typography>
              <Typography variant="caption" color="text.secondary">See applications beyond their configured time in each hiring stage.</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1}>
            <Chip size="small" label={`${report.totalTrackedApplications} tracked`} />
            <Chip size="small" color={overdue ? "warning" : "success"} label={`${report.overdueApplications} overdue`} />
          </Stack>
        </Stack>

        {overdue && <Alert severity="warning">Review overdue applications and update candidates on their progress.</Alert>}

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.2fr 1fr 150px auto auto" }, gap: 1, alignItems: "center" }}>
          <TextField size="small" label="Pipeline stage" placeholder="For example, Screening" value={stage} onChange={(event) => setStage(event.target.value)} inputProps={{ maxLength: 100 }} disabled={Boolean(editingId)} />
          <TextField size="small" label="Location (optional)" placeholder="All locations" value={location} onChange={(event) => setLocation(event.target.value)} inputProps={{ maxLength: 120 }} disabled={Boolean(editingId)} />
          <TextField size="small" type="number" label="Target hours" value={targetHours} onChange={(event) => setTargetHours(event.target.value)} inputProps={{ min: 1, max: 8760 }} />
          <AppButton size="small" variant={enabled ? "outlined" : "text"} aria-pressed={enabled} onClick={() => setEnabled((current) => !current)}>{enabled ? "Enabled" : "Disabled"}</AppButton>
          <Stack direction="row" spacing={0.75}>
            <AppButton size="small" variant="contained" onClick={() => void savePolicy()} disabled={saving}>{saving ? "Saving…" : editingId ? "Update" : "Add policy"}</AppButton>
            {editingId && <AppButton size="small" onClick={resetEditor}>Cancel</AppButton>}
          </Stack>
        </Box>

        {policies.length > 0 && <Stack spacing={0.75}>
          <Typography variant="overline" color="text.secondary" fontWeight={800}>Configured stage targets</Typography>
          {policies.map((policy) => <Stack key={policy.policyId} direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={1} sx={{ px: 1.25, py: 1, border: "1px solid", borderColor: "divider", borderRadius: 1.5 }}>
            <Typography variant="body2"><b>{policy.stage}</b> · {policy.location || "All locations"} · {policy.targetHours} hours</Typography>
            <Stack direction="row" spacing={1} alignItems="center"><Chip size="small" color={policy.enabled ? "success" : "default"} label={policy.enabled ? "Active" : "Off"} /><AppButton size="small" onClick={() => editPolicy(policy)}>Edit</AppButton></Stack>
          </Stack>)}
        </Stack>}

        <Stack spacing={0.75}>
          <Typography variant="overline" color="text.secondary" fontWeight={800}>Applications needing attention</Typography>
          {report.items.length === 0 ? <Typography variant="body2" color="text.secondary">No applications have crossed a configured target. Add stage targets above to start tracking aging.</Typography> : report.items.slice(0, 10).map((item) => <Stack key={`${item.applicantId}:${item.vacancyId}`} direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" sx={{ p: 1.25, bgcolor: item.overdue ? alpha(theme.palette.warning.main, 0.06) : "background.default", border: "1px solid", borderColor: item.overdue ? alpha(theme.palette.warning.main, 0.3) : "divider", borderRadius: 1.5 }}>
            <Box minWidth={0}><Typography variant="body2" fontWeight={700}>{item.vacancyTitle || "Open role"} · {item.stage}</Typography><Typography variant="caption" color="text.secondary">Application {item.applicantId.slice(0, 8)} · {item.location || "Location not set"} · {item.hoursInStage.toFixed(1)} / {item.targetHours} hours</Typography></Box>
            <Chip size="small" color={item.overdue ? "warning" : "default"} label={item.overdue ? `Overdue · due ${dayjs(item.dueAtUtc).format("D MMM, h:mm A")}` : `Due ${dayjs(item.dueAtUtc).format("D MMM, h:mm A")}`} />
          </Stack>)}
          {report.items.length > 10 && <Typography variant="caption" color="text.secondary">Showing 10 of {report.totalTrackedApplications} tracked applications.</Typography>}
        </Stack>
      </Stack>
    </Box>
  );
}
