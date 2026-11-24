import {
  Alert, Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem,
  Stack, TextField, Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { PublicJobDetails } from "./publicCareerTypes";
import { validatePublicApplicationCandidateFields } from "./publicApplicationValidation";
import { submitPublicApplication } from "./publicApplicationSubmission";
import { acknowledgesCurrentPrivacyNotice } from "./privacyNoticeRules";
import { clearPublicApplicationSubmissionKey, getPublicApplicationSubmissionKey } from "./publicApplicationIdempotency";
import { capturePublicApplicationAttribution } from "./publicApplicationAttribution";

type Props = {
  job: PublicJobDetails | null;
  open: boolean;
  onClose: () => void;
  onSubmitted: (message: string) => void;
};

const defaultCandidateSourceOptions = ["Career site", "Employee referral", "Job board", "Social media", "Search engine", "Recruitment agency", "Event", "Other", "Prefer not to say"];
const initialForm = { firstName: "", lastName: "", email: "", phone: "", state: "", experience: 0, currentCompany: "", currentJobTitle: "", noticePeriodDays: "", linkedInUrl: "", portfolioUrl: "", coverLetter: "", candidateReportedSource: "", candidateReportedSourceDetail: "" };

export const PublicJobApplyModal = ({ job, open, onClose, onSubmitted }: Props) => {
  const [form, setForm] = useState(initialForm);
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [privacyAcknowledged, setPrivacyAcknowledged] = useState(false);
  const [pendingApplication, setPendingApplication] = useState<{
    applicationReference: string;
    resumeUploadToken: string;
  } | null>(null);

  useEffect(() => {
    setPrivacyAcknowledged(false);
  }, [job?.publicJobId, job?.candidatePrivacyNoticeVersion, open]);

  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: ["experience", "noticePeriodDays"].includes(name) ? (value === "" ? "" : Number(value)) : value,
      ...(name === "candidateReportedSource" && value !== "Other" ? { candidateReportedSourceDetail: "" } : {}),
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!job) return;
    setError("");
    const candidateValidationError = validatePublicApplicationCandidateFields(form);
    if (candidateValidationError) {
      setError(candidateValidationError);
      return;
    }
    if (!pendingApplication && !acknowledgesCurrentPrivacyNotice(privacyAcknowledged, job.candidatePrivacyNoticeVersion, job.candidatePrivacyNoticeVersion)) {
      setError("Review and acknowledge the current candidate privacy notice before applying.");
      return;
    }
    setSaving(true);
    try {
      const applicationPayload = {
        ...form,
        noticePeriodDays: form.noticePeriodDays === "" ? undefined : Number(form.noticePeriodDays),
        privacyAcknowledged: true,
        privacyNoticeVersion: job.candidatePrivacyNoticeVersion ?? "",
        ...capturePublicApplicationAttribution(job.publicJobId, window.location.search, document.referrer, window.location.hostname),
      };
      const idempotencyKey = await getPublicApplicationSubmissionKey(job.publicJobId, applicationPayload);
      const application = await submitPublicApplication({
        publicJobId: job.publicJobId,
        payload: {
          ...applicationPayload,
          idempotencyKey,
        },
        resume,
        pendingApplication,
        onApplicationCreated: setPendingApplication,
      });
      await clearPublicApplicationSubmissionKey(job.publicJobId, applicationPayload);
      setForm(initialForm);
      setResume(null);
      setPrivacyAcknowledged(false);
      setPendingApplication(null);
      onClose();
      onSubmitted(`Thank you for applying for ${job.title}. Reference: ${application.applicationReference}. Use this with your email to check status from the Careers header.`);
    } catch (reason) {
      setError((reason as Error).message || "Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  const fieldSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2.5,
      bgcolor: "action.hover",
      transition: "background-color .2s, box-shadow .2s",
      "&.Mui-focused": { bgcolor: "background.paper", boxShadow: "none" },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      scroll="paper"
      PaperProps={{
        sx: {
          width: { xs: "calc(100% - 24px)", sm: "100%" },
          height: { xs: "calc(100dvh - 24px)", sm: "auto" },
          maxHeight: { xs: "calc(100dvh - 24px)", sm: "calc(100dvh - 48px)" },
          m: { xs: 1.5, sm: 3 },
          borderRadius: { xs: 3, sm: 4 }, backgroundImage: "none",
          border: "1px solid", borderColor: "divider",
          boxShadow: "0 32px 80px rgba(15,23,42,.24)", overflow: "hidden",
          display: "flex", flexDirection: "column",
          "@media (max-width: 359px)": { width: "100%", height: "100dvh", maxHeight: "100dvh", m: 0, borderRadius: 0 },
        },
      }}
    >
      <Box component="form" onSubmit={submit} sx={{ display: "flex", flexDirection: "column", flex: 1, minHeight: 0 }}>
        <DialogTitle sx={{ px: { xs: 2.5, sm: 4 }, pt: { xs: 3, sm: 4 }, pb: 2 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
            <Box>
              <Typography variant="h4" fontWeight={800} letterSpacing="-.035em">Apply for this role</Typography>
              <Typography color="text.secondary" sx={{ mt: 0.75 }}>{job?.title} &bull; {job?.companyName}</Typography>
            </Box>
            <Button onClick={onClose} color="inherit" aria-label="Close application form"
              sx={{ minWidth: 42, width: 42, height: 42, borderRadius: 2, p: 0, bgcolor: "action.hover" }}>
              <CloseRoundedIcon />
            </Button>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 2, flex: 1, minHeight: 0, overflowY: "auto", WebkitOverflowScrolling: "touch" }}>
          <Stack spacing={{ xs: 1.5, sm: 2 }}>
            {error && <Alert severity="error" role="alert">{error}</Alert>}
            {pendingApplication && <Alert severity="info">Your application has been submitted. Your details are locked while we retry attaching the resume; choose a PDF and select “Retry resume upload.”</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField sx={fieldSx} name="firstName" label="First name" value={form.firstName} onChange={update} required fullWidth disabled={Boolean(pendingApplication)} />
              <TextField sx={fieldSx} name="lastName" label="Last name" value={form.lastName} onChange={update} required fullWidth disabled={Boolean(pendingApplication)} />
            </Stack>
            <Typography variant="subtitle2" fontWeight={800}>Professional information</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField sx={fieldSx} name="currentCompany" label="Current company" value={form.currentCompany} onChange={update} fullWidth disabled={Boolean(pendingApplication)} />
              <TextField sx={fieldSx} name="currentJobTitle" label="Current job title" value={form.currentJobTitle} onChange={update} fullWidth disabled={Boolean(pendingApplication)} />
            </Stack>
            <TextField sx={fieldSx} name="noticePeriodDays" label="Notice period (days)" type="number" value={form.noticePeriodDays} onChange={update} fullWidth inputProps={{ min: 0, max: 3650 }} disabled={Boolean(pendingApplication)} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField sx={fieldSx} name="linkedInUrl" label="LinkedIn URL" type="url" value={form.linkedInUrl} onChange={update} fullWidth disabled={Boolean(pendingApplication)} />
              <TextField sx={fieldSx} name="portfolioUrl" label="Portfolio or GitHub URL" type="url" value={form.portfolioUrl} onChange={update} fullWidth disabled={Boolean(pendingApplication)} />
            </Stack>
            <TextField sx={fieldSx} name="coverLetter" label="Cover letter or message" value={form.coverLetter} onChange={update} multiline minRows={3} fullWidth disabled={Boolean(pendingApplication)} />
            <TextField sx={fieldSx} name="candidateReportedSource" label="How did you hear about this role? (optional)" value={form.candidateReportedSource} onChange={update} select fullWidth disabled={Boolean(pendingApplication)} helperText="Your answer is recorded as candidate-reported information.">
              <MenuItem value="">Select a source</MenuItem>
              {(job?.candidateSourceOptions?.length ? job.candidateSourceOptions : defaultCandidateSourceOptions).map((source) => <MenuItem key={source} value={source}>{source}</MenuItem>)}
            </TextField>
            {form.candidateReportedSource === "Other" && <TextField sx={fieldSx} name="candidateReportedSourceDetail" label="Where did you hear about us? (optional)" value={form.candidateReportedSourceDetail} onChange={update} fullWidth inputProps={{ maxLength: 250 }} disabled={Boolean(pendingApplication)} />}
            <Typography variant="caption" color="text.secondary">We also record basic campaign tags and the referring website domain to understand how candidates find roles. These details may be incomplete.</Typography>
            <TextField sx={fieldSx} name="email" label="Email" type="email" value={form.email} onChange={update} required fullWidth disabled={Boolean(pendingApplication)} />
            <TextField sx={fieldSx} name="phone" label="Phone" type="tel" placeholder="+1 415 555 0132" autoComplete="tel" inputProps={{ maxLength: 25 }} helperText="Include a country code when needed." value={form.phone} onChange={update} required fullWidth disabled={Boolean(pendingApplication)} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField sx={fieldSx} name="state" label="State, province, or region" value={form.state} onChange={update} required fullWidth inputProps={{ maxLength: 120 }} disabled={Boolean(pendingApplication)} />
              <TextField sx={fieldSx} name="experience" label="Experience (years)" type="number" value={form.experience} onChange={update} required fullWidth inputProps={{ min: 0, max: 80, step: 0.5 }} disabled={Boolean(pendingApplication)} />
            </Stack>
            <Button variant="outlined" component="label" startIcon={<CloudUploadOutlinedIcon />}
              sx={{ minHeight: 92, borderRadius: 3, borderStyle: "dashed", borderWidth: 1.5, bgcolor: "action.hover",
                textTransform: "none", flexDirection: "column", gap: 0.5, "&:hover": { borderWidth: 1.5, bgcolor: "action.selected" } }}>
              {resume ? (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, maxWidth: "100%" }}>
                  <DescriptionOutlinedIcon fontSize="small" />
                  <Typography fontWeight={700} noWrap>{resume.name}</Typography>
                </Stack>
              ) : (
                <>
                  <Typography fontWeight={750}>Upload your resume</Typography>
                  <Typography variant="caption" color="text.secondary">PDF format, up to 5 MB</Typography>
                </>
              )}
              <input hidden type="file" accept="application/pdf,.pdf" onChange={(event) => {
                const file = event.target.files?.[0] ?? null;
                if (file && (file.size > 5 * 1024 * 1024 || !file.name.toLowerCase().endsWith(".pdf"))) {
                  setError(file.size > 5 * 1024 * 1024 ? "Choose a PDF up to 5 MB." : "Choose a PDF file.");
                  setResume(null);
                } else {
                  setError("");
                  setResume(file);
                }
              }} />
            </Button>
            <Box sx={{ p: 1.5, borderRadius: 2.5, border: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
              <Typography variant="subtitle2" fontWeight={750} sx={{ mb: 0.5 }}>Candidate privacy notice · Version {job?.candidatePrivacyNoticeVersion}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.65 }}>
                {job?.candidatePrivacyNoticeText || "The company has not provided its candidate privacy notice."}
              </Typography>
              <FormControlLabel
                sx={{ alignItems: "flex-start", mt: 1, mr: 0 }}
                control={<Checkbox checked={privacyAcknowledged} disabled={Boolean(pendingApplication)} onChange={(event) => setPrivacyAcknowledged(event.target.checked)} inputProps={{ "aria-label": "I acknowledge the candidate privacy notice" }} />}
                label={<Typography variant="body2" sx={{ pt: 1 }}>I have read and acknowledge this notice. I understand it applies to the information I submit for this application.</Typography>}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, pb: { xs: 2.5, sm: 4 }, pt: 2, gap: 1, flexShrink: 0,
          flexDirection: { xs: "column-reverse", sm: "row" }, "& > :not(style) ~ :not(style)": { ml: { xs: 0, sm: 1 } } }}>
          <Button onClick={onClose} color="inherit" sx={{ minHeight: 46, borderRadius: 2.5, width: { xs: "100%", sm: "auto" } }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving || Boolean(pendingApplication && !resume)}
            sx={{ px: 3.5, minHeight: 46, borderRadius: 2.5, boxShadow: "none", width: { xs: "100%", sm: "auto" } }}>
            {saving ? (pendingApplication ? "Uploading resume..." : "Submitting...") : pendingApplication ? "Retry resume upload" : "Submit application"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
