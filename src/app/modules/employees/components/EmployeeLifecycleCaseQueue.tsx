import { useCallback, useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { AssignmentLateOutlined, DownloadOutlined, FactCheckOutlined, VisibilityOutlined } from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  EmployeeLifecycleCase,
  EmployeeLifecycleCaseSummary,
  getEmployeeLifecycleCaseSummary,
  getEmployeeLifecycleCases,
  downloadEmployeeLifecycleCaseEvidence,
  updateEmployeeLifecycleCase,
  uploadEmployeeLifecycleCaseEvidence,
  verifyEmployeeLifecycleCaseEvidence,
} from "../employeeServices";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";

const label = (value: string) => value.replace(/([a-z])([A-Z])/g, "$1 $2");
const evidenceIdOf = (evidence: { evidenceId?: string; evidenceID?: string; evidenceIdLegacy?: string; EvidenceId?: string; EvidenceID?: string; id?: string; _id?: string }) => evidence.evidenceId || evidence.evidenceID || evidence.evidenceIdLegacy || evidence.EvidenceId || evidence.EvidenceID || evidence.id || evidence._id || "";

export const EmployeeLifecycleCaseQueue = () => {
  const [cases, setCases] = useState<EmployeeLifecycleCase[]>([]);
  const [selected, setSelected] = useState<EmployeeLifecycleCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [extensionDate, setExtensionDate] = useState("");
  const [accountStatus, setAccountStatus] = useState("");
  const [payrollStatus, setPayrollStatus] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [summary, setSummary] = useState<EmployeeLifecycleCaseSummary | null>(
    null,
  );
  const [error, setError] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    getEmployeeLifecycleCases(undefined, statusFilter || undefined, overdueOnly)
      .then(({ data }) => setCases(Array.isArray(data) ? data : []))
      .catch(() => {
        setCases([]);
        setError(true);
      })
      .finally(() => setLoading(false));
    getEmployeeLifecycleCaseSummary()
      .then(({ data }) => setSummary(data ?? null))
      .catch(() => setSummary(null));
  }, [statusFilter, overdueOnly]);
  useEffect(() => {
    void load();
  }, [load]);

  const complete = async () => {
    if (!selected) return;
    try {
      const { data } = await updateEmployeeLifecycleCase({
        caseId: selected.caseId,
        status: "Completed",
        actualReturnDate: new Date().toISOString(),
        comment: "Return to work confirmed",
      });
      setSelected(null);
      if (data) load();
      toast.success("Return to work recorded");
    } catch {
      toast.error("Unable to update lifecycle case");
    }
  };
  const upload = async (file?: File) => {
    if (!selected || !file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Evidence must be 10 MB or smaller");
      return;
    }
    try {
      const { data } = await uploadEmployeeLifecycleCaseEvidence(selected.caseId, file);
      toast.success("Evidence uploaded");
      if (data) setSelected(data);
      load();
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(message || "Unable to upload evidence");
    }
  };
  const verify = async (evidenceId: string, verified: boolean) => {
    if (!selected) return;
    try {
      const { data } = await verifyEmployeeLifecycleCaseEvidence({
        caseId: selected.caseId,
        evidenceId,
        verified,
      });
      if (data) setSelected(data);
      load();
      toast.success(verified ? "Evidence verified" : "Evidence rejected");
    } catch {
      toast.error("Unable to update evidence");
    }
  };
  const extend = async () => {
    if (!selected || !extensionDate) return;
    try {
      const { data } = await updateEmployeeLifecycleCase({
        caseId: selected.caseId,
        status: "Extended",
        expectedReturnDate: extensionDate,
        comment: "Expected return date extended by HR",
      });
      if (data) setSelected(data);
      setExtensionDate("");
      load();
      toast.success("Case extended");
    } catch {
      toast.error("Unable to extend case");
    }
  };
  const openEvidence = async (evidenceId: string, fileName: string, download = false) => {
    if (!selected || !evidenceId) { toast.error("Evidence identifier is missing. Refresh the case and try again."); return; }
    try {
      const { data } = await downloadEmployeeLifecycleCaseEvidence(selected.caseId, evidenceId);
      const url = URL.createObjectURL(data);
      if (download) {
        const anchor = document.createElement("a"); anchor.href = url; anchor.download = fileName; anchor.click();
      } else {
        window.open(url, "_blank", "noopener,noreferrer");
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      toast.error("Unable to open evidence. Please try again.");
    }
  };
  const updateCaseControls = async () => {
    if (!selected || (!accountStatus && !payrollStatus)) return;
    try {
      const { data } = await updateEmployeeLifecycleCase({
        caseId: selected.caseId,
        status: selected.status,
        ...(accountStatus ? { accountStatus: accountStatus as "Active" | "TemporarilyDisabled" } : {}),
        ...(payrollStatus ? { payrollStatus: payrollStatus as "Active" | "Hold" | "Paused" } : {}),
        comment: "Case controls updated by HR",
      });
      if (data) setSelected(data);
      setAccountStatus(""); setPayrollStatus("");
      load();
      toast.success("Case controls updated");
    } catch {
      toast.error("Unable to update case controls");
    }
  };

  const isCancelled = selected?.status === "Cancelled";
  const hasEvidence = Boolean(selected?.evidence?.length);
  const hasPendingEvidence = Boolean(selected?.evidence?.some((item) => item.status === "PendingVerification"));
  const canConfirmReturn = Boolean(selected && !isCancelled && selected.documentsVerified && !hasPendingEvidence);
  const verificationStep = !hasEvidence ? 0 : selected?.documentsVerified ? 2 : 1;

  return (
    <Card
      sx={{
        mb: { xs: 2, md: 3 },
        p: { xs: 2, sm: 2.5 },
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 3,
        boxShadow: "none",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        gap={1.5}
        alignItems={{ sm: "center" }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <AssignmentLateOutlined color="warning" />
          <Box>
            <Typography variant="h6" fontWeight={800}>
              Lifecycle cases
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Medical, family, sabbatical, and long-term absence tracking
            </Typography>
          </Box>
        </Stack>
        <Chip
          size="small"
          color={cases.length ? "warning" : "default"}
          label={
            loading
              ? "Loading…"
              : `${cases.length} case${cases.length === 1 ? "" : "s"}`
          }
        />
      </Stack>
      <Divider sx={{ my: 2 }} />
      {summary && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              md: "repeat(4, minmax(0, 1fr))",
            },
            gap: 1,
            mb: 2,
          }}
        >
          {[
            [`${summary.active} active`, "warning"],
            [`${summary.pendingDocuments} documents pending`, "default"],
            [
              `${summary.overdueReturns} overdue`,
              summary.overdueReturns ? "error" : "default",
            ],
            [`${summary.upcomingReturns} returns in 30 days`, "default"],
          ].map(([text, color]) => (
            <Chip
              key={text}
              size="small"
              label={text}
              color={color as "warning" | "error" | "default"}
              sx={{ width: "100%", height: 38, justifyContent: "flex-start" }}
            />
          ))}
        </Box>
      )}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "minmax(220px, 1fr) auto" },
          gap: 1,
          mb: 2,
          alignItems: "center",
        }}
      >
        <FormControl size="small" fullWidth>
          <InputLabel>Case status</InputLabel>
          <Select
            label="Case status"
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
          >
            <MenuItem value="">All cases</MenuItem>
            {[
              "Open",
              "UnderReview",
              "Active",
              "Extended",
              "Completed",
              "Cancelled",
            ].map((value) => (
              <MenuItem key={value} value={value}>
                {label(value)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <Button
          variant={overdueOnly ? "contained" : "outlined"}
          color={overdueOnly ? "error" : "inherit"}
          onClick={() => setOverdueOnly((value) => !value)}
          sx={{ minHeight: 40, whiteSpace: "nowrap" }}
        >
          Overdue returns
        </Button>
      </Box>
      {error && !loading && (
        <Alert severity="warning" sx={{ mb: 1.5 }}>
          Lifecycle cases could not be loaded. Try again later.
        </Alert>
      )}
      {!error && !loading && cases.length === 0 && (
        <Alert severity="success">
          No lifecycle cases require review for the selected filters.
        </Alert>
      )}
      <Stack
        spacing={1}
        sx={{
          maxHeight: { xs: 420, md: 520 },
          overflowY: "auto",
          pr: { md: 0.5 },
        }}
      >
        {cases.map((item) => (
          <Button
            key={item.caseId}
            onClick={() => setSelected(item)}
            variant="outlined"
            sx={{
              justifyContent: "space-between",
              textAlign: "left",
              textTransform: "none",
              borderRadius: 2,
              p: 1.25,
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography fontWeight={750} noWrap>
                {label(item.lifecycleStatus)}
              </Typography>
              <Typography
                variant="caption"
                color={item.isReturnOverdue ? "error.main" : "text.secondary"}
              >
                {item.effectiveFromUtc
                  ? new Date(item.effectiveFromUtc).toLocaleDateString()
                  : "Date pending"}{" "}
                ·{" "}
                {item.isReturnOverdue
                  ? "Return overdue"
                  : item.documentsVerified
                    ? "Documents verified"
                    : "Documents pending"}
              </Typography>
            </Box>
            <Chip
              size="small"
              label={item.isReturnOverdue ? "Overdue" : label(item.status)}
              color={
                item.isReturnOverdue
                  ? "error"
                  : item.status === "Completed"
                    ? "success"
                    : "warning"
              }
            />
          </Button>
        ))}
      </Stack>
      <Dialog
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        fullWidth
        maxWidth="sm"
        BackdropProps={{
          sx: {
            backgroundColor: "rgba(15, 30, 38, .52)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
          },
        }}
        PaperProps={{
          sx: {
            width: "calc(100% - 24px)",
            maxWidth: 620,
            maxHeight: "calc(100dvh - 32px)",
            borderRadius: { xs: 2.5, sm: 3 },
            overflow: "hidden",
            animation:
              "employeeLifecycleDialogIn .28s cubic-bezier(.2,.8,.2,1)",
            "@keyframes employeeLifecycleDialogIn": {
              from: { opacity: 0, transform: "translateY(14px) scale(.985)" },
              to: { opacity: 1, transform: "translateY(0) scale(1)" },
            },
            "@media (prefers-reduced-motion: reduce)": { animation: "none" },
          },
        }}
      >
        <DialogTitle
          sx={{
            px: { xs: 2, sm: 3 },
            py: 2,
            fontWeight: 800,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          Lifecycle case details
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 2.5 } }}
        >
          {selected && (
            <Stack spacing={2}>
              <Box sx={{ p: { xs: 1.25, sm: 1.5 }, borderRadius: 2.5, border: "1px solid", borderColor: "primary.light", bgcolor: "rgba(41, 142, 137, .045)" }}>
                <Stack direction="row" spacing={1.25} alignItems="flex-start" sx={{ minWidth: 0 }}>
                  <Avatar src={selected.employeeProfileUrl || undefined} alt="" sx={{ width: 42, height: 42, bgcolor: "primary.main", fontWeight: 800, flexShrink: 0 }}>{(selected.employeeName || "E").charAt(0).toUpperCase()}</Avatar>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography variant="h6" fontWeight={800} sx={{ lineHeight: 1.2, overflowWrap: "anywhere" }}>{selected.employeeName || "Employee details unavailable"}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: .35, overflowWrap: "anywhere" }}>{selected.employeeId || "Employee ID unavailable"} · {selected.employeeJobRole || "Role not recorded"}</Typography>
                  </Box>
                  <Chip size="small" label={selected.employeeEmploymentStatus || "Active"} color="success" variant="outlined" sx={{ flexShrink: 0 }} />
                </Stack>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: .5, mt: 1.25, pt: 1.1, borderTop: "1px solid", borderColor: "rgba(41, 142, 137, .18)" }}>
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}><strong>Department:</strong> {selected.employeeDepartmentName || selected.employeeDepartment || "Not recorded"}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}><strong>Email:</strong> {selected.employeeEmail || "Not recorded"}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}><strong>Phone:</strong> {selected.employeePhoneNumber || "Not recorded"}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}><strong>Case owner:</strong> {selected.caseOwnerName || "Not assigned"}</Typography>
                </Box>
              </Box>
              <Stepper activeStep={verificationStep} alternativeLabel sx={{ mx: { xs: -1, sm: 0 }, "& .MuiStepLabel-label": { fontSize: { xs: "0.68rem", sm: "0.75rem" }, mt: 0.5 }, "& .MuiStepIcon-root.Mui-active, & .MuiStepIcon-root.Mui-completed": { color: "primary.main" } }}>
                {["Review case", "Verify evidence", "Confirm return"].map((step) => <Step key={step}><StepLabel>{step}</StepLabel></Step>)}
              </Stepper>
              <Alert
                severity={isCancelled ? "info" : selected.documentsVerified ? "success" : "warning"}
                icon={
                  isCancelled ? undefined : selected.documentsVerified ? <FactCheckOutlined /> : undefined
                }
              >
                {isCancelled
                  ? "This case was cancelled and is now read-only"
                  : selected.documentsVerified
                    ? "All supporting documents are verified. The case is ready for return confirmation."
                    : hasPendingEvidence
                      ? "Review each supporting document and verify or reject it before confirming the return."
                      : "Upload the required supporting evidence to begin HR verification."}
              </Alert>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                <Chip label={label(selected.lifecycleStatus)} />
                <Chip label={label(selected.status)} variant="outlined" />
              </Stack>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, minmax(0, 1fr))" }, gap: 1, p: 1.5, borderRadius: 2, bgcolor: "action.hover" }}>
                <Box><Typography variant="caption" color="text.secondary">Effective from</Typography><Typography variant="body2" fontWeight={700}>{new Date(selected.effectiveFromUtc).toLocaleDateString()}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Expected return</Typography><Typography variant="body2" fontWeight={700}>{selected.expectedReturnDate ? new Date(selected.expectedReturnDate).toLocaleDateString() : "Not recorded"}</Typography></Box>
                <Box><Typography variant="caption" color="text.secondary">Leave days</Typography><Typography variant="body2" fontWeight={700}>{selected.leaveTotalDays}</Typography></Box>
                <Box sx={{ gridColumn: { sm: "1 / -1" } }}><Typography variant="caption" color="text.secondary">Reason</Typography><Typography variant="body2">{selected.reason || "Not recorded"}</Typography></Box>
              </Box>
              <Box sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={800}>Case controls</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25 }}>Policy values are defaults. Change these only when this employee needs a different temporary account or payroll treatment. Paid/unpaid salary treatment remains set by the leave policy.</Typography>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                  <FormControl size="small" fullWidth disabled={isCancelled || selected.status === "Completed"}><InputLabel>Account access</InputLabel><Select label="Account access" value={accountStatus} onChange={e => setAccountStatus(e.target.value)}><MenuItem value=""><em>Keep current case setting</em></MenuItem><MenuItem value="Active">Active</MenuItem><MenuItem value="TemporarilyDisabled">Temporarily disabled</MenuItem></Select></FormControl>
                  <FormControl size="small" fullWidth disabled={isCancelled || selected.status === "Completed"}><InputLabel>Payroll handling</InputLabel><Select label="Payroll handling" value={payrollStatus} onChange={e => setPayrollStatus(e.target.value)}><MenuItem value=""><em>Keep current case setting</em></MenuItem><MenuItem value="Active">Active</MenuItem><MenuItem value="Hold">Hold for review</MenuItem><MenuItem value="Paused">Paused</MenuItem></Select></FormControl>
                </Stack>
                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1} sx={{ mt: 1 }}>
                  <Typography variant="caption" color="text.secondary">Current overrides: account {selected.appliedAccountStatus ?? "policy default"} · payroll {selected.appliedPayrollStatus ?? "policy default"}</Typography>
                  <Button size="small" variant="contained" disabled={isCancelled || selected.status === "Completed" || (!accountStatus && !payrollStatus)} onClick={() => void updateCaseControls()}>Save controls</Button>
                </Stack>
              </Box>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ sm: "center" }}
              >
                <CustomisedDatePicker
                  label="New expected return"
                  value={extensionDate ? dayjs(extensionDate) : null}
                  setValue={(value) =>
                    setExtensionDate(
                      value?.isValid() ? value.format("YYYY-MM-DD") : "",
                    )
                  }
                  minDate={dayjs().startOf("day")}
                  disabled={isCancelled || selected.status === "Completed"}
                  format="DD-MM-YYYY"
                  sx={{ flex: 1, "& .MuiFormControl-root": { width: "100%" } }}
                />
                <Button
                  variant="outlined"
                  size="small"
                  disabled={isCancelled || selected.status === "Completed" || !extensionDate}
                  onClick={() => void extend()}
                >
                  Extend
                </Button>
              </Stack>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                alignItems={{ sm: "center" }}
              >
                <Button component="label" variant="outlined" size="small" disabled={isCancelled}>
                  Upload evidence
                  <input
                    hidden
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(event) => {
                      void upload(event.target.files?.[0]);
                      event.currentTarget.value = "";
                    }}
                  />
                </Button>
                <Typography variant="caption" color="text.secondary">
                  PDF, PNG, or JPG up to 10 MB
                </Typography>
              </Stack>
              {selected.evidence?.length > 0 && (
                <Stack spacing={1}>
                  <Typography variant="subtitle2">Evidence verification</Typography>
                  <Typography variant="caption" color="text.secondary">Review every document before confirming the employee’s return.</Typography>
                  {selected.evidence.map((evidence) => (
                    <Stack
                      key={evidenceIdOf(evidence) || evidence.fileName}
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      gap={1}
                      sx={{ p: 1, bgcolor: "action.hover", borderRadius: 1.5 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ overflowWrap: "anywhere" }}
                      >
                        {evidence.fileName} · {label(evidence.status)}
                      </Typography>
                      {evidence.status === "PendingVerification" && (
                        <Stack direction="row" spacing={0.5}>
                          <Button
                            size="small"
                            color="success"
                            disabled={!evidenceIdOf(evidence)}
                            onClick={() => void verify(evidenceIdOf(evidence), true)}
                          >
                            Verify
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            disabled={!evidenceIdOf(evidence)}
                            onClick={() => void verify(evidenceIdOf(evidence), false)}
                          >
                            Reject
                          </Button>
                        </Stack>
                      )}
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" justifyContent="flex-end">
                        <Button aria-label={`Open ${evidence.fileName}`} size="small" variant="outlined" startIcon={<VisibilityOutlined fontSize="small" />} sx={{ display: "inline-flex", minWidth: 96, color: "primary.main", borderColor: "primary.light", whiteSpace: "nowrap" }} onClick={() => void openEvidence(evidenceIdOf(evidence), evidence.fileName)}>Open</Button>
                        <Button aria-label={`Download ${evidence.fileName}`} size="small" variant="outlined" startIcon={<DownloadOutlined fontSize="small" />} sx={{ display: "inline-flex", minWidth: 112, color: "primary.main", borderColor: "primary.light", whiteSpace: "nowrap" }} onClick={() => void openEvidence(evidenceIdOf(evidence), evidence.fileName, true)}>Download</Button>
                      </Stack>
                    </Stack>
                  ))}
                </Stack>
              )}
              <Typography variant="subtitle2">Case timeline</Typography>
              <Stack spacing={1}>
                {selected.events
                  ?.slice()
                  .reverse()
                  .map((event, index) => (
                    <Box
                      key={`${event.occurredAtUtc}-${index}`}
                      sx={{ borderLeft: 2, borderColor: "divider", pl: 1.5 }}
                    >
                      <Typography variant="body2">
                        {label(event.eventType)} ·{" "}
                        {event.fromStatus
                          ? `${label(event.fromStatus)} → `
                          : ""}
                        {label(event.toStatus)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(event.occurredAtUtc).toLocaleString()}{" "}
                        {event.comment ? `· ${event.comment}` : ""}
                      </Typography>
                    </Box>
                  ))}
              </Stack>
            </Stack>
          )}
        </DialogContent>
        <DialogActions
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            gap: 1,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Button onClick={() => setSelected(null)}>Close</Button>
          {selected && selected.status !== "Completed" && (
                <Button variant="contained" disabled={!canConfirmReturn} onClick={complete}>
              Confirm return
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
};
