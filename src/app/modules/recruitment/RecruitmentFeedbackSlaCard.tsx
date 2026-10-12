import { useEffect, useState } from "react";
import { Alert, Box, Chip, Stack, Typography } from "@mui/material";
import { AppButton } from "../../shared/components/ui";
import { getRecruitmentFeedbackSla, queueRecruitmentFeedbackReminders } from "./services";
import { toast } from "react-toastify";
import { RecruitmentFeedbackSlaReport } from "./models";
export default function RecruitmentFeedbackSlaCard() {
  const [report, setReport] = useState<RecruitmentFeedbackSlaReport>();
  const [queueing, setQueueing] = useState(false);
  const queueReminders = async () => { setQueueing(true); try { const { data } = await queueRecruitmentFeedbackReminders(); if (!data.success) throw new Error(data.message || "Unable to queue reminders."); toast.success(data.message || "Feedback reminders queued."); const refreshed = await getRecruitmentFeedbackSla(); if (refreshed.data.success) setReport(refreshed.data.methodResult ?? undefined); } catch (error) { toast.error((error as Error).message || "Unable to queue reminders."); } finally { setQueueing(false); } };
  useEffect(() => { void getRecruitmentFeedbackSla().then(({ data }) => { if (data.success) setReport(data.methodResult ?? undefined); }).catch(() => undefined); }, []);
  if (!report) return null;
  return <Box sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: report.overdueRounds ? "warning.main" : "divider", borderRadius: 2.5 }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}><Box><Typography variant="subtitle2" fontWeight={800}>Interviewer feedback SLA</Typography><Typography variant="caption" color="text.secondary">Open interview rounds and scorecards that need action.</Typography></Box><Stack direction="row" spacing={.75}><Chip size="small" label={`${report.totalOpenRounds} open`} /><Chip size="small" color={report.overdueRounds ? "warning" : "success"} label={`${report.overdueRounds} overdue`} /></Stack>{report.overdueRounds > 0 && <AppButton size="small" variant="outlined" onClick={() => void queueReminders()} disabled={queueing}>{queueing ? "Queueing…" : "Remind interviewers"}</AppButton>}</Stack>{report.overdueRounds > 0 && <Alert severity="warning" sx={{ mt: 1.25 }}>Follow up on overdue interviewer feedback before completing the debrief.</Alert>}<Stack spacing={.5} sx={{ mt: 1.25 }}>{report.items.slice(0, 5).map(item => <Stack key={item.interviewId} direction="row" justifyContent="space-between" gap={1} sx={{ py: .5 }}><Typography variant="caption">Round {item.roundNumber} · {item.submittedScorecards}/{Math.max(item.assignedInterviewers, 1)} scorecards</Typography><Typography variant="caption" color={item.overdue ? "warning.main" : "text.secondary"}>{new Date(item.dueAtUtc).toLocaleString()}</Typography></Stack>)}</Stack></Box>;
}


