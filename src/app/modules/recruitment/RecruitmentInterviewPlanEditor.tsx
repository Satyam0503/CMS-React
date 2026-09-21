import { useEffect, useState } from "react";
import { Box, Divider, Stack, Typography } from "@mui/material";
import { AppButton, AppSwitch, AppTextField } from "../../shared/components/ui";
import { toast } from "react-toastify";
import { getRecruitmentInterviewPlan, upsertRecruitmentInterviewPlan } from "./services";
import { RecruitmentInterviewPlanStageCommand } from "./models";

const key = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-interview-plan`;
const initial: RecruitmentInterviewPlanStageCommand[] = [
  { order: 1, code: "technical", name: "Technical interview", type: "Technical", requiredPanelSize: 1, scorecardRequired: true, feedbackDueHours: 24 },
  { order: 2, code: "hr", name: "HR interview", type: "HR", requiredPanelSize: 1, scorecardRequired: true, feedbackDueHours: 24 },
];
export default function RecruitmentInterviewPlanEditor() {
  const [stages, setStages] = useState(initial);
  const [saving, setSaving] = useState(false);  const [loading, setLoading] = useState(true);
  useEffect(() => { void getRecruitmentInterviewPlan().then(({ data }) => { if (data.success && data.methodResult?.stages?.length) setStages(data.methodResult.stages.map(stage => ({ order: stage.order, code: stage.code, name: stage.name, type: stage.type, requiredPanelSize: stage.requiredPanelSize, scorecardRequired: stage.scorecardRequired, feedbackDueHours: stage.feedbackDueHours }))); }).catch(() => toast.info("Using the system interview-plan defaults.")).finally(() => setLoading(false)); }, []);

  const update = (index: number, patch: Partial<RecruitmentInterviewPlanStageCommand>) => setStages(current => current.map((stage, i) => i === index ? { ...stage, ...patch } : stage));
  const save = async () => { setSaving(true); try { const { data } = await upsertRecruitmentInterviewPlan({ name: "Company default interview plan", isDefault: true, stages, idempotencyKey: key() }); if (!data.success) throw new Error(data.message || "Unable to save interview plan."); toast.success("Interview plan saved."); } catch (error) { toast.error((error as Error).message || "Unable to save interview plan."); } finally { setSaving(false); } };
  return <Box sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1}><Box><Typography variant="subtitle2" fontWeight={800}>Default interview plan</Typography><Typography variant="caption" color="text.secondary">Define the rounds used when a job has no override. Each round can require panel feedback before debrief.</Typography></Box><AppButton variant="contained" onClick={() => void save()} disabled={saving || loading}>{loading ? "Loading…" : saving ? "Saving…" : "Save plan"}</AppButton></Stack><Divider sx={{ my: 1.5 }} /><Stack spacing={1.25}>{stages.map((stage, index) => <Box key={stage.code} sx={{ p: 1.25, borderRadius: 2, bgcolor: "action.hover" }}><Stack direction={{ xs: "column", md: "row" }} spacing={1}><AppTextField label={`Round ${stage.order}`} value={stage.name} onChange={event => update(index, { name: event.target.value })} sx={{ flex: 2 }} /><AppTextField label="Type" value={stage.type ?? ""} onChange={event => update(index, { type: event.target.value })} sx={{ flex: 1 }} /><AppTextField label="Panel size" type="number" value={stage.requiredPanelSize} onChange={event => update(index, { requiredPanelSize: Math.max(1, Number(event.target.value) || 1) })} inputProps={{ min: 1, max: 20 }} sx={{ flex: 1 }} /><AppTextField label="Feedback hours" type="number" value={stage.feedbackDueHours} onChange={event => update(index, { feedbackDueHours: Math.max(1, Number(event.target.value) || 1) })} inputProps={{ min: 1, max: 720 }} sx={{ flex: 1 }} /></Stack><Stack direction="row" alignItems="center" spacing={1} sx={{ mt: .75 }}><AppSwitch checked={stage.scorecardRequired} onChange={event => update(index, { scorecardRequired: event.target.checked })} inputProps={{ "aria-label": `Scorecard required for round ${stage.order}` }} /><Typography variant="caption" color="text.secondary">Scorecard required before debrief</Typography></Stack></Box>)}</Stack></Box>;
}

