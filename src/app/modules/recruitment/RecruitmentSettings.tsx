import { Box, Card, Chip, Divider, MenuItem, Stack, Typography } from "@mui/material";
import SettingsSuggestOutlined from "@mui/icons-material/SettingsSuggestOutlined";
import RestoreOutlined from "@mui/icons-material/RestoreOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { getRecruitmentEnterpriseConfig, upsertRecruitmentEnterpriseConfig } from "./services";
import { RecruitmentEnterpriseConfig, RecruitmentEnterpriseConfigCommand } from "./models";
import { usePageData } from "../../Context/PageDataProvider";
import { AppButton, AppSwitch, AppTextField } from "../../shared/components/ui";
import { INDIA_TIME_ZONE } from "../../../utils/common";
import RecruitmentInterviewPlanEditor from "./RecruitmentInterviewPlanEditor";
import RecruitmentFeedbackSlaCard from "./RecruitmentFeedbackSlaCard";
import RecruitmentOfferApprovalPolicyEditor from "./RecruitmentOfferApprovalPolicyEditor";

const defaults: RecruitmentEnterpriseConfig = { locations: [], recruitmentMode: "Simple", enableSla: true, enableAutomation: true, applicationReview: true, hiringManagerReview: false, interviewRounds: false, parallelPanels: false, scorecards: false, offerApproval: false, offerNegotiation: false, candidateEmailActions: true, requisitions: false, slaTracking: true, automation: true, internalMobility: false, rehireLinks: false, defaultTimezone: INDIA_TIME_ZONE, configSource: "SystemDefault", overriddenFields: [] };
const idempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-recruitment-settings`;
const modes: Record<RecruitmentEnterpriseConfig["recruitmentMode"], { title: string; subtitle: string; features: string[]; flow: string[] }> = {
  Simple: { title: "Simple", subtitle: "A fast flow for small teams", features: ["Jobs and applications", "Basic interviews", "Offers by email", "Preboarding handoff"], flow: ["Apply", "Review", "Interview", "Offer", "Hire"] },
  Standard: { title: "Standard", subtitle: "Structured hiring with useful controls", features: ["Everything in Simple", "Scorecards and talent pools", "Offer approvals", "Candidate email actions", "Duplicate detection"], flow: ["Apply", "Screen", "Interview + score", "Approve offer", "Preboard"] },
  Enterprise: { title: "Enterprise", subtitle: "Configurable hiring at scale", features: ["Everything in Standard", "Panels and self-scheduling", "SLA and stage aging", "Negotiation and versioned offers", "Multi-location job posts, analytics and automation"], flow: ["Requisition", "Screen", "Panel + scorecards", "Approve + negotiate", "Preboard + audit"] },
};

const capabilityGroups: Array<{ title: string; description: string; fields: Array<{ key: keyof RecruitmentEnterpriseConfig; label: string; help: string }> }> = [
  { title: "Workflow", description: "Control which review and decision steps are available for this company.", fields: [
    { key: "applicationReview", label: "Application review", help: "Require recruiter review before a candidate advances." },
    { key: "hiringManagerReview", label: "Hiring-manager review", help: "Add a hiring-manager gate after recruiter screening." },
    { key: "interviewRounds", label: "Multiple interview rounds", help: "Allow jobs to configure two or more interview rounds." },
    { key: "parallelPanels", label: "Panel interviews", help: "Allow multiple interviewers to be assigned to one round." },
    { key: "scorecards", label: "Structured scorecards", help: "Require interviewer feedback against configured criteria." },
  ] },
  { title: "Offers and communication", description: "Enable approval and candidate communication controls.", fields: [
    { key: "offerApproval", label: "Offer approval", help: "Require configured approval before an offer can be sent." },
    { key: "offerNegotiation", label: "Offer negotiation", help: "Track counter-offers and offer revisions." },
    { key: "candidateEmailActions", label: "Candidate email actions", help: "Allow secure candidate links for confirmations and responses." },
  ] },
  { title: "Enterprise operations", description: "Enable additional controls for larger or distributed teams.", fields: [
    { key: "requisitions", label: "Requisitions and approvals", help: "Require a requisition before a vacancy is published." },
    { key: "slaTracking", label: "Stage SLA tracking", help: "Track time spent in each recruitment stage." },
    { key: "automation", label: "Workflow automation", help: "Queue reminders and workflow notifications." },
    { key: "internalMobility", label: "Internal mobility", help: "Link applications to internal-transfer candidates." },
    { key: "rehireLinks", label: "Rehire links", help: "Link applications to former employees for rehire review." },
  ] },
];
export default function RecruitmentSettings() {
  const { setPageTitle } = usePageData();
  const [config, setConfig] = useState<RecruitmentEnterpriseConfig>(defaults);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const selectedMode = modes[config.recruitmentMode];

  const load = async () => { setLoading(true); try { const { data } = await getRecruitmentEnterpriseConfig(); if (!data.success) throw new Error(data.message || "Unable to load recruitment settings."); setConfig({ ...defaults, ...(data.methodResult ?? {}) }); } catch (error) { toast.error((error as Error).message || "Unable to load recruitment settings."); } finally { setLoading(false); } };
  useEffect(() => { void load(); setPageTitle("Recruitment Settings"); return () => setPageTitle(""); }, [setPageTitle]);

  const save = async (resetToDefaults = false) => { setSaving(true); try { const payload: RecruitmentEnterpriseConfigCommand = { locations: resetToDefaults ? [] : config.locations, recruitmentMode: resetToDefaults ? "Simple" : config.recruitmentMode, enableSla: resetToDefaults ? true : config.enableSla, enableAutomation: resetToDefaults ? true : config.enableAutomation, applicationReview: resetToDefaults ? true : config.applicationReview, hiringManagerReview: resetToDefaults ? false : config.hiringManagerReview, interviewRounds: resetToDefaults ? false : config.interviewRounds, parallelPanels: resetToDefaults ? false : config.parallelPanels, scorecards: resetToDefaults ? false : config.scorecards, offerApproval: resetToDefaults ? false : config.offerApproval, offerNegotiation: resetToDefaults ? false : config.offerNegotiation, candidateEmailActions: resetToDefaults ? true : config.candidateEmailActions, requisitions: resetToDefaults ? false : config.requisitions, slaTracking: resetToDefaults ? true : config.slaTracking, automation: resetToDefaults ? true : config.automation, internalMobility: resetToDefaults ? false : config.internalMobility, rehireLinks: resetToDefaults ? false : config.rehireLinks, defaultTimezone: INDIA_TIME_ZONE, resetToDefaults, idempotencyKey: idempotencyKey() }; const { data } = await upsertRecruitmentEnterpriseConfig(payload); if (!data.success) throw new Error(data.message || "Unable to save recruitment settings."); toast.success(resetToDefaults ? "Recruitment defaults restored." : "Recruitment settings saved."); await load(); } catch (error) { toast.error((error as Error).message || "Unable to save recruitment settings."); } finally { setSaving(false); } };
  const update = <K extends keyof RecruitmentEnterpriseConfig>(field: K, value: RecruitmentEnterpriseConfig[K]) => setConfig(current => ({ ...current, [field]: value }));

  return <Card sx={{ p: { xs: 2, sm: 3, lg: 4 }, mb: 2, overflow: "visible" }}>
    <Stack spacing={{ xs: 2.5, md: 3.5 }}>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={2}>
        <Stack direction="row" spacing={1.5} alignItems="center"><Box sx={{ width: 48, height: 48, flexShrink: 0, borderRadius: 2.5, display: "grid", placeItems: "center", bgcolor: "primary.main", color: "primary.contrastText", boxShadow: "0 10px 24px rgba(32, 128, 125, .22)", animation: "recruitmentFloat 3s ease-in-out infinite", "@keyframes recruitmentFloat": { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-3px)" } } }}><SettingsSuggestOutlined /></Box><Box><Typography variant="h5" fontWeight={850}>Recruitment Settings</Typography><Typography variant="body2" color="text.secondary">Choose the level of recruitment complexity this company needs.</Typography></Box></Stack>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ width: { xs: "100%", md: "auto" } }}><AppButton variant="outlined" startIcon={<RestoreOutlined />} disabled={saving || loading} onClick={() => void save(true)} sx={{ width: { xs: "100%", sm: "auto" } }}>Reset defaults</AppButton><AppButton variant="contained" startIcon={<SaveOutlined />} disabled={saving || loading} onClick={() => void save()} sx={{ width: { xs: "100%", sm: "auto" } }}>{saving ? "Saving…" : "Save settings"}</AppButton></Stack>
      </Stack>

      <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={1} flexWrap="wrap"><Chip label={config.configSource === "CompanyOverride" ? "Company override active" : "Using system defaults"} color={config.configSource === "CompanyOverride" ? "primary" : "default"} sx={{ fontWeight: 750 }} /><Typography variant="caption" color="text.secondary">Only this company is affected. Existing application history is preserved.</Typography></Stack>
      <Divider />

      <Box><Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={1}>Choose your recruitment operating model</Typography><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 1.5, mt: 1.25 }}>{(Object.keys(modes) as RecruitmentEnterpriseConfig["recruitmentMode"][]).map(mode => { const item = modes[mode]; const active = config.recruitmentMode === mode; return <Box key={mode} role="button" tabIndex={0} onClick={() => update("recruitmentMode", mode)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") update("recruitmentMode", mode); }} sx={{ p: 2, border: "1px solid", borderColor: active ? "primary.main" : "divider", borderRadius: 2.5, bgcolor: active ? "rgba(32,128,125,.07)" : "background.paper", cursor: "pointer", transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease", "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 26px rgba(0,0,0,.08)", borderColor: "primary.main" }, "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 } }}><Stack direction="row" justifyContent="space-between" gap={1}><Box><Typography fontWeight={800}>{item.title}</Typography><Typography variant="caption" color="text.secondary">{item.subtitle}</Typography></Box>{active && <CheckCircleOutlineRounded color="primary" fontSize="small" />}</Stack><Stack spacing={.55} sx={{ mt: 1.5 }}>{item.features.slice(0, 4).map(feature => <Stack direction="row" spacing={.65} alignItems="flex-start" key={feature}><CheckCircleOutlineRounded sx={{ fontSize: 15, mt: .15 }} color={active ? "primary" : "disabled"} /><Typography variant="caption" color="text.secondary">{feature}</Typography></Stack>)}</Stack></Box>; })}</Box></Box>

      <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, bgcolor: "action.hover", overflowX: "auto" }}><Typography variant="subtitle2" fontWeight={800}>Your enabled recruitment flow</Typography><Stack direction="row" alignItems="center" spacing={.75} sx={{ mt: 1.25, minWidth: "max-content" }}>{selectedMode.flow.map((step, index) => <Stack direction="row" spacing={.75} alignItems="center" key={step}><Chip label={step} size="small" color={index === selectedMode.flow.length - 1 ? "primary" : "default"} sx={{ fontWeight: 700 }} />{index < selectedMode.flow.length - 1 && <ArrowForwardRounded sx={{ fontSize: 16, color: "text.disabled" }} />}</Stack>)}</Stack></Box>

      <RecruitmentInterviewPlanEditor />

      <RecruitmentFeedbackSlaCard />\n\n      <RecruitmentOfferApprovalPolicyEditor />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
        <AppTextField select label="Recruitment mode" value={config.recruitmentMode} disabled={loading || saving} onChange={e => update("recruitmentMode", e.target.value as RecruitmentEnterpriseConfig["recruitmentMode"])} helperText="Use the cards above for a visual summary of each mode."><MenuItem value="Simple">Simple</MenuItem><MenuItem value="Standard">Standard</MenuItem><MenuItem value="Enterprise">Enterprise</MenuItem></AppTextField>
        <AppTextField label="Project timezone" value={INDIA_TIME_ZONE} disabled={loading || saving} InputProps={{ readOnly: true }} helperText="Used across interviews, candidate communication, and recruitment timestamps. Stored as UTC." sx={{ "& .MuiOutlinedInput-root": { borderRadius: 2, transition: "box-shadow 180ms ease, border-color 180ms ease", "&:hover": { boxShadow: "0 4px 14px rgba(32,128,125,.08)" }, "&.Mui-focused": { boxShadow: "0 0 0 3px rgba(32,128,125,.14)" } } }} />
        <Box sx={{ gridColumn: { md: "1 / -1" }, px: { xs: 1.5, sm: 2 }, py: 1.25, borderRadius: 2, bgcolor: "rgba(32,128,125,.045)", border: "1px dashed", borderColor: "rgba(32,128,125,.28)" }}><Typography variant="caption" color="text.secondary"><strong>Hiring locations</strong> are managed on each job post, where the location is part of the vacancy and candidate experience. This keeps one source of truth and allows different jobs to use different offices.</Typography></Box>
        <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2, minHeight: 76, height: "100%", transition: "border-color 160ms ease, box-shadow 160ms ease", "&:hover": { borderColor: "primary.light", boxShadow: "0 6px 18px rgba(32,128,125,.08)" } }}><AppSwitch checked={config.enableSla} disabled={loading || saving} onChange={e => update("enableSla", e.target.checked)} /><Stack spacing={.25} sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={750}>SLA and stage aging</Typography><Typography variant="caption" color="text.secondary">Alert recruiters when applications remain too long in a stage.</Typography></Stack></Stack>
        <Stack direction="row" alignItems="flex-start" spacing={1} sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2, minHeight: 76, height: "100%", transition: "border-color 160ms ease, box-shadow 160ms ease", "&:hover": { borderColor: "primary.light", boxShadow: "0 6px 18px rgba(32,128,125,.08)" } }}><AppSwitch checked={config.enableAutomation} disabled={loading || saving} onChange={e => update("enableAutomation", e.target.checked)} /><Stack spacing={.25} sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={750}>Recruitment automation</Typography><Typography variant="caption" color="text.secondary">Queue candidate, interviewer, and approval notifications.</Typography></Stack></Stack>
      </Box>
      <Stack spacing={1.5}>
        <Box><Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={1}>Capability controls</Typography><Typography variant="body2" color="text.secondary">These controls change the available workflow for this company only. Permissions, tenant isolation, audit history, and server-side transition checks remain active.</Typography></Box>
        {capabilityGroups.map(group => (
          <Box key={group.title} sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
            <Typography variant="subtitle2" fontWeight={800}>{group.title}</Typography>
            <Typography variant="caption" color="text.secondary">{group.description}</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1, mt: 1.25 }}>
              {group.fields.map(field => (
                <Stack key={String(field.key)} direction="row" alignItems="flex-start" spacing={1} sx={{ p: 1.25, borderRadius: 2, bgcolor: "action.hover" }}>
                  <AppSwitch checked={Boolean(config[field.key])} disabled={loading || saving} onChange={event => update(field.key, event.target.checked as RecruitmentEnterpriseConfig[typeof field.key])} inputProps={{ "aria-label": field.label }} />
                  <Stack spacing={.2} sx={{ minWidth: 0 }}><Typography variant="body2" fontWeight={700}>{field.label}</Typography><Typography variant="caption" color="text.secondary">{field.help}</Typography></Stack>
                </Stack>
              ))}
            </Box>
          </Box>
        ))}
    </Stack>
      <Box sx={{ p: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}><Typography variant="subtitle2" fontWeight={800}>What {config.recruitmentMode} mode makes available</Typography><Stack direction="row" flexWrap="wrap" gap={.75} sx={{ mt: 1 }}>{selectedMode.features.map(feature => <Chip key={feature} size="small" label={feature} variant="outlined" />)}</Stack><Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.25 }}>Mode controls the optional UI and workflow layers. Tenant isolation, permissions, audit history, concurrency checks, and email security always remain active.</Typography></Box>
    </Stack>
  </Card>;
}








