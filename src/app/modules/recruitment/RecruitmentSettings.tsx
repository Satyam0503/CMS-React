import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import SettingsSuggestOutlined from "@mui/icons-material/SettingsSuggestOutlined";
import RestoreOutlined from "@mui/icons-material/RestoreOutlined";
import SaveOutlined from "@mui/icons-material/SaveOutlined";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import MarkEmailReadOutlined from "@mui/icons-material/MarkEmailReadOutlined";
import TuneRounded from "@mui/icons-material/TuneRounded";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import PublicOutlined from "@mui/icons-material/PublicOutlined";
import AccessTimeOutlined from "@mui/icons-material/AccessTimeOutlined";
import RuleOutlined from "@mui/icons-material/RuleOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import DisplaySettingsOutlined from "@mui/icons-material/DisplaySettingsOutlined";
import SpeedRounded from "@mui/icons-material/SpeedRounded";
import AutoAwesomeOutlined from "@mui/icons-material/AutoAwesomeOutlined";
import FiberManualRecordRounded from "@mui/icons-material/FiberManualRecordRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getRecruitmentEnterpriseConfig, upsertRecruitmentEnterpriseConfig } from "./services";
import { RecruitmentEnterpriseConfig, RecruitmentEnterpriseConfigCommand } from "./models";
import { usePageData } from "../../Context/PageDataProvider";
import { AppButton, AppSwitch, AppTextField } from "../../shared/components/ui";
import { sanitizeHtmlContent } from "../../../utils/common";
import { useIsDark } from "../theme/useIsDark";

import RecruitmentInterviewPlanEditor from "./RecruitmentInterviewPlanEditor";
import RecruitmentFeedbackSlaCard from "./RecruitmentFeedbackSlaCard";
import RecruitmentOfferApprovalPolicyEditor from "./RecruitmentOfferApprovalPolicyEditor";
import TextEditor from "../../shared/components/TextEditor";

