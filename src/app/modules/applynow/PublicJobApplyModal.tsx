import {
  Alert, Autocomplete, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle,
  Stack, TextField, Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import { ChangeEvent, FormEvent, useState } from "react";
import { applyForPublicJob, uploadPublicResume } from "./publicCareerService";
import { PublicJobDetails } from "./publicCareerTypes";
import { indianStates } from "../../../utils/constant/Constant";

type Props = {
  job: PublicJobDetails | null;
  open: boolean;
  onClose: () => void;
  onSubmitted: (message: string) => void;
};

const initialForm = { firstName: "", lastName: "", email: "", phone: "", state: "", experience: 0, currentCompany: "", currentJobTitle: "", noticePeriodDays: "", linkedInUrl: "", portfolioUrl: "", coverLetter: "" };

export const PublicJobApplyModal = ({ job, open, onClose, onSubmitted }: Props) => {
  const [form, setForm] = useState(initialForm);
  const [resume, setResume] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const update = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: ["experience", "noticePeriodDays"].includes(name) ? (value === "" ? "" : Number(value)) : value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!job) return;
    setError("");
    if (!form.state) {
      setError("Please select your state.");
      return;
    }
    setSaving(true);
    try {
      const { data } = await applyForPublicJob(job.publicJobId, {
        ...form,
        noticePeriodDays: form.noticePeriodDays === "" ? undefined : Number(form.noticePeriodDays),
      });
      if (!data.success || !data.methodResult) throw new Error(data.message || "Application failed.");
      if (resume) {
        await uploadPublicResume(data.methodResult.applicationReference, data.methodResult.resumeUploadToken, resume);
      }
      setForm(initialForm);
      setResume(null);
      onClose();
      onSubmitted(`Thank you for applying for ${job.title}. We have received your application and sent a confirmation to your email. Our hiring team will contact you with an update.`);
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
      "&.Mui-focused": { bgcolor: "background.paper", boxShadow: "0 0 0 3px rgba(156,75,214,.12)" },
    },
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: {
          borderRadius: { xs: 0, sm: 4 }, backgroundImage: "none",
          border: "1px solid", borderColor: "divider",
          boxShadow: "0 32px 80px rgba(15,23,42,.24)", overflow: "hidden",
          m: { xs: 0, sm: 2 }, maxHeight: { xs: "100%", sm: "calc(100% - 32px)" },
        },
      }}
    >
      <Box component="form" onSubmit={submit}>
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
        <DialogContent sx={{ px: { xs: 2.5, sm: 4 }, py: 2 }}>
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField sx={fieldSx} name="firstName" label="First name" value={form.firstName} onChange={update} required fullWidth />
              <TextField sx={fieldSx} name="lastName" label="Last name" value={form.lastName} onChange={update} required fullWidth />
            </Stack>
            <Typography variant="subtitle2" fontWeight={800}>Professional information</Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField sx={fieldSx} name="currentCompany" label="Current company" value={form.currentCompany} onChange={update} fullWidth />
              <TextField sx={fieldSx} name="currentJobTitle" label="Current job title" value={form.currentJobTitle} onChange={update} fullWidth />
            </Stack>
            <TextField sx={fieldSx} name="noticePeriodDays" label="Notice period (days)" type="number" value={form.noticePeriodDays} onChange={update} fullWidth inputProps={{ min: 0 }} />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <TextField sx={fieldSx} name="linkedInUrl" label="LinkedIn URL" type="url" value={form.linkedInUrl} onChange={update} fullWidth />
              <TextField sx={fieldSx} name="portfolioUrl" label="Portfolio or GitHub URL" type="url" value={form.portfolioUrl} onChange={update} fullWidth />
            </Stack>
            <TextField sx={fieldSx} name="coverLetter" label="Cover letter or message" value={form.coverLetter} onChange={update} multiline minRows={3} fullWidth />
            <TextField sx={fieldSx} name="email" label="Email" type="email" value={form.email} onChange={update} required fullWidth />
            <TextField sx={fieldSx} name="phone" label="Phone" value={form.phone} onChange={update} required fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Autocomplete
                fullWidth
                options={indianStates}
                value={indianStates.find((state) => state.value === form.state) ?? null}
                onChange={(_, value) => {
                  setForm((current) => ({ ...current, state: value?.value ?? "" }));
                  if (value) setError("");
                }}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.value === value.value}
                autoHighlight
                renderInput={(params) => (
                  <TextField
                    {...params}
                    sx={fieldSx}
                    label="Select state"
                    required
                    inputProps={{ ...params.inputProps, autoComplete: "new-password" }}
                  />
                )}
                slotProps={{
                  paper: {
                    sx: {
                      mt: 0.75,
                      borderRadius: 2.5,
                      border: "1px solid",
                      borderColor: "divider",
                      boxShadow: "0 16px 40px rgba(15,23,42,.16)",
                    },
                  },
                }}
              />
              <TextField sx={fieldSx} name="experience" label="Experience (years)" type="number" value={form.experience} onChange={update} required fullWidth inputProps={{ min: 0 }} />
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
              <input hidden type="file" accept="application/pdf" onChange={(event) => setResume(event.target.files?.[0] ?? null)} />
            </Button>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: { xs: 2.5, sm: 4 }, pb: { xs: 3, sm: 4 }, pt: 2, gap: 1,
          flexDirection: { xs: "column-reverse", sm: "row" }, "& > :not(style) ~ :not(style)": { ml: { xs: 0, sm: 1 } } }}>
          <Button onClick={onClose} color="inherit" sx={{ minHeight: 46, borderRadius: 2.5, width: { xs: "100%", sm: "auto" } }}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={saving}
            sx={{ px: 3.5, minHeight: 46, borderRadius: 2.5, boxShadow: "none", width: { xs: "100%", sm: "auto" } }}>
            {saving ? "Submitting..." : "Submit application"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};
