import { Alert, Box, Card, Chip, Divider, Stack, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import { useEffect, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { getRecruitmentScreeningQueue } from "../../services";
import { RecruitmentScreeningQueueReport } from "../../models";

type Props = { vacancyId?: string | null };
export default function RecruitmentScreeningQueueCard({ vacancyId }: Props) {
  const [report, setReport] = useState<RecruitmentScreeningQueueReport>();
  const [loading, setLoading] = useState(false);
  const load = async () => { setLoading(true); try { const { data } = await getRecruitmentScreeningQueue(vacancyId ?? undefined); if (data.success) setReport(data.methodResult ?? undefined); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, [vacancyId]);
  return <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}><Stack spacing={1.25}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}><Box><Typography variant="subtitle1" fontWeight={800}>Screening queue</Typography><Typography variant="caption" color="text.secondary">Pending applications ordered by SLA age.</Typography></Box><Stack direction="row" spacing={.75} alignItems="center"><Chip size="small" label={`${report?.totalPending ?? 0} pending`} color="primary" /><Chip size="small" label={`${report?.overdueCount ?? 0} overdue`} color={(report?.overdueCount ?? 0) > 0 ? "warning" : "default"} /><AppButton size="small" variant="outlined" startIcon={<RefreshRounded />} onClick={() => void load()} disabled={loading}>Refresh</AppButton></Stack></Stack><Divider />{report?.items.length ? <Stack spacing={.75}>{report.items.slice(0, 8).map(item => <Stack key={item.applicantId} direction="row" spacing={1} alignItems="center" sx={{ p: 1, borderRadius: 1.5, bgcolor: item.overdue ? "rgba(237,108,2,.08)" : "action.hover" }}><Box sx={{ flex: 1, minWidth: 0 }}><Typography variant="body2" fontWeight={700} noWrap>{item.applicantName}</Typography><Typography variant="caption" color="text.secondary" noWrap>{item.email || "No email"} · {item.decision}</Typography></Box><Chip size="small" label={`${Math.round(item.ageHours)}h`} color={item.overdue ? "warning" : "default"} /></Stack>)}</Stack> : <Alert severity="success">No pending screening reviews.</Alert>}</Stack></Card>;
}