// Keyframe Animations for Smooth Delightful UI
const fadeInSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(12px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulseGlow = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(32, 128, 125, 0.45);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(32, 128, 125, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(32, 128, 125, 0);
  }
`;

const pulseLiveDot = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.3);
    opacity: 0.6;
  }
`;

const defaults: RecruitmentEnterpriseConfig = {
  locations: [],
  recruitmentMode: "Simple",
  enableSla: false,
  enableAutomation: false,
  applicationReview: true,
  hiringManagerReview: false,
  interviewRounds: false,
  parallelPanels: false,
  scorecards: false,
  offerApproval: false,
  offerNegotiation: false,
  candidateEmailActions: true,
  requisitions: false,
  slaTracking: false,
  automation: false,
  internalMobility: false,
  rehireLinks: false,
  autoAdvanceOnScreening: true,
  requireInterviewBeforeDecision: false,
  requirePreboardingBeforeHandoff: false,
  allowMultiVacancyApplications: true,
  allowJobWorkflowCustomization: false,
  screeningCriteria: ["Relevant experience", "Required skills", "Communication"],
  screeningPassScore: 60,
  preboardingChecklist: ["candidate-details", "documents", "verification"],
  defaultTimezone: "UTC",
  configSource: "SystemDefault",
  overriddenFields: [],
  compensationSchemeName: "Standard",
  compensationCurrency: "INR",
  compensationComponents: {},
  defaultCandidateRetentionDays: 730,
  offerLetterSubjectTemplate: "Formal Offer of Employment: [JobTitle] - [CandidateName]",
  offerLetterBodyTemplate:
    "<p>Dear [CandidateName],</p><p>We are pleased to extend this formal offer of employment for the position of <strong>[JobTitle]</strong>.</p><p><strong>Compensation (Total CTC):</strong> [Currency] [TotalCtc]</p><p>Please review the terms of this offer. To confirm your acceptance, kindly reply directly to this email with your written confirmation and signed offer letter.</p><p>Sincerely,<br/><strong>Human Resources & Talent Acquisition</strong></p>",
};

const idempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-recruitment-settings`;

const modes: Record<
  RecruitmentEnterpriseConfig["recruitmentMode"],
  {
    title: string;
    subtitle: string;
    badge: string;
    accentColor: string;
    icon: typeof SpeedRounded;
    features: string[];
    flow: string[];
    preset: Partial<RecruitmentEnterpriseConfig>;
  }
> = {
  Simple: {
    title: "Simple (Startup & Agile)",
    subtitle: "Fast-track hiring with minimal approval bottlenecks",
    badge: "Agile / Startup",
    accentColor: "#10B981",
    icon: SpeedRounded,
    features: [
      "Direct offer creation without multi-tier sign-off",
      "Fast-track hiring decision without mandatory panel quorum",
      "One-click preboarding & employee conversion",
      "Auto-advance candidates on screening pass",
    ],
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
      allowJobWorkflowCustomization: false,
    },
  },
  Standard: {
    title: "Standard (Mid-Market & Scaling)",
    subtitle: "Structured hiring with scorecards and offer controls",
    badge: "Scaling / Growth",
    accentColor: "#3B82F6",
    icon: TuneRounded,
    features: [
      "Structured screening criteria & pass thresholds",
      "Multi-round interviews & scorecards",
      "Offer approval gate before sending",
      "Preboarding verification checklist",
    ],
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
      allowJobWorkflowCustomization: false,
    },
  },
  Enterprise: {
    title: "Enterprise (Global Governance)",
    subtitle: "Full compliance, requisitions, panel debriefs & SLA audit",
    badge: "Full Governance",
    accentColor: "#8B5CF6",
    icon: ShieldOutlined,
    features: [
      "Mandatory interview panels, scorecards & debrief quorum",
      "Multi-level offer approvals & versioned negotiations",
      "Mandatory preboarding document verification gate",
      "Requisitions, SLA aging alerts & internal mobility",
    ],
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
      allowJobWorkflowCustomization: true,
    },
  },
};

const capabilityGroups: Array<{
  title: string;
  description: string;
  fields: Array<{ key: keyof RecruitmentEnterpriseConfig; label: string; help: string }>;
}> = [
  {
    title: "Stage & Gate Governance",
    description: "Customize whether stage transitions and approvals act as strict gates or fast-track workflows.",
    fields: [
      { key: "autoAdvanceOnScreening", label: "Auto-advance on screening", help: "Move candidates to Shortlisted on Pass (or Rejected on Reject)." },
      { key: "requireInterviewBeforeDecision", label: "Require interview & debrief before decision", help: "Enforces completed rounds before candidate sign-off." },
      { key: "requirePreboardingBeforeHandoff", label: "Require preboarding checklist before employee creation", help: "All tasks must be verified prior to HR handoff." },
      { key: "allowMultiVacancyApplications", label: "Allow multi-vacancy applications", help: "Allows candidates to apply to multiple open roles concurrently." },
    ],
  },
  {
    title: "Workflow & Evaluation",
    description: "Control which review and decision steps are available for this company.",
    fields: [
      { key: "applicationReview", label: "Application review", help: "Require recruiter review before candidate advances." },
      { key: "hiringManagerReview", label: "Hiring-manager review", help: "Adds a hiring manager screening gate after recruiter review." },
      { key: "interviewRounds", label: "Multiple interview rounds", help: "Enables configuring two or more sequential interview rounds." },
      { key: "parallelPanels", label: "Panel interviews", help: "Allows assigning multiple concurrent interviewers to one round." },
      { key: "scorecards", label: "Structured scorecards", help: "Requires interviewer feedback against configured evaluation rubrics." },
    ],
  },
  {
    title: "Offers and Communication",
    description: "Enable approval, negotiation, and candidate communication controls.",
    fields: [
      { key: "offerApproval", label: "Offer approval sign-off", help: "Requires configured approval before an offer can be dispatched." },
      { key: "offerNegotiation", label: "Offer negotiation tracking", help: "Tracks candidate counter-offers and versioned offer iterations." },
      { key: "candidateEmailActions", label: "Automated offer email dispatch", help: "Dispatches the official offer letter and compensation terms directly to the candidate's email upon offer release." },
    ],
  },
  {
    title: "Enterprise Operations",
    description: "Enable additional controls for multi-entity or distributed teams.",
    fields: [
      { key: "requisitions", label: "Requisitions and head-count approvals", help: "Requires an approved requisition before publishing job openings." },
      { key: "slaTracking", label: "Stage SLA tracking", help: "Monitors time spent in each pipeline stage with aging indicators." },
      { key: "automation", label: "Workflow automation", help: "Dispatches automated reminders, interviewer alerts, and updates." },
      { key: "internalMobility", label: "Internal mobility", help: "Links internal employee applicants to active recruitment requisitions." },
      { key: "rehireLinks", label: "Rehire candidate links", help: "Detects former employees and links past performance records." },
    ],
  },
];

export default function RecruitmentSettings() {
  const theme = useTheme();
  const isDark = useIsDark();
  const { setPageTitle } = usePageData();
  const [activeTab, setActiveTab] = useState(0);
  const [config, setConfig] = useState<RecruitmentEnterpriseConfig>(defaults);
  const [locationsText, setLocationsText] = useState("");
  const [criteriaText, setCriteriaText] = useState("Relevant experience, Required skills, Communication");
  const [checklistText, setChecklistText] = useState("candidate-details, documents, verification");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const selectedMode = modes[config.recruitmentMode] || modes.Simple;

  const parsedCriteriaList = useMemo(
    () => criteriaText.split(",").map((s) => s.trim()).filter(Boolean),
    [criteriaText]
  );

  const parsedChecklistList = useMemo(
    () => checklistText.split(",").map((s) => s.trim()).filter(Boolean),
    [checklistText]
  );

  const offerLetterPreview = useMemo(() => {
    const values: Record<string, string> = {
      CandidateName: "Avery Taylor",
      JobTitle: "Senior Product Designer",
      Currency: config.compensationCurrency || "INR",
      TotalCtc: "1,200,000.00",
    };
    const render = (template: string) =>
      template.replace(/\[([A-Za-z][A-Za-z0-9_]*)\]/g, (match, key) => values[key] ?? match);
    return {
      subject: render(config.offerLetterSubjectTemplate || "Formal Offer of Employment: [JobTitle] - [CandidateName]"),
      body: sanitizeHtmlContent(render(config.offerLetterBodyTemplate || "")),
    };
  }, [config.compensationCurrency, config.offerLetterBodyTemplate, config.offerLetterSubjectTemplate]);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getRecruitmentEnterpriseConfig();
      if (!data.success) throw new Error(data.message || "Unable to load recruitment settings.");
      const merged = { ...defaults, ...(data.methodResult ?? {}) };
      setConfig(merged);
      setLocationsText((merged.locations ?? []).join(", "));
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
      const parsedLocations = locationsText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
        .filter(
          (item, index, all) =>
            all.findIndex((candidate) => candidate.toLocaleLowerCase() === item.toLocaleLowerCase()) === index
        );
      const parsedCriteria = criteriaText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
      const parsedChecklist = checklistText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

      const retentionDays = Number(config.defaultCandidateRetentionDays ?? 730);
      if (!Number.isInteger(retentionDays) || retentionDays < 30 || retentionDays > 3650) {
        throw new Error("Candidate retention must be a whole number between 30 and 3650 days.");
      }

      const payload: RecruitmentEnterpriseConfigCommand = {
        locations: resetToDefaults ? [] : parsedLocations,
        recruitmentMode: resetToDefaults ? "Simple" : config.recruitmentMode,
        enableSla: resetToDefaults ? false : config.enableSla,
        enableAutomation: resetToDefaults ? false : config.enableAutomation,
        applicationReview: resetToDefaults ? true : config.applicationReview,
        hiringManagerReview: resetToDefaults ? false : config.hiringManagerReview,
        interviewRounds: resetToDefaults ? false : config.interviewRounds,
        parallelPanels: resetToDefaults ? false : config.parallelPanels,
        scorecards: resetToDefaults ? false : config.scorecards,
        offerApproval: resetToDefaults ? false : config.offerApproval,
        offerNegotiation: resetToDefaults ? false : config.offerNegotiation,
        candidateEmailActions: resetToDefaults ? true : config.candidateEmailActions,
        requisitions: resetToDefaults ? false : config.requisitions,
        slaTracking: resetToDefaults ? false : config.slaTracking,
        automation: resetToDefaults ? false : config.automation,
        internalMobility: resetToDefaults ? false : config.internalMobility,
        rehireLinks: resetToDefaults ? false : config.rehireLinks,
        autoAdvanceOnScreening: resetToDefaults ? true : config.autoAdvanceOnScreening,
        requireInterviewBeforeDecision: resetToDefaults ? false : config.requireInterviewBeforeDecision,
        requirePreboardingBeforeHandoff: resetToDefaults ? false : config.requirePreboardingBeforeHandoff,
        allowMultiVacancyApplications: resetToDefaults ? true : config.allowMultiVacancyApplications,
        allowJobWorkflowCustomization: resetToDefaults ? false : Boolean(config.allowJobWorkflowCustomization),
        screeningCriteria: resetToDefaults ? defaults.screeningCriteria : parsedCriteria,
        screeningPassScore: resetToDefaults ? 60 : Number(config.screeningPassScore ?? 60),
        preboardingChecklist: resetToDefaults ? defaults.preboardingChecklist : parsedChecklist,
        compensationSchemeName: resetToDefaults ? "Standard" : config.compensationSchemeName,
        compensationCurrency: resetToDefaults ? "INR" : config.compensationCurrency,
        defaultTimezone: resetToDefaults ? "UTC" : config.defaultTimezone?.trim() || "UTC",
        defaultCandidateRetentionDays: resetToDefaults ? 730 : retentionDays,
        offerLetterSubjectTemplate: resetToDefaults
          ? defaults.offerLetterSubjectTemplate
          : config.offerLetterSubjectTemplate,
        offerLetterBodyTemplate: resetToDefaults ? defaults.offerLetterBodyTemplate : config.offerLetterBodyTemplate,
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
    <Card
      sx={{
        p: { xs: 2.5, sm: 3.5, md: 4 },
        mb: 4,
        borderRadius: "20px",
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
        bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF",
        backdropFilter: "blur(12px)",
        boxShadow: isDark
          ? "0 20px 40px -15px rgba(0, 0, 0, 0.6)"
          : "0 10px 30px -10px rgba(15, 23, 42, 0.08)",
        overflow: "hidden",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <Stack spacing={3}>
        {/* Top Header & Action Bar */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2.5}
          flexWrap="wrap"
          useFlexGap
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: "14px",
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.12),
                color: "primary.main",
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.25),
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.2)}`,
                transition: "transform 0.25s ease",
                "&:hover": { transform: "rotate(15deg) scale(1.05)" },
              }}
            >
              <SettingsSuggestOutlined sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                <Typography variant="h5" fontWeight={850} sx={{ letterSpacing: "-0.02em", fontSize: { xs: "1.2rem", sm: "1.45rem" } }}>
                  Recruitment Settings
                </Typography>
                <Chip
                  size="small"
                  icon={
                    <FiberManualRecordRounded
                      sx={{
                        fontSize: "10px !important",
                        color: `${selectedMode.accentColor} !important`,
                        animation: `${pulseLiveDot} 1.8s ease-in-out infinite`,
                      }}
                    />
                  }
                  label={`${config.recruitmentMode} Mode`}
                  sx={{
                    height: 24,
                    fontWeight: 750,
                    fontSize: "0.72rem",
                    borderRadius: "8px",
                    bgcolor: alpha(selectedMode.accentColor, 0.12),
                    color: selectedMode.accentColor,
                    border: "1px solid",
                    borderColor: alpha(selectedMode.accentColor, 0.28),
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem", mt: 0.35 }}>
                Configure company recruitment operating model, stage gates, scoring rubrics, and automated candidate workflows.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.5} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<RestoreOutlined sx={{ fontSize: 16 }} />}
              disabled={saving || loading}
              onClick={() => void save(true)}
              sx={{
                flex: { xs: 1, sm: "none" },
                height: 40,
                px: 2.25,
                fontSize: "0.82rem",
                fontWeight: 650,
                borderRadius: "10px",
                borderColor: isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                transition: "all 0.2s ease",
                "&:hover": { transform: "translateY(-1px)" },
              }}
            >
              Reset defaults
            </AppButton>
            <AppButton
              variant="contained"
              size="small"
              startIcon={<SaveOutlined sx={{ fontSize: 16 }} />}
              disabled={saving || loading}
              onClick={() => void save()}
              sx={{
                flex: { xs: 1, sm: "none" },
                height: 40,
                px: 2.75,
                fontSize: "0.82rem",
                fontWeight: 750,
                borderRadius: "10px",
                boxShadow: `0 4px 14px ${alpha(theme.palette.primary.main, 0.35)}`,
                transition: "all 0.2s ease",
                "&:hover": { transform: "translateY(-1px)", boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.45)}` },
              }}
            >
              {saving ? "Saving…" : "Save settings"}
            </AppButton>
          </Stack>
        </Stack>

        {/* Tenant Status Banner */}
        <Box
          sx={{
            py: 1.25,
            px: 2,
            borderRadius: "12px",
            bgcolor: isDark ? "rgba(15, 23, 42, 0.4)" : alpha(theme.palette.primary.main, 0.03),
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.06)" : alpha(theme.palette.primary.main, 0.1),
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Chip
            size="small"
            label={config.configSource === "CompanyOverride" ? "🟢 Company override active" : "⚙️ Using system defaults"}
            color={config.configSource === "CompanyOverride" ? "primary" : "default"}
            sx={{ fontWeight: 750, height: 24, fontSize: "0.72rem", borderRadius: "6px" }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
            Strictly tenant-isolated: only this company is affected; candidate application audit history is preserved.
          </Typography>
        </Box>

        {/* Animated Categorized Navigation Tabs */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: "divider",
            mt: 0.5,
            "& .MuiTabs-root": { minHeight: 52 },
          }}
        >
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
            aria-label="recruitment configuration sections"
            sx={{
              "& .MuiTab-root": {
                textTransform: "none",
                minHeight: 52,
                fontWeight: 700,
                fontSize: "0.86rem",
                px: { xs: 2, sm: 2.75 },
                py: 1.5,
                gap: 1.25,
                borderRadius: "12px 12px 0 0",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                  bgcolor: isDark ? "rgba(255,255,255,0.03)" : alpha(theme.palette.primary.main, 0.04),
                },
                "&.Mui-selected": {
                  color: "primary.main",
                  fontWeight: 850,
                },
              },
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: "3px 3px 0 0",
                boxShadow: `0 -1px 8px ${theme.palette.primary.main}`,
              },
            }}
          >
            <Tab
              icon={<TuneRounded sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Operating Model & Pipeline"
              id="recruitment-tab-0"
              aria-controls="recruitment-tabpanel-0"
            />
            <Tab
              icon={<ShieldOutlined sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Stage Gates & Capabilities"
              id="recruitment-tab-1"
              aria-controls="recruitment-tabpanel-1"
            />
            <Tab
              icon={<RuleOutlined sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Screening & Preboarding"
              id="recruitment-tab-2"
              aria-controls="recruitment-tabpanel-2"
            />
            <Tab
              icon={<AssignmentTurnedInOutlined sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Interview Plans & SLAs"
              id="recruitment-tab-3"
              aria-controls="recruitment-tabpanel-3"
            />
            <Tab
              icon={<MarkEmailReadOutlined sx={{ fontSize: 18 }} />}
              iconPosition="start"
              label="Offers & Email Templates"
              id="recruitment-tab-4"
              aria-controls="recruitment-tabpanel-4"
            />
          </Tabs>
        </Box>

        {/* TAB 0: Operating Model & Pipeline Roadmap */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 0}
          id="recruitment-tabpanel-0"
          aria-labelledby="recruitment-tab-0"
          sx={{
            display: activeTab === 0 ? "block" : "none",
            animation: `${fadeInSlideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        >
          <Stack spacing={3.5}>
            {/* Operating Model Selector */}
            <Box>
              <Stack spacing={0.5} sx={{ mb: 2.25 }}>
                <Typography variant="subtitle1" fontWeight={850} sx={{ letterSpacing: "-0.015em", fontSize: "1.05rem" }}>
                  Recruitment Operating Model
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.84rem" }}>
                  Select a baseline operating model. You can customize individual stage gates and capability switches anytime.
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(auto-fit, minmax(280px, 1fr))",
                  },
                  gap: 3,
                }}
              >
                {(Object.keys(modes) as RecruitmentEnterpriseConfig["recruitmentMode"][]).map((mode) => {
                  const item = modes[mode];
                  const active = config.recruitmentMode === mode;
                  const IconComponent = item.icon;
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
                          p: 3,
                          height: "100%",
                          minHeight: 280,
                          border: active ? "2px solid" : "1px solid",
                          borderColor: active
                            ? item.accentColor
                            : isDark
                            ? "rgba(255, 255, 255, 0.1)"
                            : "#E2E8F0",
                          borderRadius: "18px",
                          bgcolor: active
                            ? isDark
                              ? alpha(item.accentColor, 0.14)
                              : alpha(item.accentColor, 0.05)
                            : isDark
                            ? "rgba(30, 41, 59, 0.35)"
                            : "#FFFFFF",
                          cursor: "pointer",
                          position: "relative",
                          overflow: "hidden",
                          transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          boxSizing: "border-box",
                          boxShadow: active
                            ? `0 12px 30px -8px ${alpha(item.accentColor, 0.35)}`
                            : isDark
                            ? "0 4px 12px rgba(0,0,0,0.2)"
                            : "0 2px 8px rgba(15,23,42,0.03)",
                          "&:hover": {
                            transform: "translateY(-4px)",
                            borderColor: item.accentColor,
                            boxShadow: `0 14px 34px -8px ${alpha(item.accentColor, 0.3)}`,
                          },
                          "&:focus-visible": { outline: "2px solid", outlineColor: item.accentColor, outlineOffset: 2 },
                        }}
                      >
                        {/* Top Accent Gradient Bar */}
                        <Box
                          sx={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            bgcolor: item.accentColor,
                            opacity: active ? 1 : 0.4,
                          }}
                        />

                        <Box sx={{ width: "100%" }}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="flex-start"
                            flexWrap="wrap"
                            useFlexGap
                            gap={1}
                            sx={{ mb: 1.75, mt: 0.5 }}
                          >
                            <Stack direction="row" spacing={1.5} alignItems="center">
                              <Box
                                sx={{
                                  width: 38,
                                  height: 38,
                                  borderRadius: "10px",
                                  display: "grid",
                                  placeItems: "center",
                                  bgcolor: alpha(item.accentColor, 0.15),
                                  color: item.accentColor,
                                }}
                              >
                                <IconComponent sx={{ fontSize: 22 }} />
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography fontWeight={850} sx={{ fontSize: "0.98rem", color: active ? item.accentColor : "text.primary" }}>
                                  {item.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, fontSize: "0.78rem", lineHeight: 1.4 }}>
                                  {item.subtitle}
                                </Typography>
                              </Box>
                            </Stack>

                            {active ? (
                              <Chip
                                size="small"
                                icon={<CheckCircleRounded sx={{ fontSize: "14px !important", color: "#FFFFFF !important" }} />}
                                label="Selected"
                                sx={{
                                  height: 24,
                                  fontWeight: 800,
                                  fontSize: "0.72rem",
                                  borderRadius: "6px",
                                  bgcolor: item.accentColor,
                                  color: "#FFFFFF",
                                  flexShrink: 0,
                                  animation: `${pulseGlow} 2s infinite`,
                                }}
                              />
                            ) : (
                              <Chip
                                size="small"
                                variant="outlined"
                                label={item.badge}
                                sx={{ height: 24, fontWeight: 650, fontSize: "0.7rem", borderRadius: "6px", borderColor: "divider", flexShrink: 0 }}
                              />
                            )}
                          </Stack>

                          <Divider sx={{ my: 1.75, opacity: 0.6 }} />

                          <Stack spacing={1.25}>
                            {item.features.map((feature) => (
                              <Stack direction="row" spacing={1.25} alignItems="flex-start" key={feature}>
                                <CheckCircleOutlineRounded
                                  sx={{
                                    fontSize: 16,
                                    mt: 0.2,
                                    flexShrink: 0,
                                    color: active ? item.accentColor : "text.disabled",
                                  }}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: "0.78rem",
                                    lineHeight: 1.5,
                                    color: active ? "text.primary" : "text.secondary",
                                    fontWeight: active ? 650 : 400,
                                  }}
                                >
                                  {feature}
                                </Typography>
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              </Box>

            {/* Interactive Animated Pipeline Flow Strip */}
            <Box
              sx={{
                p: { xs: 2.25, sm: 3 },
                borderRadius: "18px",
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "#F8FAFC",
                boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 2px 10px rgba(15,23,42,0.02)",
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }} flexWrap="wrap" gap={1}>
                <Box>
                  <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.92rem" }}>
                    Active Recruitment Pipeline Flow ({config.recruitmentMode} Mode)
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                    Candidates advance through these stages according to your company's gate policies.
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  icon={<AutoAwesomeOutlined sx={{ fontSize: 14 }} />}
                  label={`${selectedMode.flow.length} Configured Stages`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 750, height: 26, fontSize: "0.72rem", borderRadius: "6px" }}
                />
              </Stack>

              {/* Step Roadmap with Smooth Connected Flow Track */}
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                  overflowX: "auto",
                  py: 1,
                  px: 0.5,
                  "&::-webkit-scrollbar": { height: 6 },
                  "&::-webkit-scrollbar-thumb": {
                    bgcolor: isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                    borderRadius: 3,
                  },
                }}
              >
                {selectedMode.flow.map((step, index) => {
                  const isLast = index === selectedMode.flow.length - 1;
                  return (
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1.25}
                      key={step}
                      sx={{ flexShrink: 0 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                          py: 1,
                          px: 1.75,
                          borderRadius: "10px",
                          bgcolor: isLast
                            ? alpha("#10B981", 0.12)
                            : isDark
                            ? "rgba(15, 23, 42, 0.4)"
                            : "#FFFFFF",
                          border: "1px solid",
                          borderColor: isLast
                            ? "#10B981"
                            : isDark
                            ? "rgba(255,255,255,0.12)"
                            : "#CBD5E1",
                          boxShadow: isLast
                            ? "0 4px 12px rgba(16, 185, 129, 0.2)"
                            : "0 1px 3px rgba(0,0,0,0.02)",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            transform: "translateY(-1px)",
                            borderColor: "primary.main",
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 22,
                            height: 22,
                            borderRadius: "50%",
                            display: "grid",
                            placeItems: "center",
                            fontSize: "0.7rem",
                            fontWeight: 800,
                            bgcolor: isLast ? "#10B981" : "primary.main",
                            color: "#FFFFFF",
                            flexShrink: 0,
                          }}
                        >
                          {index + 1}
                        </Box>
                        <Typography
                          variant="caption"
                          fontWeight={800}
                          sx={{
                            fontSize: "0.82rem",
                            color: isLast ? "#10B981" : "text.primary",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {step}
                        </Typography>
                      </Box>
                      {!isLast && (
                        <ArrowForwardRounded
                          sx={{
                            fontSize: 18,
                            color: "text.disabled",
                            flexShrink: 0,
                          }}
                        />
                      )}
                    </Stack>
                  );
                })}
              </Box>
            </Box>

            {/* Global Locations, Timezone & Automations Card */}
            <Box
              sx={{
                p: { xs: 2.25, sm: 3 },
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                borderRadius: "18px",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "background.paper",
                boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 2px 8px rgba(15,23,42,0.02)",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <BusinessOutlined sx={{ fontSize: 22 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={850} sx={{ fontSize: "0.98rem" }}>
                    Hiring Locations, Timezone & Automations
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Company-wide defaults for job creation and automated notifications.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <AppTextField
                    label="Hiring locations (comma-separated)"
                    value={locationsText}
                    disabled={loading || saving}
                    onChange={(e) => setLocationsText(e.target.value)}
                    placeholder="Bengaluru, Mumbai, Remote"
                    helperText="Locations available when creating jobs. At least one required before publishing."
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <AppTextField
                    label="Recruitment timezone"
                    value={config.defaultTimezone ?? "UTC"}
                    disabled={loading || saving}
                    onChange={(e) => update("defaultTimezone", e.target.value)}
                    placeholder="UTC or Asia/Kolkata"
                    helperText="Valid IANA timezone for interview scheduling"
                    fullWidth
                  />
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2.25,
                      minHeight: 88,
                      border: "1px solid",
                      borderColor: config.enableSla ? alpha(theme.palette.primary.main, 0.4) : isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                      borderRadius: "14px",
                      bgcolor: config.enableSla
                        ? isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.03)
                        : isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      transition: "all 0.2s ease",
                      "&:hover": { borderColor: theme.palette.primary.main },
                    }}
                  >
                    <Box minWidth={0} sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: "0.88rem" }}>
                        SLA and stage aging alerts
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.76rem", lineHeight: 1.45, mt: 0.25 }}>
                        Alert recruiters when applications remain in a stage beyond configured threshold.
                      </Typography>
                    </Box>
                    <AppSwitch
                      checked={config.enableSla}
                      disabled={loading || saving}
                      onChange={(e) => update("enableSla", e.target.checked)}
                      sx={{ flexShrink: 0 }}
                    />
                  </Box>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2.25,
                      minHeight: 88,
                      border: "1px solid",
                      borderColor: config.enableAutomation ? alpha(theme.palette.primary.main, 0.4) : isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                      borderRadius: "14px",
                      bgcolor: config.enableAutomation
                        ? isDark ? alpha(theme.palette.primary.main, 0.1) : alpha(theme.palette.primary.main, 0.03)
                        : isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 2,
                      transition: "all 0.2s ease",
                      "&:hover": { borderColor: theme.palette.primary.main },
                    }}
                  >
                    <Box minWidth={0} sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={800} sx={{ fontSize: "0.88rem" }}>
                        Recruitment automation queue
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.76rem", lineHeight: 1.45, mt: 0.25 }}>
                        Automatically queue candidate reminders and approval notifications.
                      </Typography>
                    </Box>
                    <AppSwitch
                      checked={config.enableAutomation}
                      disabled={loading || saving}
                      onChange={(e) => update("enableAutomation", e.target.checked)}
                      sx={{ flexShrink: 0 }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Included in Current Mode Summary */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: "16px",
                border: "1px dashed",
                borderColor: isDark ? "rgba(255, 255, 255, 0.15)" : "#CBD5E1",
                bgcolor: isDark ? "rgba(15, 23, 42, 0.2)" : alpha(selectedMode.accentColor, 0.02),
              }}
            >
              <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.88rem", color: selectedMode.accentColor }}>
                Included in {config.recruitmentMode} Mode
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 1.5 }}>
                {selectedMode.features.map((feature) => (
                  <Chip
                    key={feature}
                    size="small"
                    label={feature}
                    variant="outlined"
                    sx={{
                      height: 28,
                      fontSize: "0.76rem",
                      fontWeight: 650,
                      borderRadius: "8px",
                      borderColor: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1",
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </Stack>
        </Box>

        {/* TAB 1: Stage Gates & Capabilities */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 1}
          id="recruitment-tabpanel-1"
          aria-labelledby="recruitment-tab-1"
          sx={{
            display: activeTab === 1 ? "block" : "none",
            animation: `${fadeInSlideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        >
          <Stack spacing={3.5}>
            {/* Featured Highlight Card: Per-Job Hiring Workflow Customization */}
            <Box
              sx={{
                p: { xs: 2.5, sm: 3 },
                borderRadius: "18px",
                border: "2px solid",
                borderColor: config.allowJobWorkflowCustomization
                  ? "primary.main"
                  : isDark
                  ? "rgba(255, 255, 255, 0.1)"
                  : "#CBD5E1",
                bgcolor: config.allowJobWorkflowCustomization
                  ? isDark
                    ? alpha(theme.palette.primary.main, 0.12)
                    : alpha(theme.palette.primary.main, 0.04)
                  : isDark
                  ? "rgba(30, 41, 59, 0.35)"
                  : "#F8FAFC",
                boxShadow: config.allowJobWorkflowCustomization
                  ? `0 8px 24px -4px ${alpha(theme.palette.primary.main, 0.25)}`
                  : "none",
                transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2.5}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "14px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.15),
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  >
                    <DisplaySettingsOutlined sx={{ fontSize: 26 }} />
                  </Box>
                  <Box>
                    <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle1" fontWeight={850} sx={{ fontSize: "1rem" }}>
                        Per-Job Hiring Workflow & Screening Customization
                      </Typography>
                      <Chip
                        size="small"
                        icon={
                          <FiberManualRecordRounded
                            sx={{
                              fontSize: "10px !important",
                              color: config.allowJobWorkflowCustomization ? "#10B981 !important" : "#94A3B8 !important",
                              animation: config.allowJobWorkflowCustomization ? `${pulseLiveDot} 1.8s infinite` : "none",
                            }}
                          />
                        }
                        label={config.allowJobWorkflowCustomization ? "Enabled on Job Postings" : "Hidden (Company Defaults)"}
                        color={config.allowJobWorkflowCustomization ? "primary" : "default"}
                        sx={{ height: 26, fontWeight: 750, fontSize: "0.72rem", borderRadius: "7px" }}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", mt: 0.35 }}>
                      Allow job creators to customize hiring workflow modes (Direct Hire, Standard, Enterprise) and screening criteria on individual job postings. When disabled, this section is hidden on job postings and company defaults apply.
                    </Typography>
                  </Box>
                </Stack>
                <AppSwitch
                  checked={Boolean(config.allowJobWorkflowCustomization)}
                  disabled={loading || saving}
                  onChange={(e) => update("allowJobWorkflowCustomization", e.target.checked)}
                  inputProps={{ "aria-label": "Per-job hiring workflow customization" }}
                  sx={{ flexShrink: 0 }}
                />
              </Stack>
            </Box>

            {/* Fine-Grained Capability Groups with Responsive Fluid Grid */}
            {capabilityGroups.map((group) => (
              <Box
                key={group.title}
                sx={{
                  p: { xs: 2.25, sm: 3 },
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  borderRadius: "18px",
                  bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "background.paper",
                  boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 2px 8px rgba(15,23,42,0.02)",
                }}
              >
                <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.96rem" }}>
                  {group.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5, fontSize: "0.78rem" }}>
                  {group.description}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      md: "repeat(2, 1fr)",
                    },
                    gap: 2,
                  }}
                >
                  {group.fields.map((field) => {
                    const isChecked = Boolean(config[field.key]);
                    return (
                      <Box
                        key={String(field.key)}
                        sx={{
                          p: 2.25,
                          minHeight: 88,
                          borderRadius: "14px",
                          border: "1px solid",
                          borderColor: isChecked
                            ? alpha(theme.palette.primary.main, 0.45)
                            : isDark
                            ? "rgba(255, 255, 255, 0.06)"
                            : "#E2E8F0",
                          bgcolor: isChecked
                            ? isDark
                              ? alpha(theme.palette.primary.main, 0.08)
                              : alpha(theme.palette.primary.main, 0.03)
                            : isDark
                            ? "rgba(15, 23, 42, 0.25)"
                            : "#F8FAFC",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                          height: "100%",
                          boxSizing: "border-box",
                          transition: "all 0.2s ease",
                          "&:hover": {
                            borderColor: theme.palette.primary.main,
                            transform: "translateY(-1px)",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
                          },
                        }}
                      >
                        <Box minWidth={0} sx={{ flex: 1, pr: 1 }}>
                          <Typography
                            variant="body2"
                            fontWeight={800}
                            sx={{
                              fontSize: "0.86rem",
                              lineHeight: 1.35,
                              whiteSpace: "normal",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {field.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              display: "block",
                              fontSize: "0.76rem",
                              lineHeight: 1.45,
                              mt: 0.35,
                              whiteSpace: "normal",
                            }}
                          >
                            {field.help}
                          </Typography>
                        </Box>
                        <AppSwitch
                          checked={isChecked}
                          disabled={loading || saving}
                          onChange={(event) =>
                            update(field.key, event.target.checked as RecruitmentEnterpriseConfig[typeof field.key])
                          }
                          inputProps={{ "aria-label": field.label }}
                          sx={{ flexShrink: 0 }}
                        />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Stack>
        </Box>

        {/* TAB 2: Screening & Preboarding */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 2}
          id="recruitment-tabpanel-2"
          aria-labelledby="recruitment-tab-2"
          sx={{
            display: activeTab === 2 ? "block" : "none",
            animation: `${fadeInSlideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        >
          <Stack spacing={3.5}>
            {/* Header Box */}
            <Box
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                borderRadius: "18px",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "background.paper",
                boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 2px 8px rgba(15,23,42,0.02)",
              }}
            >
              <Stack direction="row" spacing={1.75} alignItems="center" sx={{ mb: 3 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <RuleOutlined sx={{ fontSize: 24 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={850} sx={{ fontSize: "1rem" }}>
                    Screening & Preboarding Policy Configuration
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Define company-wide screening evaluation pass thresholds, criteria rubrics, and mandatory preboarding tasks.
                  </Typography>
                </Box>
              </Stack>

              {/* Section 1: Threshold & Numerical Settings */}
              <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                      bgcolor: isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <Box>
                      <AppTextField
                        label="Minimum screening pass score (0–100%)"
                        type="number"
                        value={config.screeningPassScore ?? 60}
                        disabled={loading || saving}
                        onChange={(e) => update("screeningPassScore", Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                        inputProps={{ min: 0, max: 100 }}
                        helperText="Candidates scoring ≥ threshold auto-advance to Shortlisted."
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          Auto-Advance Gate:
                        </Typography>
                        <Chip
                          size="small"
                          icon={<CheckRounded sx={{ fontSize: 13 }} />}
                          label={`≥ ${config.screeningPassScore ?? 60}% Auto-Pass`}
                          color={(config.screeningPassScore ?? 60) >= 50 ? "success" : "warning"}
                          sx={{ height: 24, fontSize: "0.72rem", fontWeight: 750, borderRadius: "6px" }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                      bgcolor: isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <Box>
                      <AppTextField
                        label="Default Currency (ISO)"
                        value={config.compensationCurrency ?? "INR"}
                        disabled={loading || saving}
                        onChange={(e) => update("compensationCurrency", e.target.value.toUpperCase().slice(0, 3))}
                        helperText="3-letter ISO code (e.g., INR, USD, EUR, GBP)."
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          Active Currency:
                        </Typography>
                        <Chip
                          size="small"
                          label={config.compensationCurrency || "INR"}
                          color="primary"
                          variant="outlined"
                          sx={{ height: 24, fontSize: "0.72rem", fontWeight: 800, borderRadius: "6px" }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: "14px",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                      bgcolor: isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      boxSizing: "border-box",
                    }}
                  >
                    <Box>
                      <AppTextField
                        label="Candidate Retention (Days)"
                        type="number"
                        value={config.defaultCandidateRetentionDays ?? 730}
                        disabled={loading || saving}
                        onChange={(e) => update("defaultCandidateRetentionDays", Number(e.target.value))}
                        inputProps={{ min: 30, max: 3650, step: 1 }}
                        helperText="GDPR/privacy retention window (30–3650 days)."
                        fullWidth
                      />
                    </Box>
                    <Box sx={{ mt: 2, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          Retention Period:
                        </Typography>
                        <Chip
                          size="small"
                          label={`~${Math.round((Number(config.defaultCandidateRetentionDays ?? 730) / 365) * 10) / 10} Years`}
                          color="default"
                          variant="outlined"
                          sx={{ height: 24, fontSize: "0.72rem", fontWeight: 750, borderRadius: "6px" }}
                        />
                      </Stack>
                    </Box>
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              {/* Section 2: Criteria & Checklist Side-by-Side Cards */}
              <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2.75,
                      borderRadius: "16px",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                      bgcolor: isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.92rem", mb: 0.5 }}>
                        Screening Evaluation Criteria
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, fontSize: "0.76rem" }}>
                        Rubrics rated by recruiters during applicant review. Comma-separated.
                      </Typography>
                      <AppTextField
                        label="Screening criteria (comma-separated)"
                        value={criteriaText}
                        disabled={loading || saving}
                        onChange={(e) => setCriteriaText(e.target.value)}
                        fullWidth
                      />
                    </Box>

                    {parsedCriteriaList.length > 0 && (
                      <Box sx={{ mt: 2.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={750} sx={{ display: "block", mb: 1, fontSize: "0.74rem" }}>
                          Active criteria tags ({parsedCriteriaList.length}):
                        </Typography>
                        <Stack direction="row" spacing={0.85} flexWrap="wrap" useFlexGap>
                          {parsedCriteriaList.map((crit) => (
                            <Chip
                              key={crit}
                              size="small"
                              label={crit}
                              color="primary"
                              variant="outlined"
                              sx={{ height: 26, fontSize: "0.74rem", borderRadius: "7px", fontWeight: 700 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Grid>

                <Grid size={{ xs: 12, md: 6 }}>
                  <Box
                    sx={{
                      p: 2.75,
                      borderRadius: "16px",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                      bgcolor: isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box>
                      <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.92rem", mb: 0.5 }}>
                        Preboarding Checklist Tasks
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, fontSize: "0.76rem" }}>
                        Tasks auto-generated when candidate accepts offer. Comma-separated.
                      </Typography>
                      <AppTextField
                        label="Preboarding tasks (comma-separated)"
                        value={checklistText}
                        disabled={loading || saving}
                        onChange={(e) => setChecklistText(e.target.value)}
                        fullWidth
                      />
                    </Box>

                    {parsedChecklistList.length > 0 && (
                      <Box sx={{ mt: 2.5, pt: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={750} sx={{ display: "block", mb: 1, fontSize: "0.74rem" }}>
                          Configured checklist tasks ({parsedChecklistList.length}):
                        </Typography>
                        <Stack direction="row" spacing={0.85} flexWrap="wrap" useFlexGap>
                          {parsedChecklistList.map((task) => (
                            <Chip
                              key={task}
                              size="small"
                              label={task}
                              color="secondary"
                              variant="outlined"
                              sx={{ height: 26, fontSize: "0.74rem", borderRadius: "7px", fontWeight: 700 }}
                            />
                          ))}
                        </Stack>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Box>

        {/* TAB 3: Interview Plans & SLAs */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 3}
          id="recruitment-tabpanel-3"
          aria-labelledby="recruitment-tab-3"
          sx={{
            display: activeTab === 3 ? "block" : "none",
            animation: `${fadeInSlideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        >
          <Stack spacing={3.5}>
            {/* Default Interview Plan Editor */}
            <RecruitmentInterviewPlanEditor />

            {/* Interviewer Feedback SLA Card */}
            <RecruitmentFeedbackSlaCard />
          </Stack>
        </Box>

        {/* TAB 4: Offers & Email Templates */}
        <Box
          role="tabpanel"
          hidden={activeTab !== 4}
          id="recruitment-tabpanel-4"
          aria-labelledby="recruitment-tab-4"
          sx={{
            display: activeTab === 4 ? "block" : "none",
            animation: `${fadeInSlideUp} 0.35s cubic-bezier(0.16, 1, 0.3, 1)`,
          }}
        >
          <Stack spacing={3.5}>
            {/* Offer Approval Policy Editor */}
            <RecruitmentOfferApprovalPolicyEditor />

            {/* Offer Letter Template & Live Preview */}
            <Box
              sx={{
                p: { xs: 2.5, sm: 3.5 },
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                borderRadius: "18px",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "background.paper",
                boxShadow: isDark ? "0 4px 16px rgba(0,0,0,0.2)" : "0 2px 8px rgba(15,23,42,0.02)",
                minWidth: 0,
                maxWidth: "100%",
                boxSizing: "border-box",
              }}
            >
              <Stack direction="row" spacing={1.75} alignItems="center" sx={{ mb: 2.5 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: "12px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <MarkEmailReadOutlined sx={{ fontSize: 24 }} />
                </Box>
                <Box minWidth={0}>
                  <Typography variant="subtitle1" fontWeight={850} sx={{ fontSize: "1rem" }}>
                    Offer Letter Template & Candidate Preview
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
                    Tokens: [CandidateName], [JobTitle], [Currency], and [TotalCtc] are merged automatically.
                  </Typography>
                </Box>
              </Stack>

              <Grid container spacing={3.5} alignItems="stretch">
                <Grid size={{ xs: 12, lg: 6 }}>
                  <Stack spacing={2.25}>
                    <AppTextField
                      label="Offer email subject"
                      value={config.offerLetterSubjectTemplate ?? ""}
                      disabled={loading || saving}
                      onChange={(e) => update("offerLetterSubjectTemplate", e.target.value)}
                      inputProps={{ maxLength: 160 }}
                      helperText="Tokens [JobTitle] and [CandidateName] are personalized automatically."
                      fullWidth
                    />
                    <TextEditor
                      label="Offer letter email body (Rich Text Template)"
                      value={config.offerLetterBodyTemplate ?? ""}
                      setValue={(val) => update("offerLetterBodyTemplate", val)}
                      placeholder="Compose your formatted offer letter template here..."
                      allowHtmlMode
                      tokens={[
                        { token: "[CandidateName]", label: "[CandidateName]", desc: "Full candidate name" },
                        { token: "[JobTitle]", label: "[JobTitle]", desc: "Job vacancy title" },
                        { token: "[Currency]", label: "[Currency]", desc: "Compensation currency ISO code (e.g. INR)" },
                        { token: "[TotalCtc]", label: "[TotalCtc]", desc: "Total Offered Cost to Company" },
                      ]}
                      onResetDefault={() => {
                        const defaultTemplate = `<p>Dear [CandidateName],</p><p>We are pleased to extend this formal offer of employment for the position of <strong>[JobTitle]</strong>.</p><p><strong>Compensation (Total CTC):</strong> [Currency] [TotalCtc]</p><p>Please review the terms of this offer. To confirm your acceptance, kindly reply directly to this email with your written confirmation and signed offer letter.</p><p>Sincerely,<br/><strong>Human Resources &amp; Talent Acquisition</strong></p>`;
                        update("offerLetterBodyTemplate", defaultTemplate);
                        toast.info("Restored standard offer letter template");
                      }}
                      resetDefaultLabel="Restore standard template"
                      helperText="Candidate tokens are sanitized and securely merged upon candidate offer release."
                      minHeight={250}
                    />
                  </Stack>
                </Grid>

                <Grid size={{ xs: 12, lg: 6 }}>
                  {/* Email Mockup Preview Window */}
                  <Box
                    sx={{
                      borderRadius: "16px",
                      bgcolor: isDark ? "rgba(15, 23, 42, 0.45)" : "#F8FAFC",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "#E2E8F0",
                      height: "100%",
                      minHeight: { xs: 300, lg: 380 },
                      display: "flex",
                      flexDirection: "column",
                      overflow: "hidden",
                      boxShadow: isDark
                        ? "0 8px 24px rgba(0,0,0,0.3)"
                        : "0 4px 16px rgba(15,23,42,0.04)",
                    }}
                  >
                    {/* Mockup Titlebar */}
                    <Box
                      sx={{
                        px: 2.25,
                        py: 1.5,
                        bgcolor: isDark ? "rgba(30, 41, 59, 0.7)" : "#F1F5F9",
                        borderBottom: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Stack direction="row" spacing={0.85} alignItems="center">
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#EF4444" }} />
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#F59E0B" }} />
                        <Box sx={{ width: 10, height: 10, borderRadius: "50%", bgcolor: "#10B981" }} />
                        <Typography variant="caption" sx={{ ml: 1, fontWeight: 700, fontSize: "0.72rem", color: "text.secondary" }}>
                          Sample Candidate Email Preview
                        </Typography>
                      </Stack>
                      <Chip size="small" label="Live Render" color="primary" sx={{ height: 20, fontSize: "0.66rem", fontWeight: 750 }} />
                    </Box>

                    {/* Subject Line */}
                    <Box
                      sx={{
                        p: 1.75,
                        borderBottom: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                        bgcolor: isDark ? "rgba(30, 41, 59, 0.4)" : "#FFFFFF",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: "0.72rem" }}>
                        Subject:
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: "0.9rem", color: "primary.main", mt: 0.25 }}>
                        {offerLetterPreview.subject}
                      </Typography>
                    </Box>

                    {/* Email Body Content */}
                    <Box
                      sx={{
                        p: 2.5,
                        flex: 1,
                        minHeight: 200,
                        color: "text.primary",
                        fontSize: "0.88rem",
                        lineHeight: 1.75,
                        overflowY: "auto",
                        wordBreak: "break-word",
                        bgcolor: isDark ? "rgba(15, 23, 42, 0.3)" : "#FFFFFF",
                      }}
                      dangerouslySetInnerHTML={{ __html: offerLetterPreview.body }}
                    />

                    {/* HRMS Direct Delivery Notice in Email Preview */}
                    <Box
                      sx={{
                        p: 2,
                        borderTop: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0",
                        bgcolor: isDark ? "rgba(30, 41, 59, 0.3)" : "#F1F5F9",
                      }}
                    >
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.5 }}>
                        ✉️ <strong>Official HRMS Delivery:</strong> Delivered directly to candidate's email. Candidate replies with written confirmation or signed offer letter. No external magic links or separate acceptance portal required.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
