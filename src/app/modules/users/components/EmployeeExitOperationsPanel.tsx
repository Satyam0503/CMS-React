import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState } from "react";
import dayjs from "dayjs";
import {
  downloadEmployeeExitEvidence,
  EmployeeExitCase,
  approveEmployeeFinalSettlement,
  completeEmployeeExit,
  completeEmployeeExitClearance,
  exceptionalCompleteEmployeeExit,
  reviewEmployeeExitHandover,
  updateEmployeeExitDate,
  updateEmployeeFinalSettlementPayment,
  upsertEmployeeExitAccess,
  upsertEmployeeExitAsset,
  upsertEmployeeExitBenefit,
  upsertEmployeeExitFinance,
  upsertEmployeeExitHandover,
  verifyEmployeeExitEvidence,
} from "../../employees/employeeServices";
import { AppButton } from "../../../shared/components/ui";
import { toast } from "react-toastify";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";

type Props = { exitCase: EmployeeExitCase; onRefresh: () => Promise<void>; managerOnly?: boolean };
type SectionProps = { title: string; count: number; children: React.ReactNode; showCount?: boolean };

const Section = ({ title, count, children, showCount = true }: SectionProps) => (
  <Accordion
    disableGutters
    elevation={0}
    sx={{
      "&:before": { display: "none" },
      border: "1px solid",
      borderColor: "divider",
      borderRadius: "12px !important",
      overflow: "hidden",
      mb: 1.25,
      bgcolor: "background.paper",
      transition: "border-color .18s ease, box-shadow .18s ease",
      "&.Mui-expanded": {
        m: 0,
        mb: 1.25,
        borderColor: "primary.main",
        boxShadow: "0 8px 20px rgba(20, 84, 92, .08)",
      },
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      sx={{
        minHeight: 58,
        px: { xs: 1.25, sm: 1.75 },
        "& .MuiAccordionSummary-content": { my: 1.25 },
        "& .MuiAccordionSummary-content.Mui-expanded": { my: 1.25 },
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1} width="100%">
        <Typography fontWeight={750}>{title}</Typography>
        {showCount && (
          <Chip
            size="small"
            color={count ? "primary" : "default"}
            variant={count ? "filled" : "outlined"}
            label={count}
          />
        )}
      </Stack>
    </AccordionSummary>
    <AccordionDetails sx={{ px: { xs: 1.25, sm: 1.75 }, pt: 0, pb: { xs: 1.5, sm: 1.75 } }}>
      <Box sx={{ pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>{children}</Box>
    </AccordionDetails>
  </Accordion>
);

const completionErrorMessage = (message?: string) => {
  const messages: Record<string, string> = {
    EXIT_COMPLETION_START_SESSION_FAILED:
      "Offboarding could not start its database transaction. Ask your system administrator to enable MongoDB transactions, then try again.",
    EXIT_COMPLETION_TRANSACTION_UNAVAILABLE:
      "Offboarding cannot be completed because the database does not support transactions. Ask your system administrator to enable MongoDB transactions.",
    EXIT_COMPLETION_EXIT_CASE_FAILED:
      "The exit case changed before it could be completed. Refresh the page and try again.",
    EXIT_COMPLETION_EMPLOYEE_FAILED:
      "The employee record could not be updated. Please try again or contact your system administrator.",
    EXIT_COMPLETION_REFRESH_TOKENS_FAILED:
      "The employee's sign-in sessions could not be closed. Please try again or contact your system administrator.",
    EXIT_COMPLETION_OUTBOX_FAILED:
      "The completion notification could not be queued. Please try again or contact your system administrator.",
    EXIT_COMPLETION_ATTENDANCE_CUTOFF_FAILED:
      "The attendance cutoff could not be saved. Please try again or contact your system administrator.",
    EXIT_COMPLETION_FUTURE_LEAVE_FAILED:
      "Future leave could not be closed. Please try again or contact your system administrator.",
    EXIT_COMPLETION_FUTURE_WFH_FAILED:
      "Future work-from-home requests could not be closed. Please try again or contact your system administrator.",
    EXIT_CASE_CHANGED_OR_NOT_FOUND:
      "This exit case was updated. It has been refreshed; please review it and try again.",
  };
  return messages[message || ""] || message || "Unable to save offboarding item.";
};

const itemRowSx = {
  p: { xs: 1, sm: 1.25 },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2,
  bgcolor: "background.default",
  minWidth: 0,
};
const actionRowSx = {
  width: { xs: "100%", sm: "auto" },
  flexWrap: "wrap",
  "& .MuiButton-root": { flex: { xs: "1 1 auto", sm: "0 0 auto" } },
};
const formGridSx = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 1,
  alignItems: "start",
  minWidth: 0,
};

export const EmployeeExitOperationsPanel = ({ exitCase, onRefresh, managerOnly = false }: Props) => {
  // Isolated section states to prevent cross-accordion input pollution
  const [checklistWaiveNote, setChecklistWaiveNote] = useState("");
  const [handoverDraft, setHandoverDraft] = useState({ title: "", details: "" });
  const [assetDraft, setAssetDraft] = useState({ assetType: "", reference: "" });
  const [accessDraft, setAccessDraft] = useState({ system: "", reference: "" });
  const [financeDraft, setFinanceDraft] = useState({ category: "", reference: "" });
  const [settlementPaymentRef, setSettlementPaymentRef] = useState("");
  const [lwdOverrideReason, setLwdOverrideReason] = useState("");
  const [completionNote, setCompletionNote] = useState("");

  const [saving, setSaving] = useState(false);
  const [lwd, setLwd] = useState(exitCase.lastWorkingDate.slice(0, 10));
  const [settlementAmount, setSettlementAmount] = useState("0");
  const [confirmCompletion, setConfirmCompletion] = useState(false);

  const run = async (
    work: () => Promise<{ data: { success: boolean; message?: string } }>,
    success: string,
    onDone?: () => void,
  ) => {
    setSaving(true);
    try {
      const response = await work();
      if (!response.data.success) throw new Error(completionErrorMessage(response.data.message));
      toast.success(success);
      onDone?.();
      await onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to save offboarding item.");
    } finally {
      setSaving(false);
    }
  };

  const pendingChecklist = exitCase.clearances.filter(
    (item) => item.isMandatory && !["Completed", "Waived"].includes(item.status),
  ).length;
  const pendingOperationalWork =
    exitCase.pendingHandoverCount +
    exitCase.pendingAssetCount +
    exitCase.pendingAccessCount +
    exitCase.pendingFinanceCount +
    exitCase.pendingBenefitCount;
  const totalBlockers = pendingChecklist + pendingOperationalWork;
  const blockers = [
    ...exitCase.clearances
      .filter((item) => item.isMandatory && !["Completed", "Waived"].includes(item.status))
      .map((item) => `${item.category}: mark complete or waive with a reason`),
    ...exitCase.handoverTasks
      .filter((item) => !["Approved", "Waived"].includes(item.status))
      .map((item) => `${item.title}: employee must submit, then manager/HR approves`),
    ...exitCase.assets
      .filter((item) => !["Verified", "Waived", "RecoveredFinancially"].includes(item.status))
      .map((item) => `${item.assetType}: verify, waive, or record recovery`),
    ...exitCase.accessItems
      .filter((item) => !["Revoked", "Waived"].includes(item.status))
      .map((item) => `${item.system}: revoke or waive access`),
    ...exitCase.financeItems
      .filter((item) => !["Completed", "Waived"].includes(item.status))
      .map((item) => `${item.category}: complete or waive finance item`),
    ...exitCase.benefitItems
      .filter((item) => !["Completed", "Waived"].includes(item.status))
      .map((item) => `${item.category}: complete or waive benefit item`),
  ];

  const completeExit = () =>
    void run(
      () =>
        completeEmployeeExit({
          employeeExitId: exitCase.employeeExitId,
          employeeUserId: exitCase.employeeUserId,
          version: exitCase.version,
          notes: completionNote.trim(),
        }),
      "Exit completed.",
      () => setCompletionNote(""),
    );

  const openEvidence = async (evidenceId: string, action: "open" | "download", fileName?: string) => {
    const preview = action === "open" ? window.open("", "_blank") : null;
    try {
      const response = await downloadEmployeeExitEvidence(exitCase.employeeExitId, evidenceId);
      const url = URL.createObjectURL(response.data);
      if (action === "open") {
        if (!preview) throw new Error("Preview window was blocked.");
        preview.opener = null;
        preview.location.href = url;
      } else {
        const link = document.createElement("a");
        link.href = url;
        link.download = fileName || "exit-evidence";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch {
      preview?.close();
      toast.error(`Unable to ${action} this evidence file.`);
    }
  };

  if (managerOnly) {
    return (
      <Box
        sx={{
          mt: 2.5,
          p: { xs: 1.5, sm: 2 },
          border: "1px solid",
          borderColor: "divider",
          borderRadius: 3,
          bgcolor: "background.paper",
        }}
      >
        <Stack spacing={1.5}>
          <Box>
            <Typography fontWeight={750}>Manager handover review</Typography>
            <Typography variant="body2" color="text.secondary">
              Review only the work-transfer tasks assigned to this exit. HR owns clearance, access, finance, settlement, evidence and final completion.
            </Typography>
          </Box>
          {exitCase.handoverTasks.length === 0 ? (
            <Alert severity="info">HR has not added any handover tasks yet.</Alert>
          ) : (
            <Stack spacing={1}>
              {exitCase.handoverTasks.map((item) => (
                <Stack
                  key={item.handoverTaskId}
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  gap={1}
                  sx={itemRowSx}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={650}>
                      {item.title}
                    </Typography>
                    {item.details && (
                      <Typography variant="caption" color="text.secondary">
                        {item.details}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip size="small" label={item.status} />
                    {item.status === "Submitted" && (
                      <AppButton
                        size="small"
                        variant="outlined"
                        disabled={saving}
                        onClick={() =>
                          void run(
                            () =>
                              reviewEmployeeExitHandover({
                                employeeExitId: exitCase.employeeExitId,
                                handoverTaskId: item.handoverTaskId,
                                version: exitCase.version,
                                action: "Approve",
                              }),
                            "Handover approved.",
                          )
                        }
                      >
                        Approve
                      </AppButton>
                    )}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          )}
        </Stack>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 2.5 }}>
      <Stack spacing={1.25} sx={{ mb: 1.5 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={0.5}>
          <Box>
            <Typography fontWeight={750}>Exit readiness</Typography>
            <Typography variant="caption" color="text.secondary">
              Complete the required checks before closing this case.
            </Typography>
          </Box>
          <Chip
            size="small"
            color={totalBlockers ? "warning" : "success"}
            label={totalBlockers ? `${totalBlockers} blocker${totalBlockers === 1 ? "" : "s"}` : "Ready to complete"}
          />
        </Stack>
        <Alert severity={totalBlockers ? "warning" : "success"}>
          {totalBlockers ? (
            <Stack spacing={0.5}>
              <Typography variant="body2">Exit completion is blocked by the following:</Typography>
              {blockers.map((blocker, index) => (
                <Typography key={`${blocker}-${index}`} variant="body2">
                  • {blocker}
                </Typography>
              ))}
            </Stack>
          ) : (
            "All tracked requirements are complete. You can now close the exit case."
          )}
        </Alert>
      </Stack>

      <Section title="Required exit checklist" count={pendingChecklist}>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.25 }}>
          These are final compliance attestations. The Handover, Assets, and Finance sections below hold the supporting operational records.
        </Typography>
        {exitCase.clearances.length === 0 ? (
          <Alert severity="info">No clearance template applies to this case.</Alert>
        ) : (
          <Stack spacing={1.25}>
            <TextField
              size="small"
              fullWidth
              label="Waiver reason / compliance note (required to waive an item)"
              value={checklistWaiveNote}
              onChange={(e) => setChecklistWaiveNote(e.target.value)}
            />
            {exitCase.clearances.map((item) => (
              <Stack
                key={item.clearanceId}
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ sm: "center" }}
                gap={1}
                sx={itemRowSx}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" fontWeight={600} sx={{ overflowWrap: "anywhere" }}>
                    {item.category}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.isMandatory ? "Required to close the exit" : "Optional check"}
                  </Typography>
                </Box>
                <Stack direction="row" gap={1} alignItems="center" sx={actionRowSx}>
                  <Chip size="small" label={item.status} />
                  <AppButton
                    size="small"
                    variant="outlined"
                    disabled={saving || ["Completed", "Waived"].includes(item.status)}
                    onClick={() =>
                      void run(
                        () =>
                          completeEmployeeExitClearance(
                            { employeeExitId: exitCase.employeeExitId, clearanceId: item.clearanceId, version: exitCase.version },
                            false,
                          ),
                        "Checklist item completed.",
                      )
                    }
                  >
                    Mark complete
                  </AppButton>
                  <AppButton
                    size="small"
                    variant="text"
                    disabled={saving || ["Completed", "Waived"].includes(item.status) || !checklistWaiveNote.trim()}
                    onClick={() =>
                      void run(
                        () =>
                          completeEmployeeExitClearance(
                            {
                              employeeExitId: exitCase.employeeExitId,
                              clearanceId: item.clearanceId,
                              version: exitCase.version,
                              notes: checklistWaiveNote.trim(),
                            },
                            true,
                          ),
                        "Checklist item waived and recorded.",
                        () => setChecklistWaiveNote(""),
                      )
                    }
                  >
                    Waive with note
                  </AppButton>
                </Stack>
              </Stack>
            ))}
          </Stack>
        )}
      </Section>

      <Section title="Handover" count={exitCase.handoverTasks.length}>
        <Stack spacing={1}>
          <Alert severity="info">
            The employee submits assigned handover tasks. Managers and HR review and approve them here.
          </Alert>
          {exitCase.handoverTasks.map((item) => (
            <Stack
              key={item.handoverTaskId}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              gap={1}
              sx={itemRowSx}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                  {item.title}
                </Typography>
                <Chip size="small" label={item.status} />
              </Stack>
              {item.status === "Submitted" && (
                <Stack direction="row" gap={1} sx={actionRowSx}>
                  <AppButton
                    size="small"
                    variant="outlined"
                    disabled={saving}
                    onClick={() =>
                      void run(
                        () =>
                          reviewEmployeeExitHandover({
                            employeeExitId: exitCase.employeeExitId,
                            handoverTaskId: item.handoverTaskId,
                            version: exitCase.version,
                            action: "Approve",
                          }),
                        "Handover approved.",
                      )
                    }
                  >
                    Approve
                  </AppButton>
                </Stack>
              )}
            </Stack>
          ))}
          <Box sx={formGridSx}>
            <TextField
              size="small"
              fullWidth
              required
              label="Task title"
              value={handoverDraft.title}
              onChange={(e) => setHandoverDraft((prev) => ({ ...prev, title: e.target.value }))}
            />
            <TextField
              size="small"
              fullWidth
              label="Details"
              value={handoverDraft.details}
              onChange={(e) => setHandoverDraft((prev) => ({ ...prev, details: e.target.value }))}
            />
            <AppButton
              disabled={saving || !handoverDraft.title.trim()}
              onClick={() =>
                void run(
                  () =>
                    upsertEmployeeExitHandover({
                      employeeExitId: exitCase.employeeExitId,
                      version: exitCase.version,
                      title: handoverDraft.title,
                      details: handoverDraft.details,
                    }),
                  "Handover task added and assigned to the exiting employee.",
                  () => setHandoverDraft({ title: "", details: "" }),
                )
              }
            >
              Add task
            </AppButton>
          </Box>
        </Stack>
      </Section>

      <Section title="Assets" count={exitCase.assets.length}>
        <Stack spacing={1}>
          {exitCase.assets.map((item) => (
            <Stack
              key={item.assetExitId}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              gap={1}
              sx={itemRowSx}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                  {item.assetType}
                  {item.assetIdentifier ? ` · ${item.assetIdentifier}` : ""}
                </Typography>
                <Chip size="small" label={item.status} />
              </Stack>
              {!["Verified", "Waived", "RecoveredFinancially"].includes(item.status) && (
                <Stack direction="row" gap={1} sx={actionRowSx}>
                  <AppButton
                    size="small"
                    variant="outlined"
                    disabled={saving}
                    onClick={() =>
                      void run(
                        () =>
                          upsertEmployeeExitAsset({
                            employeeExitId: exitCase.employeeExitId,
                            assetExitId: item.assetExitId,
                            version: exitCase.version,
                            assetType: item.assetType,
                            assetIdentifier: item.assetIdentifier,
                            status: "Verified",
                            notes: item.notes,
                          }),
                        "Asset verified.",
                      )
                    }
                  >
                    Verify
                  </AppButton>
                  <AppButton
                    size="small"
                    variant="text"
                    disabled={saving}
                    onClick={() =>
                      void run(
                        () =>
                          upsertEmployeeExitAsset({
                            employeeExitId: exitCase.employeeExitId,
                            assetExitId: item.assetExitId,
                            version: exitCase.version,
                            assetType: item.assetType,
                            assetIdentifier: item.assetIdentifier,
                            status: "Waived",
                            notes: "No company asset applies",
                          }),
                        "Asset requirement waived.",
                      )
                    }
                  >
                    Waive
                  </AppButton>
                </Stack>
              )}
            </Stack>
          ))}
          <Box sx={formGridSx}>
            <TextField
              size="small"
              fullWidth
              required
              label="Asset type"
              value={assetDraft.assetType}
              onChange={(e) => setAssetDraft((prev) => ({ ...prev, assetType: e.target.value }))}
            />
            <TextField
              size="small"
              fullWidth
              label="Asset ID / tracking"
              value={assetDraft.reference}
              onChange={(e) => setAssetDraft((prev) => ({ ...prev, reference: e.target.value }))}
            />
            <AppButton
              disabled={saving || !assetDraft.assetType.trim()}
              onClick={() =>
                void run(
                  () =>
                    upsertEmployeeExitAsset({
                      employeeExitId: exitCase.employeeExitId,
                      version: exitCase.version,
                      assetType: assetDraft.assetType,
                      assetIdentifier: assetDraft.reference,
                      status: "ReturnRequested",
                    }),
                  "Asset added.",
                  () => setAssetDraft({ assetType: "", reference: "" }),
                )
              }
            >
              Add asset
            </AppButton>
          </Box>
        </Stack>
      </Section>

      <Section title="IT access" count={exitCase.accessItems.length}>
        <Stack spacing={1}>
          {exitCase.accessItems.map((item) => (
            <Stack
              key={item.accessItemId}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              gap={1}
              sx={itemRowSx}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                  {item.system}
                </Typography>
                <Chip size="small" label={item.status} />
              </Stack>
              <AppButton
                size="small"
                variant="outlined"
                disabled={saving || item.status === "Revoked"}
                onClick={() =>
                  void run(
                    () =>
                      upsertEmployeeExitAccess({
                        employeeExitId: exitCase.employeeExitId,
                        accessItemId: item.accessItemId,
                        version: exitCase.version,
                        system: item.system,
                        mode: item.mode,
                        status: "Revoked",
                        externalReference: item.externalReference,
                      }),
                    "Access revoked.",
                  )
                }
              >
                Revoke
              </AppButton>
            </Stack>
          ))}
          <Box sx={formGridSx}>
            <TextField
              size="small"
              fullWidth
              required
              label="System"
              value={accessDraft.system}
              onChange={(e) => setAccessDraft((prev) => ({ ...prev, system: e.target.value }))}
            />
            <TextField
              size="small"
              fullWidth
              label="Reference"
              value={accessDraft.reference}
              onChange={(e) => setAccessDraft((prev) => ({ ...prev, reference: e.target.value }))}
            />
            <AppButton
              disabled={saving || !accessDraft.system.trim()}
              onClick={() =>
                void run(
                  () =>
                    upsertEmployeeExitAccess({
                      employeeExitId: exitCase.employeeExitId,
                      version: exitCase.version,
                      system: accessDraft.system,
                      mode: "AtLwd",
                      status: "Pending",
                      externalReference: accessDraft.reference,
                    }),
                  "Access item added.",
                  () => setAccessDraft({ system: "", reference: "" }),
                )
              }
            >
              Add access
            </AppButton>
          </Box>
        </Stack>
      </Section>

      <Section title="Finance and benefits" count={exitCase.financeItems.length + exitCase.benefitItems.length}>
        <Stack spacing={1}>
          {exitCase.financeItems.map((item) => (
            <Stack
              key={item.financeItemId}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              gap={1}
              sx={itemRowSx}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                  {item.category} · {item.direction} · {item.amount}
                </Typography>
                <Chip size="small" label={item.status} />
              </Stack>
              {!["Completed", "Waived"].includes(item.status) && (
                <AppButton
                  size="small"
                  variant="outlined"
                  disabled={saving}
                  onClick={() =>
                    void run(
                      () =>
                        upsertEmployeeExitFinance({
                          employeeExitId: exitCase.employeeExitId,
                          financeItemId: item.financeItemId,
                          version: exitCase.version,
                          category: item.category,
                          direction: item.direction,
                          amount: item.amount,
                          status: "Completed",
                          reference: item.reference,
                          notes: item.notes,
                        }),
                      "Finance item completed.",
                    )
                  }
                >
                  Complete
                </AppButton>
              )}
            </Stack>
          ))}
          {exitCase.benefitItems.map((item) => (
            <Stack
              key={item.benefitItemId}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              gap={1}
              sx={itemRowSx}
            >
              <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
                <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                  {item.category}
                </Typography>
                <Chip size="small" label={item.status} />
              </Stack>
              {!["Completed", "Waived"].includes(item.status) && (
                <AppButton
                  size="small"
                  variant="outlined"
                  disabled={saving}
                  onClick={() =>
                    void run(
                      () =>
                        upsertEmployeeExitBenefit({
                          employeeExitId: exitCase.employeeExitId,
                          benefitItemId: item.benefitItemId,
                          version: exitCase.version,
                          category: item.category,
                          status: "Completed",
                          reference: item.reference,
                        }),
                      "Benefit item completed.",
                    )
                  }
                >
                  Complete
                </AppButton>
              )}
            </Stack>
          ))}
          <Box sx={{ ...formGridSx, gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) minmax(0, 1fr) auto auto" } }}>
            <TextField
              size="small"
              fullWidth
              required
              label="Finance/benefit category"
              value={financeDraft.category}
              onChange={(e) => setFinanceDraft((prev) => ({ ...prev, category: e.target.value }))}
            />
            <TextField
              size="small"
              fullWidth
              label="Amount or reference"
              value={financeDraft.reference}
              onChange={(e) => setFinanceDraft((prev) => ({ ...prev, reference: e.target.value }))}
            />
            <AppButton
              disabled={saving || !financeDraft.category.trim()}
              onClick={() =>
                void run(
                  () =>
                    upsertEmployeeExitFinance({
                      employeeExitId: exitCase.employeeExitId,
                      version: exitCase.version,
                      category: financeDraft.category,
                      direction: "Informational",
                      amount: Number(financeDraft.reference) || 0,
                      status: "Pending",
                    }),
                  "Finance item added.",
                  () => setFinanceDraft({ category: "", reference: "" }),
                )
              }
            >
              Add finance
            </AppButton>
            <AppButton
              disabled={saving || !financeDraft.category.trim()}
              onClick={() =>
                void run(
                  () =>
                    upsertEmployeeExitBenefit({
                      employeeExitId: exitCase.employeeExitId,
                      version: exitCase.version,
                      category: financeDraft.category,
                      status: "Pending",
                      reference: financeDraft.reference,
                    }),
                  "Benefit item added.",
                  () => setFinanceDraft({ category: "", reference: "" }),
                )
              }
            >
              Add benefit
            </AppButton>
          </Box>
        </Stack>
      </Section>

      <Section title="Final settlement" count={exitCase.finalSettlement ? 1 : 0}>
        <Stack spacing={1}>
          {exitCase.finalSettlement ? (
            <Alert severity={exitCase.finalSettlement.status === "Paid" ? "success" : "info"}>
              Status: {exitCase.finalSettlement.status} · Net payable: {exitCase.finalSettlement.netPayable.toLocaleString()}{" "}
              {exitCase.finalSettlement.sourcePayrollRunId
                ? `· immutable final-settlement run ${exitCase.finalSettlement.sourcePayrollRunId}`
                : exitCase.finalSettlement.sourcePayrollMonth
                ? `· calculated from ${new Date(exitCase.finalSettlement.sourcePayrollMonth).toLocaleDateString(undefined, {
                    month: "short",
                    year: "numeric",
                  })} payroll`
                : ""}
            </Alert>
          ) : (
            <Alert severity="info">Calculate the settlement after the employee’s final payroll is processed.</Alert>
          )}
          <Stack direction={{ xs: "column", md: "row" }} gap={1}>
            <TextField
              size="small"
              fullWidth
              type="number"
              inputProps={{ min: 0, step: "0.01" }}
              label="Paid amount"
              value={settlementAmount}
              onChange={(event) => setSettlementAmount(event.target.value)}
            />
            <TextField
              size="small"
              fullWidth
              label="Payment reference"
              value={settlementPaymentRef}
              onChange={(e) => setSettlementPaymentRef(e.target.value)}
            />
            <AppButton
              disabled={saving || !exitCase.finalSettlement || exitCase.finalSettlement.status !== "Calculated"}
              variant="outlined"
              onClick={() =>
                void run(
                  () => approveEmployeeFinalSettlement({ employeeExitId: exitCase.employeeExitId, version: exitCase.version }),
                  "Final settlement approved.",
                )
              }
            >
              Approve settlement
            </AppButton>
            <AppButton
              disabled={
                saving ||
                !exitCase.finalSettlement ||
                exitCase.finalSettlement.status !== "Approved" ||
                Number(settlementAmount) < 0
              }
              color="success"
              onClick={() =>
                void run(
                  () =>
                    updateEmployeeFinalSettlementPayment({
                      employeeExitId: exitCase.employeeExitId,
                      status: "Paid",
                      paidAmount: Number(settlementAmount),
                      paymentReference: settlementPaymentRef || undefined,
                    }),
                  "Payment recorded.",
                  () => setSettlementPaymentRef(""),
                )
              }
            >
              Record payment
            </AppButton>
          </Stack>
        </Stack>
      </Section>

      <Section title="Evidence" count={exitCase.evidence.length}>
        <Stack spacing={1}>
          {exitCase.evidence.map((item) => (
            <Stack
              key={item.evidenceId}
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ sm: "center" }}
              gap={1}
              sx={itemRowSx}
            >
              <Typography variant="body2" sx={{ minWidth: 0, overflowWrap: "anywhere" }}>
                {item.category} · {item.fileName || item.type}
              </Typography>
              <Stack direction="row" gap={1} sx={actionRowSx}>
                <Chip size="small" label={item.status} />
                <AppButton size="small" variant="outlined" onClick={() => void openEvidence(item.evidenceId, "open", item.fileName)}>
                  Open
                </AppButton>
                <AppButton
                  size="small"
                  variant="outlined"
                  onClick={() => void openEvidence(item.evidenceId, "download", item.fileName)}
                >
                  Download
                </AppButton>
                <AppButton
                  size="small"
                  variant="outlined"
                  disabled={saving || item.status === "Verified"}
                  onClick={() =>
                    void run(
                      () =>
                        verifyEmployeeExitEvidence({
                          employeeExitId: exitCase.employeeExitId,
                          evidenceId: item.evidenceId,
                          version: exitCase.version,
                          verified: true,
                        }),
                      "Evidence verified.",
                    )
                  }
                >
                  Verify
                </AppButton>
              </Stack>
            </Stack>
          ))}
        </Stack>
      </Section>

      <Section title="Last working day override" count={0} showCount={false}>
        <Stack spacing={1.5}>
          <Typography variant="body2" color="text.secondary">
            For an HR-led correction or approved exception only.
          </Typography>
          <Alert severity="info" sx={{ borderRadius: 2, py: 0 }}>
            Employee notice-change requests must be decided in the notice-review workflow.
          </Alert>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 1, alignItems: "stretch" }}>
            <Box sx={{ gridColumn: "1 / -1" }}>
              <TextField
                size="small"
                fullWidth
                required
                multiline
                minRows={2}
                label="Reason for override"
                value={lwdOverrideReason}
                onChange={(event) => setLwdOverrideReason(event.target.value)}
              />
            </Box>
            <CustomisedDatePicker
              label="New last working date"
              value={lwd ? dayjs(lwd) : null}
              setValue={(date) => setLwd(date?.isValid() ? date.format("YYYY-MM-DD") : "")}
              minDate={dayjs().startOf("day")}
              format="DD-MM-YYYY"
              sx={{ width: "100%", "& .MuiFormControl-root": { width: "100%" } }}
            />
            <AppButton
              fullWidth
              disabled={saving || !lwdOverrideReason.trim()}
              sx={{ minHeight: 40, whiteSpace: "nowrap" }}
              onClick={() =>
                void run(
                  () =>
                    updateEmployeeExitDate({
                      employeeExitId: exitCase.employeeExitId,
                      version: exitCase.version,
                      lastWorkingDate: lwd,
                      reason: lwdOverrideReason.trim(),
                      overrideNoticePolicy: true,
                    }),
                  "Last working date updated.",
                  () => setLwdOverrideReason(""),
                )
              }
            >
              Apply new date
            </AppButton>
          </Box>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ sm: "center" }}
            gap={1}
            sx={{ pt: 1.25, borderTop: "1px solid", borderColor: "divider" }}
          >
            <Typography variant="caption" color="text.secondary">
              Exceptional close still checks every normal exit safeguard.
            </Typography>
            <AppButton
              size="small"
              disabled={saving || !lwdOverrideReason.trim()}
              color="warning"
              variant="text"
              sx={{ alignSelf: { xs: "flex-start", sm: "auto" }, whiteSpace: "nowrap" }}
              onClick={() =>
                void run(
                  () =>
                    exceptionalCompleteEmployeeExit({
                      employeeExitId: exitCase.employeeExitId,
                      version: exitCase.version,
                      reason: lwdOverrideReason.trim(),
                    }),
                  "Exceptional completion was checked against the normal safeguards.",
                )
              }
            >
              Request exceptional close
            </AppButton>
          </Stack>
        </Stack>
      </Section>

      <Box
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          border: "1px solid",
          borderColor: totalBlockers ? "warning.light" : "success.light",
          bgcolor: totalBlockers ? "warning.lighter" : "success.lighter",
          borderRadius: 2,
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1.25}>
          <Box>
            <Typography fontWeight={750}>Ready to close the exit?</Typography>
            <Typography variant="body2" color="text.secondary">
              {totalBlockers
                ? `${totalBlockers} tracked requirement${totalBlockers === 1 ? " is" : "s are"} still outstanding.`
                : "All tracked requirements are complete. Add a final note to confirm closure."}
            </Typography>
          </Box>
          <AppButton
            color="success"
            fullWidth={false}
            sx={{ width: { xs: "100%", sm: "auto" }, minWidth: { sm: 144 }, whiteSpace: "nowrap" }}
            disabled={saving || totalBlockers > 0}
            onClick={() => setConfirmCompletion(true)}
          >
            Complete exit
          </AppButton>
        </Stack>
      </Box>

      <Dialog open={confirmCompletion} onClose={() => !saving && setConfirmCompletion(false)}>
        <DialogTitle>Complete this exit case?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            This closes the employee’s active offboarding case. The completion note will be recorded in the audit trail.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <TextField
              size="small"
              fullWidth
              required
              label="Completion note"
              value={completionNote}
              onChange={(e) => setCompletionNote(e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <AppButton variant="outlined" color="inherit" disabled={saving} onClick={() => setConfirmCompletion(false)}>
            Cancel
          </AppButton>
          <AppButton
            color="success"
            disabled={saving || !completionNote.trim()}
            onClick={() => {
              setConfirmCompletion(false);
              completeExit();
            }}
          >
            Complete exit
          </AppButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
