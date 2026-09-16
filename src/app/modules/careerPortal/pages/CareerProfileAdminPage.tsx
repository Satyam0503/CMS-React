import { CloseRounded, CodeRounded, EditRounded, FormatBoldRounded, FormatClearRounded, FormatItalicRounded, FormatListBulletedRounded, FormatListNumberedRounded, InfoOutlined, InsertLinkRounded, LaunchRounded, PreviewRounded, SaveRounded, TitleRounded, VisibilityRounded } from "@mui/icons-material";
import { Alert, Box, Button, Chip, CircularProgress, FormControlLabel, IconButton, InputAdornment, Paper, Stack, Switch, Tab, Tabs, TextField, Tooltip, Typography } from "@mui/material";
import type { TextFieldProps } from "@mui/material";
import DOMPurify from "dompurify";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import { ModulesName, Permission, Roles } from "../../../../utils/enums";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { useAppSelector } from "../../../Redux/hooks";
import { usePageData } from "../../../Context/PageDataProvider";
import { CompanyLogo } from "../components/CompanyLogo";
import { getManagedCompanyProfile, saveManagedCompanyProfile } from "../services/careerPortalService";
import { PublicCompanyProfile } from "../types/careerPortalTypes";

const emptyProfile: PublicCompanyProfile = {
  publicCompanyCode: "", displayName: "", officeLocations: [], values: [], benefits: [], technologies: [], socialLinks: {}, careerTheme: "glass", isPublished: false,
};

const parseCommaSeparatedValues = (value: string) =>
  value.split(",").map((item) => item.trim()).filter(Boolean);

const fieldHelp: Partial<Record<keyof PublicCompanyProfile, string>> = {
  industry: "Industry helps candidates understand your business area.", companySize: "Company size is shown to candidates as general context.",
  shortDescription: "A short introduction displayed near the top of your careers page.", aboutCompanyHtml: "Your longer company introduction shown to candidates.",
  websiteUrl: "Your public company website link.", coverImageUrl: "Banner image shown at the top of the careers page.",
  headquarters: "Main company location shown on the public page.", foundedYear: "The year your company was founded.", companyType: "A short description of your organization type.",
  officeLocations: "Locations where your company operates.", mission: "What your company aims to achieve.", vision: "The future your company is working toward.",
  values: "Values candidates will see on your public careers page.", benefits: "Benefits and perks available to employees.", technologies: "Technologies commonly used by your teams.",
  workCultureHtml: "Describe how teams work together at your company.", hiringProcessHtml: "Explain the steps candidates can expect after applying.", diversityStatementHtml: "Share your company’s inclusion commitment.",
};

type ProfileFieldProps = TextFieldProps & {
  helpField?: keyof PublicCompanyProfile;
};

const ProfileField = ({ helpField, InputProps, ...props }: ProfileFieldProps) => {
  const help = helpField ? fieldHelp[helpField] : undefined;
  const label = typeof props.label === "string" ? props.label : "this field";

  return (
    <TextField
      {...props}
      className={["career-profile-field", props.className].filter(Boolean).join(" ")}
      fullWidth={props.fullWidth ?? true}
      InputProps={{
        ...InputProps,
        endAdornment: (
          <>
            {InputProps?.endAdornment}
            {help && (
              <InputAdornment
                position="end"
                className="career-profile-field-help"
                sx={{
                  opacity: 0,
                  transition: "opacity 160ms ease",
                  ".career-profile-field:hover &, .career-profile-field:focus-within &": { opacity: 1 },
                }}
              >
                <Tooltip title={help} enterTouchDelay={0}>
                  <IconButton size="small" aria-label={`Help for ${label}`} sx={{ p: 0.35 }}>
                    <InfoOutlined fontSize="inherit" />
                  </IconButton>
                </Tooltip>
              </InputAdornment>
            )}
          </>
        ),
      }}
      sx={{
        "& .MuiInputBase-root": { pr: help ? 0.25 : undefined },
        ...props.sx,
      }}
    />
  );
};

