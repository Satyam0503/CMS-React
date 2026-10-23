import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { ManageAccountsOutlined } from "@mui/icons-material";
import {
  Alert,
  AppBar,
  Avatar,
  Button,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Toolbar,
  Typography,
} from "@mui/material";
import { toast } from "react-toastify";
import { changeEmployeeLifecycle, getEmployeeLifecycleHistory, getEmployeeLifecyclePolicies, EmployeeLifecyclePolicy } from "../employeeServices";
import { GetAllEmployeeResponseModel } from "../models";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";

type Props = { employee: GetAllEmployeeResponseModel; onSaved?: () => void };

const fallbackLifecyclePolicies: EmployeeLifecyclePolicy[] = [
  { eventType: "Working", requiresHrApproval: false, requiresReason: false, requiresExpectedReturnDate: false, defaultAvailabilityStatus: "Working", attendanceExpected: true, leaveRequestsAllowed: true, workFromHomeRequestsAllowed: true },
  ...["MedicalLeave", "MaternityLeave", "PaternityLeave", "LongTermLeave", "AdministrativeLeave"].map((eventType) => ({ eventType, requiresHrApproval: false, requiresReason: false, requiresExpectedReturnDate: false, defaultAvailabilityStatus: eventType, attendanceExpected: false, leaveRequestsAllowed: false, workFromHomeRequestsAllowed: false })),
  { eventType: "Sabbatical", requiresHrApproval: false, requiresReason: true, requiresExpectedReturnDate: true, defaultAvailabilityStatus: "Sabbatical", attendanceExpected: false, leaveRequestsAllowed: false, workFromHomeRequestsAllowed: false },
  { eventType: "UnauthorizedAbsence", requiresHrApproval: false, requiresReason: true, requiresExpectedReturnDate: false, defaultAvailabilityStatus: "UnauthorizedAbsence", attendanceExpected: false, leaveRequestsAllowed: false, workFromHomeRequestsAllowed: false },
  { eventType: "AbscondingUnderReview", requiresHrApproval: true, requiresReason: true, requiresExpectedReturnDate: false, defaultAvailabilityStatus: "AbscondingUnderReview", attendanceExpected: false, leaveRequestsAllowed: false, workFromHomeRequestsAllowed: false },
];

const leaveDrivenLifecycleStatuses = new Set(["MedicalLeave", "MaternityLeave", "PaternityLeave", "LongTermLeave", "Sabbatical"]);
const directLifecycleOptions: Array<[string, string]> = [
  ["Working", "Working"], ["AdministrativeLeave", "Administrative leave"],
  ["UnauthorizedAbsence", "Unauthorized absence"], ["AbscondingUnderReview", "Absconding under review"],
];

