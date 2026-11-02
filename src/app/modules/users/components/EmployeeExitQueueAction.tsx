import { ArrowForwardRounded, AssignmentTurnedInOutlined, SearchRounded } from "@mui/icons-material";
import { Alert, Box, Chip, InputAdornment, LinearProgress, Pagination, Stack, TextField, Typography } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AppButton } from "../../../shared/components/ui";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { EmployeeExitQueueItem, getEmployeeExitQueue } from "../../employees/employeeServices";
import { useAppSelector } from "../../../Redux/hooks";
import { canAccessHrManagement } from "../../../../utils/common";

const formatDate = (value: string) => new Intl.DateTimeFormat(undefined, { day: "numeric", month: "short", year: "numeric" }).format(new Date(value));
const statusTone = (status: string) => status === "PendingManagerApproval" || status === "PendingHrApproval" || status === "AwaitingEmployeeNoticeOffer" ? "warning" : status === "NoticePeriod" ? "info" : "default";
const REMINDER_COOLDOWN_MS = 3 * 24 * 60 * 60 * 1000;

export const EmployeeExitQueueAction = ({ showButton = true }: { showButton?: boolean }) => {
  const [open, setOpen] = useState(false); const [items, setItems] = useState<EmployeeExitQueueItem[]>([]); const [totalRecords, setTotalRecords] = useState(0); const [loading, setLoading] = useState(false); const [search, setSearch] = useState(""); const [status, setStatus] = useState("All"); const [page, setPage] = useState(1); const [isReviewer, setIsReviewer] = useState<boolean | null>(null);
  const reminderOpened = useRef(false);
  const navigate = useNavigate();
  const roleType = useAppSelector((state) => state.user.userData?.roleType);
  const isHrOrAdmin = canAccessHrManagement(roleType);
  const permissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasOffboarding = permissions.some((p) => p.startsWith("Offboarding."));
  const statuses = useMemo(() => ["All", ...Array.from(new Set(items.map(item => item.status)))], [items]);
  const pageSize = 25;
  const pageCount = Math.max(1, Math.ceil(totalRecords / pageSize));
  const visibleItems = items;
  const reviewCount = items.filter(item => item.status === "PendingManagerApproval" || item.status === "PendingHrApproval").length;
  const loadQueue = async (nextPage: number, nextSearch: string, nextStatus: string) => { const response = await getEmployeeExitQueue({ page: nextPage, pageSize, search: nextSearch, status: nextStatus }); if (!response.data.success) throw new Error(response.data.message || "Unable to load offboarding cases."); setItems(response.data.methodResult ?? []); setTotalRecords(response.data.totalRecords ?? 0); };
  useEffect(() => {
    if (!hasOffboarding) { setItems([]); setIsReviewer(null); return; }
    let cancelled = false;
    void getEmployeeExitQueue().then(response => {
      if (!cancelled && response.data.success) {
        const queue = response.data.methodResult ?? [];
        setItems(queue);
        setTotalRecords(response.data.totalRecords ?? queue.length);
        setIsReviewer(isHrOrAdmin || queue.length > 0);
        const reminderKey = "codeji:offboarding-reminder:last-shown";
        const lastShown = Number(localStorage.getItem(reminderKey) || 0);
        if (!reminderOpened.current && queue.length > 0 && Date.now() - lastShown >= REMINDER_COOLDOWN_MS) {
          reminderOpened.current = true;
          localStorage.setItem(reminderKey, String(Date.now()));
          setOpen(true);
        }
      }
    }).catch(() => { if (!cancelled) setIsReviewer(false); });
    return () => { cancelled = true; };
  }, [hasOffboarding, isHrOrAdmin, navigate]);
  const show = async () => { setOpen(true); setLoading(true); try { setPage(1); await loadQueue(1, search, status); } catch (error) { setOpen(false); toast.error(error instanceof Error ? error.message : "Unable to load offboarding cases."); } finally { setLoading(false); } };
  const refreshQueue = async (nextPage: number, nextSearch: string, nextStatus: string) => { setPage(nextPage); setLoading(true); try { await loadQueue(nextPage, nextSearch, nextStatus); } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to load offboarding cases."); } finally { setLoading(false); } };
  const openCase = (item: EmployeeExitQueueItem) => { setOpen(false); navigate(`/employees/${item.employeeUserId}/about`); };
  if (!hasOffboarding || isReviewer !== true) return null;
  return <>
    {showButton && <AppButton fullWidth variant="outlined" size="small" startIcon={<AssignmentTurnedInOutlined />} onClick={() => void show()} sx={{ minHeight: 42, justifyContent: "center", borderRadius: 2, fontWeight: 800, whiteSpace: "nowrap", borderColor: "primary.light", bgcolor: "background.paper", transition: "background-color 160ms ease, border-color 160ms ease, transform 160ms ease", "&:hover": { borderColor: "primary.main", bgcolor: "primary.lighter", transform: "translateY(-1px)" }, "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 } }}>Offboarding cases</AppButton>}
    <CustomisedModal open={open} handleClose={() => setOpen(false)} title={<Stack spacing={.25}><Typography variant="h6" fontWeight={800}>Offboarding reminders</Typography><Typography variant="caption" color="text.secondary">Active resignation cases requiring manager, HR or administrator attention.</Typography></Stack>} maxWidth="md" fullWidth allowMaximize paperSx={{ width: { xs: "calc(100% - 20px)", md: 860 }, maxWidth: "calc(100% - 20px)", borderRadius: { xs: 2.5, sm: 3 } }} contentSx={{ px: { xs: 1.5, sm: 2.5 }, pb: 2.5 }}>
      <Stack spacing={2} sx={{ pt: .75 }}>
        <Alert severity="info">This reminder appears every 3 days while active resignation cases remain in your review scope. Close it now and it will reappear after the next reminder interval.</Alert>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25}><Box sx={{ flex: 1, p: 1.5, borderRadius: 2.5, bgcolor: "primary.lighter", color: "primary.darker" }}><Typography variant="caption" fontWeight={800}>ACTIVE CASES</Typography><Typography variant="h5" fontWeight={850}>{items.length}</Typography></Box><Box sx={{ flex: 1, p: 1.5, borderRadius: 2.5, bgcolor: reviewCount ? "warning.lighter" : "action.hover", color: reviewCount ? "warning.darker" : "text.primary" }}><Typography variant="caption" fontWeight={800}>AWAITING REVIEW</Typography><Typography variant="h5" fontWeight={850}>{reviewCount}</Typography></Box><Box sx={{ flex: 2, p: 1.5, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}><Typography variant="body2" fontWeight={750}>Your review queue</Typography><Typography variant="caption" color="text.secondary">Open a case to continue in the employee profile. Access is checked again there.</Typography></Box></Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}><TextField size="small" fullWidth value={search} onChange={event => { const value = event.target.value; setSearch(value); void refreshQueue(1, value, status); }} placeholder="Search employee, ID or department" InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }} /> <Stack direction="row" spacing={.75} sx={{ overflowX: "auto", pb: .25 }}>{statuses.map(value => <Chip key={value} label={value === "All" ? "All cases" : value.replace(/([A-Z])/g, " $1").trim()} onClick={() => { setStatus(value); void refreshQueue(1, search, value); }} color={status === value ? "primary" : "default"} variant={status === value ? "filled" : "outlined"} />)}</Stack></Stack>
        {loading && <LinearProgress sx={{ borderRadius: 2 }} />}
        {!loading && visibleItems.length === 0 && <Box sx={{ textAlign: "center", py: 5, border: "1px dashed", borderColor: "divider", borderRadius: 3 }}><AssignmentTurnedInOutlined color="disabled" sx={{ fontSize: 34, mb: .75 }} /><Typography fontWeight={700}>{items.length ? "No cases match the current filters" : "No active cases are assigned to you"}</Typography><Typography variant="body2" color="text.secondary">Active cases will appear here when they require your review.</Typography></Box>}
        <Stack spacing={1}>{visibleItems.map(item => <Box key={item.employeeExitId} role="button" tabIndex={0} onClick={() => openCase(item)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openCase(item); } }} sx={{ p: { xs: 1.35, sm: 1.7 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5, cursor: "pointer", transition: "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease", "&:hover, &:focus-visible": { borderColor: "primary.main", boxShadow: "0 10px 24px rgba(20, 84, 92, .12)", transform: "translateY(-1px)", outline: "none" } }}><Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} justifyContent="space-between" spacing={.75}><Box sx={{ minWidth: 0, width: "100%" }}><Typography fontWeight={800} noWrap>{item.employeeName}</Typography><Typography variant="caption" color="text.secondary" sx={{ display: "block", overflowWrap: "anywhere" }}>{item.employeeId || "Employee"}{item.departmentId ? `  |  ${item.departmentId}` : ""}</Typography></Box><Chip size="small" color={statusTone(item.status)} label={item.status.replace(/([A-Z])/g, " $1").trim()} sx={{ maxWidth: "100%" }} /></Stack><Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={.5} sx={{ mt: 1.25 }}><Typography variant="caption" color="text.secondary">Last working day: <strong>{formatDate(item.lastWorkingDate)}</strong></Typography><Stack direction="row" alignItems="center" spacing={.35}><Typography variant="caption" fontWeight={800}>{item.progressPercent}% complete</Typography><ArrowForwardRounded fontSize="small" color="primary" /></Stack></Stack><LinearProgress variant="determinate" value={item.progressPercent} sx={{ mt: .75, height: 7, borderRadius: 5, bgcolor: "action.selected", "& .MuiLinearProgress-bar": { borderRadius: 5 } }} /></Box>)}</Stack>
        {!loading && visibleItems.length > 0 && pageCount > 1 && <Stack alignItems="center" sx={{ pt: 1 }}><Pagination page={page} count={pageCount} onChange={(_, value) => void refreshQueue(value, search, status)} size="small" color="primary" showFirstButton showLastButton /></Stack>}
      </Stack>
    </CustomisedModal>
  </>;
};
