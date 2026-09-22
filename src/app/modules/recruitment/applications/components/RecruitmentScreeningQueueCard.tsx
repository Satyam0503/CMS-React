import { Alert, Box, Card, Checkbox, Chip, Divider, MenuItem, Stack, TextField, Typography } from "@mui/material";
import RefreshRounded from "@mui/icons-material/RefreshRounded";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AppButton } from "../../../../shared/components";
import { bulkRecruitmentScreening, getRecruitmentScreeningQueue } from "../../services";
import { getAllEmployees } from "../../../employees/employeeServices";
import { RecruitmentScreeningQueueReport } from "../../models";

 type Props = { vacancyId?: string | null; onApplicantSelect?: (applicantId: string) => void };
const createIdempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-bulk-screening`;

export default function RecruitmentScreeningQueueCard({ vacancyId, onApplicantSelect }: Props) {
  const [report, setReport] = useState<RecruitmentScreeningQueueReport>();
  const [loading, setLoading] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [decision, setDecision] = useState<"Pass" | "Hold" | "Reject">("Pass");
  const [score, setScore] = useState("60");
  const [rejectionReason, setRejectionReason] = useState("");
  const [feedback, setFeedback] = useState<string>();
  const [reviewers, setReviewers] = useState<Array<{ userId: string; fullName: string }>>([]);
  const [filters, setFilters] = useState({ reviewerUserId: "", minScore: "", maxScore: "", submittedAfterUtc: "", submittedBeforeUtc: "" });
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRecruitmentScreeningQueue(vacancyId ?? undefined, 48, { reviewerUserId: filters.reviewerUserId || undefined, minScore: filters.minScore ? Number(filters.minScore) : undefined, maxScore: filters.maxScore ? Number(filters.maxScore) : undefined, submittedAfterUtc: filters.submittedAfterUtc ? new Date(filters.submittedAfterUtc).toISOString() : undefined, submittedBeforeUtc: filters.submittedBeforeUtc ? new Date(`${filters.submittedBeforeUtc}T23:59:59`).toISOString() : undefined });
      if (data.success) {
        setReport(data.methodResult ?? undefined);
        setSelectedIds(current => current.filter(id => data.methodResult?.items.some(item => item.applicantId === id)));
      }
    } finally { setLoading(false); }
  }, [filters, vacancyId]);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => { void getAllEmployees({ name: "", pageNo: 1, records: 100, departmentId: [], gender: [], employmentStatus: "Active" }).then(({ data }) => { if (data.success) setReviewers((data.methodResults ?? []).map(item => ({ userId: item.userId, fullName: item.fullName || item.email || item.userId }))); }).catch(() => setReviewers([])); }, []);
  const selectedItems = useMemo(() => report?.items.filter(item => selectedIds.includes(item.applicantId)) ?? [], [report, selectedIds]);
  const toggleSelected = (applicantId: string) => setSelectedIds(current => current.includes(applicantId) ? current.filter(id => id !== applicantId) : [...current, applicantId]);
  const runBulk = async () => {
    if (!selectedItems.length) return;
    const parsedScore = Number(score);
    if (!Number.isFinite(parsedScore) || parsedScore < 0 || parsedScore > 100) { setFeedback("Enter a score from 0 to 100."); return; }
    if (decision === "Reject" && !rejectionReason.trim()) { setFeedback("A rejection reason is required for bulk rejection."); return; }
    setBulkBusy(true); setFeedback(undefined);
    try {
      const { data } = await bulkRecruitmentScreening({ items: selectedItems.map(item => ({ applicantId: item.applicantId, vacancyId: item.vacancyId })), decision, score: parsedScore, criteria: [{ name: "Bulk recruiter review", passed: decision === "Pass", notes: "Bulk screening action" }], rejectionReason: rejectionReason.trim() || null, idempotencyKey: createIdempotencyKey() });
      const result = data.methodResult;
      setFeedback(data.message || `Processed ${result?.succeeded ?? 0} candidate(s).`);
      setSelectedIds(result?.failedApplicantIds ?? []);
      await load();
    } catch (error) { setFeedback((error as Error).message || "Bulk screening failed."); }
    finally { setBulkBusy(false); }
  };
  const items = report?.items ?? [];
  return <Card sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}><Stack spacing={1.25}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}><Box><Typography variant="subtitle1" fontWeight={800}>Screening queue</Typography><Typography variant="caption" color="text.secondary">Pending applications ordered by SLA age.</Typography></Box><Stack direction="row" spacing={.75} alignItems="center"><Chip size="small" label={`${report?.totalPending ?? 0} pending`} color="primary" /><Chip size="small" label={`${report?.overdueCount ?? 0} overdue`} color={(report?.overdueCount ?? 0) > 0 ? "warning" : "default"} /><AppButton size="small" variant="outlined" startIcon={<RefreshRounded />} onClick={() => void load()} disabled={loading}>Refresh</AppButton></Stack></Stack>
    <Divider /><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField select size="small" label="Reviewer" value={filters.reviewerUserId} onChange={(event) => setFilters(current => ({ ...current, reviewerUserId: event.target.value }))} helperText={reviewers.length ? "Active employees only" : "Reviewer directory unavailable; use filters"} sx={{ flex: 1 }}><MenuItem value="">All active reviewers</MenuItem>{reviewers.map(reviewer => <MenuItem key={reviewer.userId} value={reviewer.userId}>{reviewer.fullName} · {reviewer.userId}</MenuItem>)}</TextField><TextField size="small" label="Min score" type="number" inputProps={{ min: 0, max: 100 }} value={filters.minScore} onChange={(event) => setFilters(current => ({ ...current, minScore: event.target.value }))} sx={{ width: { xs: "100%", sm: 120 } }} /><TextField size="small" label="Max score" type="number" inputProps={{ min: 0, max: 100 }} value={filters.maxScore} onChange={(event) => setFilters(current => ({ ...current, maxScore: event.target.value }))} sx={{ width: { xs: "100%", sm: 120 } }} /><TextField size="small" label="Submitted after" type="date" InputLabelProps={{ shrink: true }} value={filters.submittedAfterUtc} onChange={(event) => setFilters(current => ({ ...current, submittedAfterUtc: event.target.value }))} sx={{ flex: 1 }} /><TextField size="small" label="Submitted before" type="date" InputLabelProps={{ shrink: true }} value={filters.submittedBeforeUtc} onChange={(event) => setFilters(current => ({ ...current, submittedBeforeUtc: event.target.value }))} sx={{ flex: 1 }} /></Stack>
    {items.length > 0 && <><Divider /><Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems={{ sm: "center" }}><TextField select size="small" label="Bulk decision" value={decision} onChange={event => setDecision(event.target.value as typeof decision)} sx={{ minWidth: { sm: 150 } }}><MenuItem value="Pass">Pass</MenuItem><MenuItem value="Hold">Hold</MenuItem><MenuItem value="Reject">Reject</MenuItem></TextField><TextField size="small" type="number" label="Score" inputProps={{ min: 0, max: 100 }} value={score} onChange={event => setScore(event.target.value)} sx={{ width: { xs: "100%", sm: 110 } }} /><TextField size="small" label="Rejection reason" value={rejectionReason} onChange={event => setRejectionReason(event.target.value)} disabled={decision !== "Reject"} sx={{ flex: 1 }} /><AppButton size="small" variant="contained" onClick={() => void runBulk()} disabled={bulkBusy || !selectedItems.length}>{bulkBusy ? "Applying…" : `Apply to ${selectedItems.length || "selected"}`}</AppButton></Stack>{feedback && <Alert severity={feedback.toLowerCase().includes("failed") || feedback.toLowerCase().includes("required") ? "error" : "info"}>{feedback}</Alert>}</>}
    <Divider />{items.length ? <Stack spacing={.75}>{items.slice(0, 8).map(item => <Stack key={item.applicantId} direction="row" spacing={1} alignItems="center" sx={{ p: 1, borderRadius: 1.5, bgcolor: item.overdue ? "rgba(237,108,2,.08)" : "action.hover" }}><Checkbox size="small" checked={selectedIds.includes(item.applicantId)} onChange={() => toggleSelected(item.applicantId)} inputProps={{ "aria-label": `Select ${item.applicantName}` }} /><Box sx={{ flex: 1, minWidth: 0, cursor: onApplicantSelect ? "pointer" : "default" }} onClick={() => onApplicantSelect?.(item.applicantId)}><Typography variant="body2" fontWeight={700} noWrap>{item.applicantName}</Typography><Typography variant="caption" color="text.secondary" noWrap>{item.email || "No email"} · {item.decision}</Typography></Box><Chip size="small" label={`${Math.round(item.ageHours)}h`} color={item.overdue ? "warning" : "default"} /></Stack>)}</Stack> : <Alert severity="success">No pending screening reviews.</Alert>}
  </Stack></Card>;
}