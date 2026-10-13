import { useState } from "react";
import dayjs from "dayjs";
import { Alert, Button, Drawer, MenuItem, Stack, TextField, Typography } from "@mui/material";
import { CustomisedDatePicker } from "../../../../shared/components";
import { RecruitmentRequisitionCommand } from "../../models";
import { upsertRecruitmentRequisition } from "../../services";

type Props = { open: boolean; jobId: string; jobTitle: string; vacancies: number; onClose: () => void };

const key = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const RecruitmentRequisitionDrawer = ({ open, jobId, jobTitle, vacancies, onClose }: Props) => {
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
      setFeedback({ ok: true, text: "Headcount request saved." });
    } catch (error) {
      setFeedback({ ok: false, text: error instanceof Error ? error.message : "Unable to save requisition." });
    } finally { setBusy(false); }
  };

  return <Drawer anchor="right" open={open} onClose={onClose} aria-labelledby="requisition-drawer-title" PaperProps={{ sx: { width: { xs: "100%", sm: 420 }, p: { xs: 2, sm: 3 } } }}>
    <Stack spacing={2}>
      <Typography id="requisition-drawer-title" variant="h6" fontWeight={800}>Plan headcount</Typography>
      <Typography variant="body2" color="text.secondary">Create a tenant-scoped requisition for {jobTitle}.</Typography>
      <TextField label="Requested headcount" type="number" value={headcount} onChange={event => setHeadcount(event.target.value)} inputProps={{ min: 1, step: 1 }} required fullWidth />
      <TextField label="Location" value={location} onChange={event => setLocation(event.target.value)} fullWidth />
      <TextField select label="Employment type" value={employmentType} onChange={event => setEmploymentType(event.target.value)} fullWidth>{["Full-time", "Part-time", "Contract", "Internship", "Consultant"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</TextField>
      <TextField label="Hiring manager user ID" value={hiringManagerUserId} onChange={event => setHiringManagerUserId(event.target.value)} helperText="Optional; use the employee user ID." fullWidth />
      <TextField label="Cost center" value={costCenter} onChange={event => setCostCenter(event.target.value)} fullWidth />
      <CustomisedDatePicker label="Target start date" value={targetStartDateUtc ? dayjs(targetStartDateUtc) : null} minDate={dayjs().startOf("day")} setValue={(value) => setTargetStartDateUtc(value?.format("YYYY-MM-DD") ?? "")} />
      <TextField label="Business justification" value={justification} onChange={event => setJustification(event.target.value)} multiline minRows={3} fullWidth />
      <TextField label="Approval reference" helperText="Required before approval" value={approvalReference} onChange={event => setApprovalReference(event.target.value)} fullWidth />
      <TextField select label="Status" value={status} onChange={event => setStatus(event.target.value as RecruitmentRequisitionCommand["status"])} fullWidth>
        {["Draft", "PendingApproval", "Approved"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}
      </TextField>
      {feedback && <Alert severity={feedback.ok ? "success" : "error"}>{feedback.text}</Alert>}
      <Stack direction="row" spacing={1} justifyContent="flex-end"><Button onClick={onClose} disabled={busy}>Close</Button><Button variant="contained" onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button></Stack>
    </Stack>
  </Drawer>;
};