const HtmlEditor = ({ label, field, value, onChange, readOnly, minHeight = 220 }: {
  label: string;
  field: keyof PublicCompanyProfile;
  value: string;
  onChange: (value: string) => void;
  readOnly: boolean;
  minHeight?: number;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [sourceMode, setSourceMode] = useState(false);
  const help = fieldHelp[field];

  useEffect(() => {
    if (!editorRef.current || sourceMode) return;
    const safeValue = DOMPurify.sanitize(value);
    if (editorRef.current.innerHTML !== safeValue) editorRef.current.innerHTML = safeValue;
  }, [sourceMode, value]);

  const updateValue = () => onChange(DOMPurify.sanitize(editorRef.current?.innerHTML ?? ""));
  const command = (name: string, commandValue?: string) => {
    editorRef.current?.focus();
    document.execCommand(name, false, commandValue);
    updateValue();
  };
  const insertLink = () => {
    const url = window.prompt("Enter a full URL (https://...)");
    if (!url) return;
    command("createLink", url);
  };

  return (
    <Box className="career-profile-field" sx={{ minWidth: 0 }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
        <Stack direction="row" alignItems="center" spacing={0.75}>
          <Typography variant="subtitle2" fontWeight={750}>{label}</Typography>
          <Chip size="small" label="Safe rich text" variant="outlined" sx={{ height: 21, fontSize: "0.7rem" }} />
        </Stack>
        <Tooltip title={sourceMode ? "Use visual editor" : "Edit HTML source"}><span><IconButton size="small" aria-label={sourceMode ? "Use visual editor" : "Edit HTML source"} disabled={readOnly} color={sourceMode ? "primary" : "default"} onClick={() => setSourceMode((current) => !current)}><CodeRounded fontSize="small" /></IconButton></span></Tooltip>
      </Stack>
      <Paper variant="outlined" sx={{ position: "relative", overflow: "hidden", borderColor: "divider", bgcolor: readOnly ? "action.hover" : "background.paper" }}>
        {help && <Tooltip title={help} enterTouchDelay={0}><IconButton className="career-profile-field-help" size="small" aria-label={`Help for ${label}`} sx={{ position: "absolute", zIndex: 2, top: 7, right: 7, opacity: 0, transition: "opacity 160ms ease", ".career-profile-field:hover &": { opacity: 1 } }}><InfoOutlined fontSize="inherit" /></IconButton></Tooltip>}
        {!sourceMode && (
          <Stack direction="row" spacing={0.25} useFlexGap flexWrap="wrap" sx={{ p: 0.5, borderBottom: "1px solid", borderColor: "divider", bgcolor: "action.hover" }}>
            <Tooltip title="Bold"><span><IconButton size="small" disabled={readOnly} onMouseDown={(event) => event.preventDefault()} onClick={() => command("bold")} aria-label="Bold text"><FormatBoldRounded fontSize="small" /></IconButton></span></Tooltip>
            <Tooltip title="Italic"><span><IconButton size="small" disabled={readOnly} onMouseDown={(event) => event.preventDefault()} onClick={() => command("italic")} aria-label="Italic text"><FormatItalicRounded fontSize="small" /></IconButton></span></Tooltip>
            <Tooltip title="Heading"><span><IconButton size="small" disabled={readOnly} onMouseDown={(event) => event.preventDefault()} onClick={() => command("formatBlock", "h3")} aria-label="Heading"><TitleRounded fontSize="small" /></IconButton></span></Tooltip>
            <Tooltip title="Bulleted list"><span><IconButton size="small" disabled={readOnly} onMouseDown={(event) => event.preventDefault()} onClick={() => command("insertUnorderedList")} aria-label="Bulleted list"><FormatListBulletedRounded fontSize="small" /></IconButton></span></Tooltip>
            <Tooltip title="Numbered list"><span><IconButton size="small" disabled={readOnly} onMouseDown={(event) => event.preventDefault()} onClick={() => command("insertOrderedList")} aria-label="Numbered list"><FormatListNumberedRounded fontSize="small" /></IconButton></span></Tooltip>
            <Tooltip title="Insert link"><span><IconButton size="small" disabled={readOnly} onMouseDown={(event) => event.preventDefault()} onClick={insertLink} aria-label="Insert link"><InsertLinkRounded fontSize="small" /></IconButton></span></Tooltip>
            <Tooltip title="Clear formatting"><span><IconButton size="small" disabled={readOnly} onMouseDown={(event) => event.preventDefault()} onClick={() => command("removeFormat")} aria-label="Clear formatting"><FormatClearRounded fontSize="small" /></IconButton></span></Tooltip>
          </Stack>
        )}
        {sourceMode ? (
          <TextField
            fullWidth
            multiline
            minRows={Math.max(6, Math.round(minHeight / 28))}
            value={value}
            disabled={readOnly}
            onChange={(event) => onChange(event.target.value)}
            placeholder="Write safe HTML…"
            InputProps={{ sx: { fontFamily: "monospace", alignItems: "flex-start" } }}
            sx={{ "& .MuiOutlinedInput-notchedOutline": { border: 0 }, "& .MuiInputBase-root": { borderRadius: 0 } }}
          />
        ) : (
          <Box
            ref={editorRef}
            contentEditable={!readOnly}
            suppressContentEditableWarning
            role="textbox"
            aria-label={label}
            aria-multiline="true"
            onInput={updateValue}
            sx={{
              minHeight,
              px: 1.5,
              py: 1.25,
              outline: "none",
              overflowWrap: "anywhere",
              color: "text.primary",
              cursor: readOnly ? "default" : "text",
              "&:focus": { boxShadow: "inset 0 0 0 2px", boxShadowColor: "primary.main" },
              "&:empty:before": { content: '"Write your company story…"', color: "text.disabled" },
              "& h1, & h2, & h3": { mt: 0.5, mb: 1, color: "text.primary" },
              "& p": { mt: 0, mb: 1.25, lineHeight: 1.7 },
              "& ul, & ol": { mt: 0.5, mb: 1.25, pl: 3 },
              "& a": { color: "primary.main" },
            }}
          />
        )}
      </Paper>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75 }}>
        Use the toolbar for normal editing. HTML is sanitized before preview and save.
      </Typography>
    </Box>
  );
};

