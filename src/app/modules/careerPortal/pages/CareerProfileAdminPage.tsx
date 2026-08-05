import { CloseRounded, EditRounded, LaunchRounded, PreviewRounded, SaveRounded, VisibilityRounded } from "@mui/icons-material";
import { Alert, Box, Button, Chip, CircularProgress, FormControlLabel, Paper, Stack, Switch, Tab, Tabs, TextField, Typography } from "@mui/material";
import DOMPurify from "dompurify";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { ModulesName, Permission, Roles } from "../../../../utils/enums";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { useAppSelector } from "../../../Redux/hooks";
import { CompanyLogo } from "../components/CompanyLogo";
import { getManagedCompanyProfile, saveManagedCompanyProfile } from "../services/careerPortalService";
import { PublicCompanyProfile } from "../types/careerPortalTypes";

const emptyProfile: PublicCompanyProfile = {
  publicCompanyCode: "", displayName: "", officeLocations: [], values: [], benefits: [], technologies: [], socialLinks: {}, isPublished: false,
};

const CsvField = ({ label, value, onChange }: { label: string; value: string[]; onChange: (value: string[]) => void }) => (
  <TextField fullWidth label={label} value={value.join(", ")}
    onChange={(event) => onChange(event.target.value.split(",").map((item) => item.trim()).filter(Boolean))}
    helperText="Separate values with commas" />
);