const EmployeeLifecycleDialog = ({ employee, onSaved }: Props) => {
  const isLifecycleAffected = employee.employmentStatus !== "Active"
    || employee.availabilityStatus !== "Working"
    || employee.accountStatus !== "Active"
    || employee.payrollStatus !== "Active";
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(employee.availabilityStatus ?? "Working");
  const [accountStatus, setAccountStatus] = useState(employee.accountStatus ?? "Active");
  const [payrollStatus, setPayrollStatus] = useState(employee.payrollStatus ?? "Active");
  const [alumniStatus, setAlumniStatus] = useState(employee.alumniStatus ?? "NotApplicable");
  const [returnDate, setReturnDate] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<Array<{ previousValue: string; newValue: string; reason?: string; reasonCode?: string; changedAtUtc: string }>>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [policies, setPolicies] = useState<EmployeeLifecyclePolicy[]>([]);

  useEffect(() => {
    if (!open) {
      setStatus(employee.availabilityStatus ?? "Working");
      setAccountStatus(employee.accountStatus ?? "Active");
      setPayrollStatus(employee.payrollStatus ?? "Active");
      setAlumniStatus(employee.alumniStatus ?? "NotApplicable");
    }
  }, [employee.availabilityStatus, employee.accountStatus, employee.payrollStatus, employee.alumniStatus, open]);

  useEffect(() => {
    if (!open) return;
    setHistoryLoading(true);
    getEmployeeLifecycleHistory(employee.userId)
      .then(({ data }) => setHistory(data.methodResults ?? []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [employee.userId, open]);

  useEffect(() => {
    if (!open) return;
    getEmployeeLifecyclePolicies().then(({ data }) => setPolicies(Array.isArray(data) ? data : [])).catch(() => setPolicies([]));
  }, [open]);

  const selectedPolicy = policies.find((policy) => policy.eventType === status) ?? fallbackLifecyclePolicies.find((policy) => policy.eventType === status);
  const isFallbackPolicy = selectedPolicy && !policies.some((policy) => policy.eventType === status);
  const currentLeaveDrivenStatus = leaveDrivenLifecycleStatuses.has(status);
  const lifecycleIsLeaveOwned = leaveDrivenLifecycleStatuses.has(employee.availabilityStatus ?? "");

  const save = async () => {
    setSaving(true);
    try {
      const { data } = await changeEmployeeLifecycle({
        employeeUserId: employee.userId,
        availabilityStatus: status,
        accountStatus,
        payrollStatus,
        alumniStatus,
        version: employee.lifecycleVersion ?? 0,
        effectiveFromUtc: new Date().toISOString(),
        expectedReturnDate: returnDate || null,
        reasonCode: status.toUpperCase(),
        reason: reason.trim() || undefined,
      });
      if (!data.success) throw new Error(data.message ?? "Unable to update lifecycle");
      toast.success("Employee availability updated");
      setOpen(false);
      onSaved?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update lifecycle");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<ManageAccountsOutlined sx={{ fontSize: 17 }} />}
        aria-label={`Manage lifecycle for ${employee.fullName}`}
        onClick={(event) => { event.stopPropagation(); setOpen(true); }}
        onKeyDown={(event) => event.stopPropagation()}
        sx={{
          minWidth: 0,
          minHeight: 32,
          px: 1.25,
          py: 0.5,
          borderRadius: 1.5,
          textTransform: "none",
          fontSize: "0.75rem",
          fontWeight: 700,
          whiteSpace: "nowrap",
          lineHeight: 1.2,
          flexShrink: 0,
          borderWidth: isLifecycleAffected ? 2 : 1,
          borderColor: isLifecycleAffected ? "warning.main" : "primary.main",
          color: isLifecycleAffected ? "warning.dark" : "primary.main",
          backgroundColor: isLifecycleAffected ? "rgba(255, 248, 235, 0.9)" : "transparent",
          boxShadow: isLifecycleAffected ? "0 0 0 2px rgba(237, 160, 54, 0.12)" : "none",
          transition: "transform .2s ease, box-shadow .2s ease, background-color .2s ease",
          "&:hover": {
            borderColor: isLifecycleAffected ? "warning.dark" : "primary.dark",
            backgroundColor: isLifecycleAffected ? "rgba(255, 243, 224, 1)" : "action.hover",
            transform: "translateY(-1px)",
            boxShadow: "0 5px 14px rgba(33, 93, 110, .12)",
          },
          "@media (prefers-reduced-motion: reduce)": { transition: "none", "&:hover": { transform: "none" } },
        }}
      >
        Manage lifecycle
      </Button>
      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm" scroll="paper" BackdropProps={{ sx: { backgroundColor: "rgba(15, 30, 38, .52)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" } }} PaperProps={{ sx: { width: { xs: "calc(100% - 24px)", sm: "100%" }, maxWidth: { xs: "calc(100% - 24px)", sm: 600 }, maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100dvh - 48px)" }, borderRadius: { xs: 2.5, sm: 3 }, overflow: "hidden", boxShadow: "0 24px 70px rgba(15, 42, 58, .24)", animation: "employeeLifecycleDialogIn .28s cubic-bezier(.2,.8,.2,1)", "@keyframes employeeLifecycleDialogIn": { from: { opacity: 0, transform: "translateY(14px) scale(.985)" }, to: { opacity: 1, transform: "translateY(0) scale(1)" } }, "@media (prefers-reduced-motion: reduce)": { animation: "none" } } }}>
        <AppBar position="static" color="transparent" elevation={0}>
          <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.25, sm: 1.5 }, minHeight: { xs: 64, sm: 72 }, borderBottom: 1, borderColor: "divider", gap: 1.5 }}>
            <Avatar src={employee.fullProfileUrl ?? undefined} alt="" sx={{ width: { xs: 34, sm: 40 }, height: { xs: 34, sm: 40 }, border: "2px solid", borderColor: "primary.light" }}>{employee.fullName?.charAt(0)}</Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <DialogTitle sx={{ p: 0, fontSize: { xs: "1rem", sm: "1.15rem" }, fontWeight: 800 }}>Manage employee lifecycle</DialogTitle>
              <Typography variant="caption" color="text.secondary" noWrap>{employee.fullName}</Typography>
            </Box>
          </Toolbar>
        </AppBar>
        <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 }, bgcolor: "background.default" }}>
          <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ pt: 0 }}>
            <Alert severity="info" sx={{ borderRadius: 2, alignItems: "flex-start", "& .MuiAlert-message": { minWidth: 0 } }}>
              Availability, account access, and payroll are managed here. Employment status, EmployeeExit, payroll closure, and former-portal access remain separate workflow controls.
            </Alert>
            <FormControl fullWidth>
              <InputLabel id={`lifecycle-status-${employee.userId}`}>Availability</InputLabel>
              <Select labelId={`lifecycle-status-${employee.userId}`} value={status} label="Availability" onChange={(event) => setStatus(event.target.value)}>
                {currentLeaveDrivenStatus && <MenuItem value={status} disabled>{status.replace(/([a-z])([A-Z])/g, "$1 $2")} (managed by Leave Management)</MenuItem>}
                {directLifecycleOptions.map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
              </Select>
            </FormControl>
            {currentLeaveDrivenStatus && <Alert severity="info" sx={{ borderRadius: 2 }}>This absence is managed from Leave Management. HR can review the linked case here; lifecycle status changes require an approved request and policy.</Alert>}
            {selectedPolicy && (
              <Alert severity="info" sx={{ borderRadius: 2, "& .MuiAlert-message": { minWidth: 0 } }}>
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.25 }}>
                  Policy guidance for {status.replace(/([a-z])([A-Z])/g, "$1 $2")}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {isFallbackPolicy ? "Using standard guidance while company policy is loading. " : ""}
                  {selectedPolicy.requiresHrApproval ? "HR approval required. " : "No HR approval required. "}
                  {selectedPolicy.requiresExpectedReturnDate ? "A return date is required. " : "Return date is optional. "}
                  {selectedPolicy.leaveRequestsAllowed ? "Leave requests allowed. " : "Leave requests disabled. "}
                  {selectedPolicy.workFromHomeRequestsAllowed ? "WFH allowed." : "WFH disabled."}
                </Typography>
              </Alert>
            )}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <FormControl fullWidth>
                <InputLabel id={`lifecycle-account-${employee.userId}`}>Account access</InputLabel>
                  <Select labelId={`lifecycle-account-${employee.userId}`} value={accountStatus} label="Account access" disabled={lifecycleIsLeaveOwned} onChange={(event) => setAccountStatus(event.target.value)}>
                  {["Active", "Locked", "Limited", "TemporarilyDisabled", "Suspended", "Closed"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel id={`lifecycle-payroll-${employee.userId}`}>Payroll</InputLabel>
                <Select labelId={`lifecycle-payroll-${employee.userId}`} value={payrollStatus} label="Payroll" disabled={lifecycleIsLeaveOwned} onChange={(event) => setPayrollStatus(event.target.value)}>
                  {["Active", "Hold", "Paused", "FinalSettlement", "Closed"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </Select>
              </FormControl>
            </Stack>
            {lifecycleIsLeaveOwned && <Alert severity="info" sx={{ borderRadius: 2 }}>Account and payroll controls are temporarily locked because Leave Management owns this active leave case. Change them from the linked lifecycle case or leave decision.</Alert>}
            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" aria-label="Workflow statuses" sx={{ p: { xs: 1, sm: 1.25 }, borderRadius: 2, bgcolor: "action.hover" }}>
              <Chip size="small" variant="outlined" label={`Employment: ${employee.employmentStatus ?? "Active"}`} />
              <Chip size="small" variant="outlined" label={`Offboarding: ${employee.offboardingStatus ?? "None"}`} />
              <Chip size="small" variant="outlined" label={`Former portal: ${employee.formerPortalStatus ?? "NotEligible"}`} />
              <Chip size="small" variant="outlined" label={`Alumni: ${alumniStatus}`} />
            </Stack>
                  {employee.employmentStatus && ["Resigned", "Terminated", "Retired", "ContractEnded", "Deceased"].includes(employee.employmentStatus) && (
              <FormControl fullWidth>
                <InputLabel id={`lifecycle-alumni-${employee.userId}`}>Alumni relationship</InputLabel>
                    <Select labelId={`lifecycle-alumni-${employee.userId}`} value={alumniStatus} label="Alumni relationship" disabled={employee.employmentStatus === "Deceased"} onChange={(event) => setAlumniStatus(event.target.value)}>
                  {["Eligible", "Invited", "Member", "OptedOut", "Blocked"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}
                </Select>
                  </FormControl>
                )}
            {employee.availabilityStatus && employee.availabilityStatus !== "Working" && !currentLeaveDrivenStatus && (
              <Alert
                severity="success"
                action={<Button color="inherit" size="small" onClick={() => { setStatus("Working"); setReturnDate(""); }} sx={{ fontWeight: 650, letterSpacing: "0.01em", whiteSpace: "nowrap", px: { xs: 0.75, sm: 1 } }}>Resume Work</Button>}
              >
                Currently marked as {employee.availabilityStatus.replace(/([a-z])([A-Z])/g, "$1 $2")}.
                Resume Work records the employee as working and clears the planned return date.
              </Alert>
            )}
            {!currentLeaveDrivenStatus && <CustomisedDatePicker
              label="Expected return date"
              value={returnDate ? dayjs(returnDate) : null}
              setValue={(value) => setReturnDate(value?.isValid() ? value.format("YYYY-MM-DD") : "")}
              minDate={dayjs().startOf("day")}
              format="DD-MM-YYYY"
              sx={{ "& .MuiFormHelperText-root": { mx: 0 } }}
            />}
            {!currentLeaveDrivenStatus && <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: "-0.25rem", mb: 0.25, lineHeight: 1.35 }}>
              {status === "Sabbatical" ? "Required for sabbatical." : "Optional for temporary absence."}
            </Typography>}
            {!currentLeaveDrivenStatus && <TextField fullWidth multiline minRows={3} label="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />}
            {currentLeaveDrivenStatus && <Alert severity="info" sx={{ borderRadius: 2 }}>Expected return date and reason are managed by Leave Management. Update the approved leave request there.</Alert>}
            <Typography variant="subtitle2">Lifecycle history</Typography>
            {historyLoading ? <Typography variant="body2" color="text.secondary">Loading history…</Typography> : history.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No lifecycle changes recorded yet.</Typography>
            ) : (
              <Stack spacing={1} role="list" aria-label="Lifecycle history" sx={{ maxHeight: { xs: 180, sm: 220 }, overflowY: "auto", pr: 0.5 }}>
                {[...history].reverse().slice(0, 8).map((entry, index) => (
                  <Stack key={`${entry.changedAtUtc}-${index}`} role="listitem" spacing={0.25} sx={{ borderLeft: 2, borderColor: "divider", pl: 1.5 }}>
                    <Typography variant="body2">{entry.previousValue || "—"} → {entry.newValue}</Typography>
                    <Typography variant="caption" color="text.secondary">{new Date(entry.changedAtUtc).toLocaleString()} · {entry.reason || entry.reasonCode || "Lifecycle update"}</Typography>
                  </Stack>
                ))}
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: { xs: 1.5, sm: 2 }, flexWrap: "wrap", gap: 1, borderTop: 1, borderColor: "divider", bgcolor: "background.paper", "& > button": { minHeight: 42, borderRadius: 1.75, fontWeight: 800 } }}>
          <Button onClick={() => setOpen(false)} disabled={saving} sx={{ flex: { xs: 1, sm: "0 0 auto" } }}>Cancel</Button>
          <Button variant="contained" onClick={save} disabled={saving || currentLeaveDrivenStatus || (status === "Sabbatical" && !returnDate)} sx={{ flex: { xs: 1, sm: "0 0 auto" } }}>{saving ? "Saving…" : "Save status"}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export { EmployeeLifecycleDialog };
