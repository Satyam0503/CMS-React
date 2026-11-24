import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Alert, Box, Button, Drawer, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { CustomisedDatePicker } from "../../../../shared/components";
import { RecruitmentRequisitionCommand } from "../../models";
import { getRecruitmentRequisition, upsertRecruitmentRequisition } from "../../services";
import { getReportingChain } from "../../../employees/orgChart/orgChartService";
import { OrgChartNode } from "../../../employees/orgChart/orgChartModel";

type Props = { open: boolean; jobId: string; jobTitle: string; vacancies: number; onClose: () => void };

const key = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const RecruitmentRequisitionDrawer = ({ open, jobId, jobTitle, vacancies, onClose }: Props) => {
  const [requisitionId, setRequisitionId] = useState<string>("");
  const [expectedVersion, setExpectedVersion] = useState<number | undefined>();
  const [headcount, setHeadcount] = useState(String(Math.max(vacancies || 1, 1)));
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [hiringManagerUserId, setHiringManagerUserId] = useState("");
  const [costCenter, setCostCenter] = useState("");
  const [targetStartDateUtc, setTargetStartDateUtc] = useState("");
  const [justification, setJustification] = useState("");
  const [approvalReference, setApprovalReference] = useState("");
  const [status, setStatus] = useState<RecruitmentRequisitionCommand["status"]>("Draft");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; text: string }>();
  const [approverChain, setApproverChain] = useState<OrgChartNode[]>([]);

  useEffect(() => {
    let active = true;
    if (hiringManagerUserId.trim()) {
      Promise.resolve(getReportingChain(hiringManagerUserId.trim()))
        .then((chain) => {
          if (active && Array.isArray(chain)) setApproverChain(chain);
        })
        .catch(() => {
          if (active) setApproverChain([]);
        });
    } else {
      setApproverChain([]);
    }
    return () => {
      active = false;
    };
  }, [hiringManagerUserId]);

  useEffect(() => {
    let active = true;
    if (open) {
      setHeadcount(String(Math.max(vacancies || 1, 1)));
      setFeedback(undefined);
      if (jobId && typeof getRecruitmentRequisition === "function") {
        getRecruitmentRequisition(jobId)
          .then((res) => {
            if (!active) return;
            const req = res?.data?.methodResult;
            if (req) {
              setRequisitionId(req.requisitionId || "");
              setExpectedVersion(req.version);
              if (req.headcount) setHeadcount(String(req.headcount));
              if (req.location) setLocation(req.location);
              if (req.employmentType) setEmploymentType(req.employmentType);
              if (req.hiringManagerUserId) setHiringManagerUserId(req.hiringManagerUserId);
              if (req.costCenter) setCostCenter(req.costCenter);
              if (req.targetStartDateUtc) setTargetStartDateUtc(req.targetStartDateUtc.split("T")[0]);
              if (req.justification) setJustification(req.justification);
              if (req.approvalReference) setApprovalReference(req.approvalReference);
              if (req.status) setStatus(req.status);
            }
          })
          .catch(() => {});
      }
    }
    return () => {
      active = false;
    };
  }, [open, jobId, vacancies]);

  const save = async () => {
    const count = Number(headcount);
    if (!Number.isInteger(count) || count < 1) {
      setFeedback({ ok: false, text: "Enter a positive whole-number headcount." });
      return;
    }
    if (targetStartDateUtc && new Date(targetStartDateUtc).getTime() < new Date().setHours(0, 0, 0, 0)) { setFeedback({ ok: false, text: "Target start date cannot be in the past." }); return; }
    setBusy(true); setFeedback(undefined);
    try {
      const response = await upsertRecruitmentRequisition({
        requisitionId: requisitionId || undefined,
        expectedVersion: expectedVersion || undefined,
        vacancyId: jobId,
        positionTitle: jobTitle,
        location: location.trim() || null,
        employmentType: employmentType || null,
        hiringManagerUserId: hiringManagerUserId.trim() || null,
        costCenter: costCenter.trim() || null,
        targetStartDateUtc: targetStartDateUtc ? new Date(targetStartDateUtc).toISOString() : null,
        justification: justification.trim() || null,
        headcount: count,
        approvalReference: approvalReference.trim() || null,
        idempotencyKey: key(),
        status,
      });
      if (!response.data.success) {
        const code = response.data.errorCode ? `${response.data.errorCode}: ` : "";
        throw new Error(`${code}${response.data.message ?? "Unable to save requisition."}`);
      }
      if (response.data.methodResult) {
        setRequisitionId(response.data.methodResult);
        setExpectedVersion((v) => (v ? v + 1 : 2));
      }
      setFeedback({ ok: true, text: "Headcount request saved." });
    } catch (error) {
      setFeedback({ ok: false, text: error instanceof Error ? error.message : "Unable to save requisition." });
    } finally { setBusy(false); }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      aria-labelledby="requisition-drawer-title"
      sx={{
        zIndex: (theme) => theme.zIndex.modal + 100,
        "& .MuiDrawer-paper": {
          zIndex: (theme) => theme.zIndex.modal + 100,
          width: { xs: "100%", sm: 420 },
          p: { xs: 2, sm: 3 },
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
        },
      }}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          p: { xs: 2, sm: 3 },
          zIndex: (theme) => theme.zIndex.modal + 100,
        },
      }}
      ModalProps={{
        sx: {
          zIndex: (theme) => theme.zIndex.modal + 100,
        },
      }}
    >
      <Stack spacing={2}>
        <Typography id="requisition-drawer-title" variant="h6" fontWeight={800}>
          Plan headcount
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create a tenant-scoped requisition for {jobTitle}.
        </Typography>
        <TextField
          label="Requested headcount"
          type="number"
          value={headcount}
          onChange={(event) => setHeadcount(event.target.value)}
          inputProps={{ min: 1, step: 1 }}
          required
          fullWidth
        />
        <TextField
          label="Location"
          value={location}
          onChange={(event) => setLocation(event.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Employment type"
          value={employmentType}
          onChange={(event) => setEmploymentType(event.target.value)}
          fullWidth
        >
          {["Full-time", "Part-time", "Contract", "Internship", "Consultant"].map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Hiring manager user ID"
          value={hiringManagerUserId}
          onChange={(event) => setHiringManagerUserId(event.target.value)}
          helperText="Optional; use the employee user ID."
          fullWidth
        />
        {approverChain.length > 0 && (
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
            <Typography variant="caption" fontWeight={700} color="primary" sx={{ display: "block", mb: 0.75 }}>
              Org-Chart Approval Hierarchy ({approverChain.length} levels detected):
            </Typography>
            <Stack spacing={0.75}>
              {approverChain.map((node, idx) => (
                <Stack key={node.userId} direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Typography variant="caption" noWrap>
                    Level {idx + 1}: <strong>{node.fullName}</strong> ({node.jobRoleTitle})
                  </Typography>
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => setApprovalReference(`REQ-APPV-${node.employeeId || node.userId}-${dayjs().format("YYYYMM")}`)}
                    sx={{ fontSize: "0.7rem", py: 0, textTransform: "none" }}
                  >
                    Set as Approver
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Box>
        )}
        <TextField
          label="Cost center"
          value={costCenter}
          onChange={(event) => setCostCenter(event.target.value)}
          fullWidth
        />
        <CustomisedDatePicker
          label="Target start date"
          value={targetStartDateUtc ? dayjs(targetStartDateUtc) : null}
          minDate={dayjs().startOf("day")}
          setValue={(value) => setTargetStartDateUtc(value?.format("YYYY-MM-DD") ?? "")}
        />
        <TextField
          label="Business justification"
          value={justification}
          onChange={(event) => setJustification(event.target.value)}
          multiline
          minRows={3}
          fullWidth
        />
        <TextField
          label="Approval reference"
          helperText="Required before approval"
          value={approvalReference}
          onChange={(event) => setApprovalReference(event.target.value)}
          fullWidth
        />
        <TextField
          select
          label="Status"
          value={status}
          onChange={(event) => setStatus(event.target.value as RecruitmentRequisitionCommand["status"])}
          fullWidth
        >
          {["Draft", "PendingApproval", "Approved"].map((value) => (
            <MenuItem key={value} value={value}>
              {value}
            </MenuItem>
          ))}
        </TextField>
        {feedback && <Alert severity={feedback.ok ? "success" : "error"}>{feedback.text}</Alert>}
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Button onClick={onClose} disabled={busy}>
            Close
          </Button>
          <Button variant="contained" onClick={save} disabled={busy}>
            {busy ? "Saving…" : "Save"}
          </Button>
        </Stack>
      </Stack>
    </Drawer>
  );
};