export const CareerProfileAdminPage = () => {
  const userData = useAppSelector((state) => state.user.userData);
  const canEdit = userData?.roleType === Roles.Administrator || hasModuleFeaturePermission(
    ModulesName.CareerProfile,
    Permission.Edit,
    userData?.modulePermission ?? [],
  );
  const [profile, setProfile] = useState(emptyProfile);
  const [savedProfile, setSavedProfile] = useState(emptyProfile);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getManagedCompanyProfile()
      .then(({ data }) => {
        if (!data.methodResult) return;
        setProfile(data.methodResult);
        setSavedProfile(data.methodResult);
      })
      .catch((reason) => setError(reason?.response?.data?.message || "Career profile could not be loaded."))
      .finally(() => setLoading(false));
  }, []);

  const set = <K extends keyof PublicCompanyProfile>(key: K, value: PublicCompanyProfile[K]) =>
    setProfile((current) => ({ ...current, [key]: value }));

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const { data } = await saveManagedCompanyProfile(profile);
      if (!data.success) throw new Error(data.message);
      const saved = data.methodResult ?? profile;
      setProfile(saved);
      setSavedProfile(saved);
      setEditing(false);
      toast.success(data.message || "Career profile saved.");
    } catch (reason: any) {
      setError(reason?.response?.data?.message || reason.message || "Career profile could not be saved.");
    } finally { setSaving(false); }
  };

  if (loading) return <Box sx={{ minHeight: 400, display: "grid", placeItems: "center" }}><CircularProgress /></Box>;

  if (!canEdit) {
    const publicPageUrl = profile.publicCompanyCode ? `/careers/${profile.publicCompanyCode}` : "";
    return (
      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 760, mx: "auto" }}>
        <Paper variant="outlined" sx={{ p: { xs: 3, md: 4 }, borderRadius: 4 }}>
          <Stack spacing={2.5} alignItems="flex-start">
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ display: "grid", placeItems: "center", width: 42, height: 42, borderRadius: 2.5, bgcolor: "primary.light", color: "primary.contrastText" }}><VisibilityRounded /></Box>
              <Box><Typography variant="h5" fontWeight={850}>Career profile</Typography><Typography color="text.secondary">You have view-only access to your company’s public careers page.</Typography></Box>
            </Stack>
            <Chip size="small" color={profile.isPublished ? "success" : "default"} label={profile.isPublished ? "Published" : "Not published"} />
            {publicPageUrl ? <Button variant="contained" component="a" href={publicPageUrl} target="_blank" rel="noopener noreferrer" startIcon={<LaunchRounded />}>Open public careers page</Button> : <Alert severity="info">A public careers link will appear here once the company profile is published.</Alert>}
          </Stack>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={2}>
        <Box><Typography variant="h4" fontWeight={900}>Public career profile</Typography><Typography color="text.secondary">Shape how candidates see your company before they apply.</Typography></Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {!!profile.publicCompanyCode && <Button href={`/careers/${profile.publicCompanyCode}`} target="_blank" rel="noopener noreferrer" startIcon={<LaunchRounded />}>Open public page</Button>}
          {editing ? <><Button startIcon={<CloseRounded />} disabled={saving} onClick={() => { setProfile(savedProfile); setError(""); setEditing(false); }}>Cancel</Button><Button variant="contained" startIcon={<SaveRounded />} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button></> : <Button variant="contained" startIcon={<EditRounded />} onClick={() => setEditing(true)}>Edit profile</Button>}
        </Stack>
      </Stack>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Paper sx={{ mt: 3, borderRadius: 4, border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable"><Tab label="Company story" /><Tab label="Culture & benefits" /><Tab label="Preview" icon={<PreviewRounded />} iconPosition="start" /></Tabs>
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {!editing && tab !== 2 && <Alert severity="info" sx={{ mb: 2 }}>This profile is read-only. Select Edit profile to make changes.</Alert>}
          <fieldset disabled={!editing && tab !== 2} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            {tab === 0 && <Stack spacing={2.5}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}><TextField disabled fullWidth label="Company name" value={profile.displayName} helperText="Managed in Company Details and kept in sync automatically." /><TextField fullWidth label="Industry" value={profile.industry ?? ""} onChange={(e) => set("industry", e.target.value)} /><TextField fullWidth label="Company size" value={profile.companySize ?? ""} onChange={(e) => set("companySize", e.target.value)} /></Stack>
              <TextField fullWidth label="Short description" multiline minRows={2} value={profile.shortDescription ?? ""} onChange={(e) => set("shortDescription", e.target.value)} />
              <TextField fullWidth label="About company (safe HTML supported)" multiline minRows={6} value={profile.aboutCompanyHtml ?? ""} onChange={(e) => set("aboutCompanyHtml", e.target.value)} />
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}><TextField fullWidth label="Website" value={profile.websiteUrl ?? ""} onChange={(e) => set("websiteUrl", e.target.value)} /><TextField disabled fullWidth label="Company logo" value={profile.logoUrl ?? ""} helperText="Managed in Company Details and kept in sync automatically." /><TextField fullWidth label="Cover image URL" value={profile.coverImageUrl ?? ""} onChange={(e) => set("coverImageUrl", e.target.value)} /></Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}><TextField fullWidth label="Headquarters" value={profile.headquarters ?? ""} onChange={(e) => set("headquarters", e.target.value)} /><TextField fullWidth label="Founded year" type="number" value={profile.foundedYear ?? ""} onChange={(e) => set("foundedYear", e.target.value ? Number(e.target.value) : null)} /><TextField fullWidth label="Company type" value={profile.companyType ?? ""} onChange={(e) => set("companyType", e.target.value)} /></Stack>
              <CsvField label="Office locations" value={profile.officeLocations} onChange={(value) => set("officeLocations", value)} />
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}><TextField fullWidth label="Mission" multiline minRows={3} value={profile.mission ?? ""} onChange={(e) => set("mission", e.target.value)} /><TextField fullWidth label="Vision" multiline minRows={3} value={profile.vision ?? ""} onChange={(e) => set("vision", e.target.value)} /></Stack>
            </Stack>}
            {tab === 1 && <Stack spacing={2.5}>
              <CsvField label="Values" value={profile.values} onChange={(value) => set("values", value)} /><CsvField label="Benefits" value={profile.benefits} onChange={(value) => set("benefits", value)} /><CsvField label="Technologies" value={profile.technologies} onChange={(value) => set("technologies", value)} />
              <TextField fullWidth label="Work culture (safe HTML supported)" multiline minRows={5} value={profile.workCultureHtml ?? ""} onChange={(e) => set("workCultureHtml", e.target.value)} /><TextField fullWidth label="Hiring process (safe HTML supported)" multiline minRows={5} value={profile.hiringProcessHtml ?? ""} onChange={(e) => set("hiringProcessHtml", e.target.value)} /><TextField fullWidth label="Diversity statement (safe HTML supported)" multiline minRows={4} value={profile.diversityStatementHtml ?? ""} onChange={(e) => set("diversityStatementHtml", e.target.value)} />
              <FormControlLabel control={<Switch checked={profile.isPublished} onChange={(e) => set("isPublished", e.target.checked)} />} label={profile.isPublished ? "Published on the career portal" : "Saved as draft"} />
            </Stack>}
          </fieldset>
          {tab === 2 && <Box>
            <Box sx={{ p: { xs: 3, md: 5 }, borderRadius: 4, color: "#fff", background: profile.coverImageUrl ? `linear-gradient(110deg, rgba(18,20,45,.9), rgba(91,56,180,.75)), url("${profile.coverImageUrl}") center/cover` : "linear-gradient(125deg, #17142f, var(--mui-palette-primary-main))" }}><Stack direction="row" spacing={2} alignItems="center"><CompanyLogo src={profile.logoUrl} name={profile.displayName || "Your company"} size={64} /><Box><Typography variant="h3" fontWeight={950}>{profile.displayName || "Your company"}</Typography><Typography sx={{ color: "rgba(255,255,255,.75)" }}>{profile.shortDescription || "Your public company story will appear here."}</Typography></Box></Stack></Box>
            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 3 }}>{profile.values.map((item) => <Chip key={item} label={item} />)}{profile.technologies.map((item) => <Chip key={item} color="primary" variant="outlined" label={item} />)}</Stack>
            {profile.aboutCompanyHtml && <Box dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(profile.aboutCompanyHtml) }} sx={{ mt: 3, color: "text.secondary", lineHeight: 1.8 }} />}
          </Box>}
        </Box>
      </Paper>
    </Box>
  );
};
