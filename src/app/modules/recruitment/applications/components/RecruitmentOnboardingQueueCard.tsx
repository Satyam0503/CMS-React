import { Alert, Box, Card, Chip, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import { useCallback, useEffect, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { getRecruitmentOnboardingQueue } from "../../services";
import { RecruitmentOnboardingQueueItem } from "../../models";

type Props = { status?: "PendingActivation" | "InProgress"; onApplicantSelect?: (applicantId: string) => void };

export default function RecruitmentOnboardingQueueCard({ status, onApplicantSelect }: Props) {
  const [items, setItems] = useState<RecruitmentOnboardingQueueItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRecruitmentOnboardingQueue(status);
      if (data.success) { setItems(data.methodResults ?? []); setTotal(data.totalRecords ?? 0); }
    } finally { setLoading(false); }
  }, [status]);
  useEffect(() => { void load(); }, [load]);
  return <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
    <Stack spacing={1.25}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
        <Box><Typography variant="subtitle1" fontWeight={800}>Preboarding & onboarding queue</Typography><Typography variant="caption" color="text.secondary">Track activation readiness and the first blocking task.</Typography></Box>
        <Stack direction="row" spacing={.75} alignItems="center"><Chip size="small" label={`${total} cases`} color="primary" /><AppButton size="small" variant="outlined" startIcon={<RefreshRounded />} onClick={() => void load()} disabled={loading}>Refresh</AppButton></Stack>
      </Stack>
      <Divider />
      {items.length ? <Stack spacing={1}>{items.slice(0, 8).map((item) => <Stack key={item.caseId} spacing={.5} sx={{ p: 1, borderRadius: 1.5, bgcolor: "action.hover", cursor: onApplicantSelect ? "pointer" : "default" }} onClick={() => onApplicantSelect?.(item.applicantId)}><Stack direction="row" spacing={1} alignItems="center"><Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" fontWeight={700} noWrap>{item.applicantId}</Typography><Typography variant="caption" color="text.secondary" noWrap>{item.firstBlockingTaskTitle ? `Blocked on ${item.firstBlockingTaskTitle}` : "Ready for completion"}</Typography></Box><Chip size="small" label={item.status} /><Typography variant="caption" fontWeight={700}>{item.completionPercent}%</Typography></Stack><LinearProgress variant="determinate" value={item.completionPercent} /></Stack>)}</Stack> : <Alert severity="success">No active preboarding or onboarding cases.</Alert>}
    </Stack>
  </Card>;
}
