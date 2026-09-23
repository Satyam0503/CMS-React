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

const defaults: RecruitmentEnterpriseConfig = {
  locations: [],
  recruitmentMode: "Simple",
  enableSla: true,
  enableAutomation: true,
  applicationReview: true,
  hiringManagerReview: false,
  interviewRounds: false,
  parallelPanels: false,
  scorecards: false,
  offerApproval: false,
  offerNegotiation: false,
  candidateEmailActions: true,
  requisitions: false,
  slaTracking: true,
  automation: true,
  internalMobility: false,
  rehireLinks: false,
  autoAdvanceOnScreening: true,
  requireInterviewBeforeDecision: false,
  requirePreboardingBeforeHandoff: false,
  allowMultiVacancyApplications: true,
  screeningCriteria: ["Relevant experience", "Required skills", "Communication"],
  screeningPassScore: 60,
  preboardingChecklist: ["candidate-details", "documents", "verification"],
  defaultTimezone: INDIA_TIME_ZONE,
  configSource: "SystemDefault",
  overriddenFields: [],
  compensationSchemeName: "Standard",
  compensationCurrency: "INR",
  compensationComponents: {},
};

const idempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-recruitment-settings`;

const modes: Record<
  RecruitmentEnterpriseConfig["recruitmentMode"],
  { title: string; subtitle: string; features: string[]; flow: string[]; preset: Partial<RecruitmentEnterpriseConfig> }
> = {
  Simple: {
    title: "Simple (Startup & Agile)",
    subtitle: "Fast-track hiring with minimal approval bottlenecks",
    features: ["Direct offer creation without multi-tier sign-off", "Fast-track hiring decision without mandatory panel quorum", "One-click preboarding & employee conversion", "Auto-advance candidates on screening pass"],
    flow: ["Apply", "Review", "Interview (Optional)", "Fast Offer", "Hire"],
    preset: {
      applicationReview: true,
      hiringManagerReview: false,
      interviewRounds: false,
      parallelPanels: false,
      scorecards: false,
      offerApproval: false,
      offerNegotiation: false,
      candidateEmailActions: true,
      requisitions: false,
      autoAdvanceOnScreening: true,
      requireInterviewBeforeDecision: false,
      requirePreboardingBeforeHandoff: false,
      allowMultiVacancyApplications: true,
    },
  },
  Standard: {
    title: "Standard (Mid-Market & Scaling)",
    subtitle: "Structured hiring with scorecards and offer controls",
    features: ["Structured screening criteria & pass thresholds", "Multi-round interviews & scorecards", "Offer approval gate before sending", "Preboarding verification checklist"],
    flow: ["Apply", "Screen", "Interview + Scorecards", "Approve Offer", "Preboard + Hire"],
    preset: {
      applicationReview: true,
      hiringManagerReview: true,
      interviewRounds: true,
      parallelPanels: false,
      scorecards: true,
      offerApproval: true,
      offerNegotiation: false,
      candidateEmailActions: true,
      requisitions: false,
      autoAdvanceOnScreening: true,
      requireInterviewBeforeDecision: true,
      requirePreboardingBeforeHandoff: true,
      allowMultiVacancyApplications: true,
    },
  },
  Enterprise: {
    title: "Enterprise (Global Governance)",
    subtitle: "Full compliance, requisitions, panel debriefs & SLA audit",
    features: ["Mandatory interview panels, scorecards & debrief quorum", "Multi-level offer approvals & versioned negotiations", "Mandatory preboarding document verification gate", "Requisitions, SLA aging alerts & internal mobility"],
    flow: ["Requisition", "Screen", "Panel + Debrief", "Approve + Negotiate", "Preboard + Audit"],
    preset: {
      applicationReview: true,
      hiringManagerReview: true,
      interviewRounds: true,
      parallelPanels: true,
      scorecards: true,
      offerApproval: true,
      offerNegotiation: true,
      candidateEmailActions: true,
      requisitions: true,
      internalMobility: true,
      rehireLinks: true,
      autoAdvanceOnScreening: true,
      requireInterviewBeforeDecision: true,
      requirePreboardingBeforeHandoff: true,
      allowMultiVacancyApplications: true,
    },
  },
};

const capabilityGroups: Array<{
  title: string;
  description: string;
  fields: Array<{ key: keyof RecruitmentEnterpriseConfig; label: string; help: string }>;
}> = [
  {
    title: "Stage & Gate Governance (Startup vs. Enterprise)",
    description: "Customize whether stage transitions and approvals act as strict gates or fast-track workflows for your company.",
    fields: [
      { key: "autoAdvanceOnScreening", label: "Auto-advance stage on screening", help: "Automatically move candidates to Shortlisted on Pass (or Rejected on Reject)." },
      { key: "requireInterviewBeforeDecision", label: "Require completed interview & debrief before approval", help: "Disable for startups that want to approve candidates without mandatory interview rounds." },
      { key: "requirePreboardingBeforeHandoff", label: "Require preboarding checklist before employee creation", help: "When enabled, all preboarding tasks must be completed before converting to an employee." },
      { key: "allowMultiVacancyApplications", label: "Allow multi-vacancy applications", help: "Allow the same candidate email to apply to multiple different open job vacancies." },
    ],
  },
  {
    title: "Workflow & Evaluation",
    description: "Control which review and decision steps are available for this company.",
    fields: [
      { key: "applicationReview", label: "Application review", help: "Require recruiter review before a candidate advances." },
      { key: "hiringManagerReview", label: "Hiring-manager review", help: "Add a hiring-manager gate after recruiter screening." },
      { key: "interviewRounds", label: "Multiple interview rounds", help: "Allow jobs to configure two or more interview rounds." },
      { key: "parallelPanels", label: "Panel interviews", help: "Allow multiple interviewers to be assigned to one round." },
      { key: "scorecards", label: "Structured scorecards", help: "Require interviewer feedback against configured criteria." },
    ],
  },
  {
    title: "Offers and communication",
    description: "Enable approval and candidate communication controls.",
    fields: [
      { key: "offerApproval", label: "Offer approval", help: "Require configured approval before an offer can be sent." },
      { key: "offerNegotiation", label: "Offer negotiation", help: "Track counter-offers and offer revisions." },
      { key: "candidateEmailActions", label: "Candidate email actions", help: "Automatically issue secure candidate magic links when an offer is sent." },
    ],
  },
  {
    title: "Enterprise operations",
    description: "Enable additional controls for larger or distributed teams.",
    fields: [
      { key: "requisitions", label: "Requisitions and approvals", help: "Require a requisition before a vacancy is published." },
      { key: "slaTracking", label: "Stage SLA tracking", help: "Track time spent in each recruitment stage." },
      { key: "automation", label: "Workflow automation", help: "Queue reminders and workflow notifications." },
      { key: "internalMobility", label: "Internal mobility", help: "Link applications to internal-transfer candidates." },
      { key: "rehireLinks", label: "Rehire links", help: "Link applications to former employees for rehire review." },
    ],
  },
];

export default function RecruitmentSettings() {
  const { setPageTitle } = usePageData();
  const [config, setConfig] = useState<RecruitmentEnterpriseConfig>(defaults);
  const [criteriaText, setCriteriaText] = useState("Relevant experience, Required skills, Communication");
  const [checklistText, setChecklistText] = useState("candidate-details, documents, verification");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const selectedMode = modes[config.recruitmentMode];

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getRecruitmentEnterpriseConfig();
      if (!data.success) throw new Error(data.message || "Unable to load recruitment settings.");
      const merged = { ...defaults, ...(data.methodResult ?? {}) };
      setConfig(merged);
      setCriteriaText((merged.screeningCriteria ?? defaults.screeningCriteria ?? []).join(", "));
      setChecklistText((merged.preboardingChecklist ?? defaults.preboardingChecklist ?? []).join(", "));
    } catch (error) {
      toast.error((error as Error).message || "Unable to load recruitment settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    setPageTitle("Recruitment Settings");
    return () => setPageTitle("");
  }, [setPageTitle]);

  const selectModePreset = (mode: RecruitmentEnterpriseConfig["recruitmentMode"]) => {
    const preset = modes[mode]?.preset ?? {};
    setConfig((current) => ({
      ...current,
      recruitmentMode: mode,
      ...preset,
    }));
  };

  const save = async (resetToDefaults = false) => {
    setSaving(true);
    try {
      const parsedCriteria = criteriaText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const parsedChecklist = checklistText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const payload: RecruitmentEnterpriseConfigCommand = {
        locations: resetToDefaults ? [] : config.locations,
        recruitmentMode: resetToDefaults ? "Simple" : config.recruitmentMode,
        enableSla: resetToDefaults ? true : config.enableSla,
        enableAutomation: resetToDefaults ? true : config.enableAutomation,
        applicationReview: resetToDefaults ? true : config.applicationReview,
        hiringManagerReview: resetToDefaults ? false : config.hiringManagerReview,
        interviewRounds: resetToDefaults ? false : config.interviewRounds,
        parallelPanels: resetToDefaults ? false : config.parallelPanels,
        scorecards: resetToDefaults ? false : config.scorecards,
        offerApproval: resetToDefaults ? false : config.offerApproval,
        offerNegotiation: resetToDefaults ? false : config.offerNegotiation,
        candidateEmailActions: resetToDefaults ? true : config.candidateEmailActions,
        requisitions: resetToDefaults ? false : config.requisitions,
        slaTracking: resetToDefaults ? true : config.slaTracking,
        automation: resetToDefaults ? true : config.automation,
        internalMobility: resetToDefaults ? false : config.internalMobility,
        rehireLinks: resetToDefaults ? false : config.rehireLinks,
        autoAdvanceOnScreening: resetToDefaults ? true : config.autoAdvanceOnScreening,
        requireInterviewBeforeDecision: resetToDefaults ? false : config.requireInterviewBeforeDecision,
        requirePreboardingBeforeHandoff: resetToDefaults ? false : config.requirePreboardingBeforeHandoff,
        allowMultiVacancyApplications: resetToDefaults ? true : config.allowMultiVacancyApplications,
        screeningCriteria: resetToDefaults ? defaults.screeningCriteria : parsedCriteria,
        screeningPassScore: resetToDefaults ? 60 : Number(config.screeningPassScore ?? 60),
        preboardingChecklist: resetToDefaults ? defaults.preboardingChecklist : parsedChecklist,
        compensationSchemeName: resetToDefaults ? "Standard" : config.compensationSchemeName,
        compensationCurrency: resetToDefaults ? "INR" : config.compensationCurrency,
        defaultTimezone: INDIA_TIME_ZONE,
        resetToDefaults,
        idempotencyKey: idempotencyKey(),
      };
      const { data } = await upsertRecruitmentEnterpriseConfig(payload);
      if (!data.success) throw new Error(data.message || "Unable to save recruitment settings.");
      toast.success(resetToDefaults ? "Recruitment defaults restored." : "Recruitment settings saved.");
      await load();
    } catch (error) {
      toast.error((error as Error).message || "Unable to save recruitment settings.");
    } finally {
      setSaving(false);
    }
  };

  const update = <K extends keyof RecruitmentEnterpriseConfig>(field: K, value: RecruitmentEnterpriseConfig[K]) =>
    setConfig((current) => ({ ...current, [field]: value }));

  return (
    <Card sx={{ p: { xs: 2, sm: 3, lg: 4 }, mb: 2, overflow: "visible" }}>
      <Stack spacing={{ xs: 2.5, md: 3.5 }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} gap={2}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "primary.main",
                color: "primary.contrastText",
                boxShadow: "0 10px 24px rgba(32, 128, 125, .22)",
              }}
            >
              <SettingsSuggestOutlined />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={850}>
                Recruitment Settings
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Configure recruitment governance for your company—from agile Startup fast-track to Enterprise multi-gate compliance.
              </Typography>
            </Box>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.25} sx={{ width: { xs: "100%", md: "auto" } }}>
            <AppButton
              variant="outlined"
              startIcon={<RestoreOutlined />}
              disabled={saving || loading}
              onClick={() => void save(true)}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              Reset defaults
            </AppButton>
            <AppButton
              variant="contained"
              startIcon={<SaveOutlined />}
              disabled={saving || loading}
              onClick={() => void save()}
              sx={{ width: { xs: "100%", sm: "auto" } }}
            >
              {saving ? "Saving…" : "Save settings"}
            </AppButton>
          </Stack>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ sm: "center" }} spacing={1} flexWrap="wrap">
          <Chip
            label={config.configSource === "CompanyOverride" ? "Company override active" : "Using system defaults"}
            color={config.configSource === "CompanyOverride" ? "primary" : "default"}
            sx={{ fontWeight: 750 }}
          />
          <Typography variant="caption" color="text.secondary">
            Strictly tenant-isolated: only this company is affected, and existing application audit history is preserved.
          </Typography>
        </Stack>
        <Divider />

        <Box>
          <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={1}>
            Choose your recruitment operating model (applies recommended presets, customizable below)
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" }, gap: 1.5, mt: 1.25 }}>
            {(Object.keys(modes) as RecruitmentEnterpriseConfig["recruitmentMode"][]).map((mode) => {
              const item = modes[mode];
              const active = config.recruitmentMode === mode;
              return (
                <Box
                  key={mode}
                  role="button"
                  tabIndex={0}
                  onClick={() => selectModePreset(mode)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") selectModePreset(mode);
                  }}
                  sx={{
                    p: 2,
                    border: "1px solid",
                    borderColor: active ? "primary.main" : "divider",
                    borderRadius: 2.5,
                    bgcolor: active ? "rgba(32,128,125,.07)" : "background.paper",
                    cursor: "pointer",
                    transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                    "&:hover": { transform: "translateY(-3px)", boxShadow: "0 12px 26px rgba(0,0,0,.08)", borderColor: "primary.main" },
                    "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Box>
                      <Typography fontWeight={800}>{item.title}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.subtitle}
                      </Typography>
                    </Box>
                    {active && <CheckCircleOutlineRounded color="primary" fontSize="small" />}
                  </Stack>
                  <Stack spacing={0.55} sx={{ mt: 1.5 }}>
                    {item.features.slice(0, 4).map((feature) => (
                      <Stack direction="row" spacing={0.65} alignItems="flex-start" key={feature}>
                        <CheckCircleOutlineRounded sx={{ fontSize: 15, mt: 0.15 }} color={active ? "primary" : "disabled"} />
                        <Typography variant="caption" color="text.secondary">
                          {feature}
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              );
            })}
          </Box>
        </Box>

        <Box sx={{ p: { xs: 1.5, sm: 2 }, borderRadius: 2.5, bgcolor: "action.hover", overflowX: "auto" }}>
          <Typography variant="subtitle2" fontWeight={800}>
            Your enabled recruitment flow
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1.25, minWidth: "max-content" }}>
            {selectedMode.flow.map((step, index) => (
              <Stack direction="row" spacing={0.75} alignItems="center" key={step}>
                <Chip label={step} size="small" color={index === selectedMode.flow.length - 1 ? "primary" : "default"} sx={{ fontWeight: 700 }} />
                {index < selectedMode.flow.length - 1 && <ArrowForwardRounded sx={{ fontSize: 16, color: "text.disabled" }} />}
              </Stack>
            ))}
          </Stack>
        </Box>

        <RecruitmentInterviewPlanEditor />
        <RecruitmentFeedbackSlaCard />
        <RecruitmentOfferApprovalPolicyEditor />

        <Box sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
          <Typography variant="subtitle2" fontWeight={800}>
            Screening & Preboarding Policy Configuration
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Define your company’s screening pass threshold, evaluation criteria, default currency, and mandatory preboarding checklist items.
          </Typography>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2, mt: 1.5 }}>
            <AppTextField
              label="Minimum screening pass score (0–100)"
              type="number"
              value={config.screeningPassScore ?? 60}
              disabled={loading || saving}
              onChange={(e) => update("screeningPassScore", Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              inputProps={{ min: 0, max: 100 }}
              helperText="Set to 0 if recruiters can pass candidates without a minimum numerical score."
            />
            <AppTextField
              label="Default compensation currency"
              value={config.compensationCurrency ?? "INR"}
              disabled={loading || saving}
              onChange={(e) => update("compensationCurrency", e.target.value.toUpperCase().slice(0, 3))}
              helperText="3-letter ISO currency code (e.g., INR, USD, EUR, GBP)."
            />
            <AppTextField
              label="Screening criteria (comma-separated)"
              value={criteriaText}
              disabled={loading || saving}
              onChange={(e) => setCriteriaText(e.target.value)}
              helperText="Used across individual and bulk screening reviews."
            />
            <AppTextField
              label="Preboarding checklist tasks (comma-separated)"
              value={checklistText}
              disabled={loading || saving}
              onChange={(e) => setChecklistText(e.target.value)}
              helperText="Default tasks created when an offer is accepted."
            />
          </Box>
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 2 }}>
          <AppTextField
            select
            label="Recruitment mode"
            value={config.recruitmentMode}
            disabled={loading || saving}
            onChange={(e) => selectModePreset(e.target.value as RecruitmentEnterpriseConfig["recruitmentMode"])}
            helperText="Selecting a mode loads its recommended preset switches."
          >
            <MenuItem value="Simple">Simple (Startup)</MenuItem>
            <MenuItem value="Standard">Standard (Growth)</MenuItem>
            <MenuItem value="Enterprise">Enterprise (Governance)</MenuItem>
          </AppTextField>
          <AppTextField
            label="Project timezone"
            value={INDIA_TIME_ZONE}
            disabled={loading || saving}
            InputProps={{ readOnly: true }}
            helperText="Used across interviews, candidate communication, and recruitment timestamps. Stored as UTC."
          />
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={1}
            sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2, minHeight: 76, height: "100%" }}
          >
            <AppSwitch checked={config.enableSla} disabled={loading || saving} onChange={(e) => update("enableSla", e.target.checked)} />
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={750}>
                SLA and stage aging
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Alert recruiters when applications remain too long in a stage.
              </Typography>
            </Stack>
          </Stack>
          <Stack
            direction="row"
            alignItems="flex-start"
            spacing={1}
            sx={{ p: 1.5, border: "1px solid", borderColor: "divider", borderRadius: 2, minHeight: 76, height: "100%" }}
          >
            <AppSwitch checked={config.enableAutomation} disabled={loading || saving} onChange={(e) => update("enableAutomation", e.target.checked)} />
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={750}>
                Recruitment automation
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Queue candidate, interviewer, and approval notifications.
              </Typography>
            </Stack>
          </Stack>
        </Box>

        <Stack spacing={1.5}>
          <Box>
            <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={1}>
              Capability controls
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Fine-tune individual gates and capabilities for this company. Permissions, tenant isolation, audit history, and server-side transition checks remain active.
            </Typography>
          </Box>
          {capabilityGroups.map((group) => (
            <Box key={group.title} sx={{ p: { xs: 1.5, sm: 2 }, border: "1px solid", borderColor: "divider", borderRadius: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={800}>
                {group.title}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {group.description}
              </Typography>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" }, gap: 1, mt: 1.25 }}>
                {group.fields.map((field) => (
                  <Stack key={String(field.key)} direction="row" alignItems="flex-start" spacing={1} sx={{ p: 1.25, borderRadius: 2, bgcolor: "action.hover" }}>
                    <AppSwitch
                      checked={Boolean(config[field.key])}
                      disabled={loading || saving}
                      onChange={(event) => update(field.key, event.target.checked as RecruitmentEnterpriseConfig[typeof field.key])}
                      inputProps={{ "aria-label": field.label }}
                    />
                    <Stack spacing={0.2} sx={{ minWidth: 0 }}>
                      <Typography variant="body2" fontWeight={700}>
                        {field.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {field.help}
                      </Typography>
                    </Stack>
                  </Stack>
                ))}
              </Box>
            </Box>
          ))}
        </Stack>

        <Box sx={{ p: 2, borderRadius: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Typography variant="subtitle2" fontWeight={800}>
            What {config.recruitmentMode} mode makes available
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
            {selectedMode.features.map((feature) => (
              <Chip key={feature} size="small" label={feature} variant="outlined" />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1.25 }}>
            Mode controls the optional UI and workflow layers. Tenant isolation, permissions, audit history, concurrency checks, and email security always remain active.
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}
