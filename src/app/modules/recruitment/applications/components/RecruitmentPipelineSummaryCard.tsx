import { Alert, Card, Chip, Divider, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { getRecruitmentAnalytics } from "../../services";
import { RecruitmentAnalytics } from "../../models";

type Props = { vacancyId?: string | null; onStageSelect?: (stage: number) => void };
const stages = ["New", "InProgress", "Shortlisted", "Selected", "OnHold", "Rejected"] as const;

const stageValues: Record<string, number> = { New: 0, InProgress: 1, Shortlisted: 3, Selected: 4, OnHold: 2, Rejected: 5 };

export default function RecruitmentPipelineSummaryCard({ vacancyId, onStageSelect }: Props) {
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
  useEffect(() => { void load(); }, [load]);
  return <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
    <Stack spacing={1.25}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
        <div><Typography variant="subtitle1" fontWeight={800}>Recruitment pipeline</Typography><Typography variant="caption" color="text.secondary">Current application-stage counts for this company and vacancy.</Typography></div>
        <AppButton size="small" variant="outlined" onClick={() => void load()} disabled={loading}>Refresh</AppButton>
      </Stack>
      <Divider />
      {analytics ? <Stack direction="row" spacing={.75} useFlexGap flexWrap="wrap">{stages.map((stage) => <Chip key={stage} size="small" label={`${stage}: ${analytics.byStage?.[stage] ?? 0}`} color={stage === "Selected" ? "success" : stage === "Rejected" ? "default" : "primary"} variant={stage === "Selected" ? "filled" : "outlined"} clickable={Boolean(onStageSelect)} onClick={() => onStageSelect?.(stageValues[stage])} />)}</Stack> : <Alert severity="info">Pipeline summary is not available yet.</Alert>}
    </Stack>
  </Card>;
}