const CsvField = ({ label, field, value, onChange }: { label: string; field: keyof PublicCompanyProfile; value: string[]; onChange: (value: string[]) => void }) => {
  // Keep the text the user is actively typing separate from the saved array.
  // Parsing on every keystroke is still useful to keep the form state current,
  // but the draft must retain a trailing comma or space until the user finishes.
  const [draft, setDraft] = useState(() => value.join(", "));

  useEffect(() => {
    const parsedDraft = parseCommaSeparatedValues(draft);
    const matchesValue = parsedDraft.length === value.length && parsedDraft.every((item, index) => item === value[index]);
    if (!matchesValue) setDraft(value.join(", "));
  }, [value]);

  return (
    <ProfileField
      helpField={field}
      label={label}
      value={draft}
      onChange={(event) => {
        const nextDraft = event.target.value;
        setDraft(nextDraft);
        onChange(parseCommaSeparatedValues(nextDraft));
      }}
      helperText="Separate values with commas. Spaces inside a value are allowed."
    />
  );
};

export const CareerProfileAdminPage = () => {
  const { setPageTitle } = usePageData();
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
  const pageHeaderActionsTarget = document.getElementById("page-header-actions");

  useEffect(() => { document.title = `${profile.displayName || "Company"} Careers`; }, [profile.displayName]);
  useEffect(() => {
    setPageTitle("Career Profile");
    return () => setPageTitle("");
  }, [setPageTitle]);

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
    <>
      {pageHeaderActionsTarget && createPortal(
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: "flex-start", md: "flex-end" }, width: { xs: "100%", md: "auto" } }}>
          {!!profile.publicCompanyCode && <Button href={`/careers/${profile.publicCompanyCode}`} target="_blank" rel="noopener noreferrer" startIcon={<LaunchRounded />}>Open public page</Button>}
          {editing ? <><Button startIcon={<CloseRounded />} disabled={saving} onClick={() => { setProfile(savedProfile); setError(""); setEditing(false); }}>Cancel</Button><Button variant="contained" startIcon={<SaveRounded />} onClick={save} disabled={saving}>{saving ? "Saving..." : "Save changes"}</Button></> : <Button variant="contained" startIcon={<EditRounded />} onClick={() => setEditing(true)}>Edit profile</Button>}
        </Stack>, pageHeaderActionsTarget)}
    <Box sx={{ minWidth: 0, width: "100%" }}>
      {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      <Paper sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
        <Tabs value={tab} onChange={(_, value) => setTab(value)} variant="scrollable"><Tab label="Company story" /><Tab label="Culture & benefits" /><Tab label="Preview" icon={<PreviewRounded />} iconPosition="start" /></Tabs>
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {!editing && tab !== 2 && <Alert severity="info" sx={{ mb: 2 }}>This profile is read-only. Select Edit profile to make changes.</Alert>}
          <fieldset disabled={!editing && tab !== 2} style={{ border: 0, padding: 0, margin: 0, minWidth: 0 }}>
            {tab === 0 && <Stack spacing={2.5}>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}><ProfileField disabled label="Company name" value={profile.displayName} helperText="Managed in Company Details and kept in sync automatically." /><ProfileField helpField="industry" label="Industry" value={profile.industry ?? ""} onChange={(e) => set("industry", e.target.value)} /><ProfileField helpField="companySize" label="Company size" value={profile.companySize ?? ""} onChange={(e) => set("companySize", e.target.value)} /></Stack>
              <ProfileField helpField="shortDescription" label="Short description" multiline minRows={2} value={profile.shortDescription ?? ""} onChange={(e) => set("shortDescription", e.target.value)} />
              <HtmlEditor label="About company" field="aboutCompanyHtml" value={profile.aboutCompanyHtml ?? ""} onChange={(value) => set("aboutCompanyHtml", value)} readOnly={!editing} minHeight={260} />
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}><ProfileField helpField="websiteUrl" label="Website" value={profile.websiteUrl ?? ""} onChange={(e) => set("websiteUrl", e.target.value)} /><ProfileField disabled label="Company logo" value={profile.logoUrl ?? ""} helperText="Managed in Company Details and kept in sync automatically." /><ProfileField helpField="coverImageUrl" label="Cover image URL" value={profile.coverImageUrl ?? ""} onChange={(e) => set("coverImageUrl", e.target.value)} /></Stack>
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}><ProfileField helpField="headquarters" label="Headquarters" value={profile.headquarters ?? ""} onChange={(e) => set("headquarters", e.target.value)} /><ProfileField helpField="foundedYear" label="Founded year" type="number" value={profile.foundedYear ?? ""} onChange={(e) => set("foundedYear", e.target.value ? Number(e.target.value) : null)} /><ProfileField helpField="companyType" label="Company type" value={profile.companyType ?? ""} onChange={(e) => set("companyType", e.target.value)} /></Stack>
              <CsvField label="Office locations" field="officeLocations" value={profile.officeLocations} onChange={(value) => set("officeLocations", value)} />
              <Stack direction={{ xs: "column", md: "row" }} spacing={2}><ProfileField helpField="mission" label="Mission" multiline minRows={3} value={profile.mission ?? ""} onChange={(e) => set("mission", e.target.value)} /><ProfileField helpField="vision" label="Vision" multiline minRows={3} value={profile.vision ?? ""} onChange={(e) => set("vision", e.target.value)} /></Stack>
            </Stack>}
            {tab === 1 && <Stack spacing={2.5}>
              <CsvField label="Values" field="values" value={profile.values} onChange={(value) => set("values", value)} /><CsvField label="Benefits" field="benefits" value={profile.benefits} onChange={(value) => set("benefits", value)} /><CsvField label="Technologies" field="technologies" value={profile.technologies} onChange={(value) => set("technologies", value)} />
              <HtmlEditor label="Work culture" field="workCultureHtml" value={profile.workCultureHtml ?? ""} onChange={(value) => set("workCultureHtml", value)} readOnly={!editing} minHeight={180} /><HtmlEditor label="Hiring process" field="hiringProcessHtml" value={profile.hiringProcessHtml ?? ""} onChange={(value) => set("hiringProcessHtml", value)} readOnly={!editing} minHeight={180} /><HtmlEditor label="Diversity statement" field="diversityStatementHtml" value={profile.diversityStatementHtml ?? ""} onChange={(value) => set("diversityStatementHtml", value)} readOnly={!editing} minHeight={150} />
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
    </>
  );
};
