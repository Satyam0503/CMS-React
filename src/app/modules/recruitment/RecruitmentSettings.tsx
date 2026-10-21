import {
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
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
  offerLetterSubjectTemplate: "Your offer for [JobTitle]",
  offerLetterBodyTemplate:
    "<p>Dear [CandidateName],</p><p>We are pleased to offer you the [JobTitle] position.</p><p>Compensation: [Currency] [TotalCtc]</p>",
};

const idempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-recruitment-settings`;

const modes: Record<
  RecruitmentEnterpriseConfig["recruitmentMode"],
  {
    title: string;
    subtitle: string;
    badge: string;
    features: string[];
    flow: string[];
    preset: Partial<RecruitmentEnterpriseConfig>;
  }
> = {
  Simple: {
    title: "Simple (Startup & Agile)",
    subtitle: "Fast-track hiring with minimal approval bottlenecks",
    badge: "Agile / Startup",
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
    },
  },
  Standard: {
    title: "Standard (Mid-Market & Scaling)",
    subtitle: "Structured hiring with scorecards and offer controls",
    badge: "Scaling / Growth",
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
    },
  },
  Enterprise: {
    title: "Enterprise (Global Governance)",
    subtitle: "Full compliance, requisitions, panel debriefs & SLA audit",
    badge: "Full Governance",
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
      { key: "candidateEmailActions", label: "Candidate secure magic links", help: "Automatically issues secure candidate action links upon offer dispatch." },
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
  const [config, setConfig] = useState<RecruitmentEnterpriseConfig>(defaults);
  const [locationsText, setLocationsText] = useState("");
  const [criteriaText, setCriteriaText] = useState("Relevant experience, Required skills, Communication");
  const [checklistText, setChecklistText] = useState("candidate-details, documents, verification");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const selectedMode = modes[config.recruitmentMode] || modes.Simple;

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
      subject: render(config.offerLetterSubjectTemplate || "Your offer for [JobTitle]"),
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
        p: { xs: 1.75, sm: 2.5, md: 3.25 },
        mb: 3,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
        bgcolor: isDark ? "rgba(15, 23, 42, 0.4)" : "#FFFFFF",
        boxShadow: isDark ? "0 4px 20px rgba(0, 0, 0, 0.3)" : "0 2px 12px rgba(15, 23, 42, 0.03)",
        overflow: "hidden",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      <Stack spacing={{ xs: 2.5, md: 3 }}>
        {/* Header Section */}
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", lg: "center" }}
          spacing={2}
          flexWrap="wrap"
          useFlexGap
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                flexShrink: 0,
                borderRadius: "12px",
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, 0.2),
              }}
            >
              <SettingsSuggestOutlined sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={850} sx={{ letterSpacing: "-0.015em", fontSize: { xs: "1.15rem", sm: "1.35rem" } }}>
                Recruitment Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem", mt: 0.25 }}>
                Configure recruitment governance, stage gates, and hiring workflows.
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" spacing={1.25} sx={{ width: { xs: "100%", lg: "auto" } }}>
            <AppButton
              variant="outlined"
              size="small"
              startIcon={<RestoreOutlined sx={{ fontSize: 16 }} />}
              disabled={saving || loading}
              onClick={() => void save(true)}
              sx={{ flex: { xs: 1, lg: "none" }, height: 36, px: 2, fontSize: "0.8rem", fontWeight: 650, borderRadius: "8px" }}
            >
              Reset defaults
            </AppButton>
            <AppButton
              variant="contained"
              size="small"
              startIcon={<SaveOutlined sx={{ fontSize: 16 }} />}
              disabled={saving || loading}
              onClick={() => void save()}
              sx={{ flex: { xs: 1, lg: "none" }, height: 36, px: 2.25, fontSize: "0.8rem", fontWeight: 700, borderRadius: "8px" }}
            >
              {saving ? "Saving…" : "Save settings"}
            </AppButton>
          </Stack>
        </Stack>

        {/* Tenant Status Banner */}
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ py: 0.5 }}>
          <Chip
            size="small"
            label={config.configSource === "CompanyOverride" ? "🟢 Company override active" : "⚙️ Using system defaults"}
            color={config.configSource === "CompanyOverride" ? "primary" : "default"}
            sx={{ fontWeight: 750, height: 24, fontSize: "0.72rem", borderRadius: "6px" }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.76rem" }}>
            Strictly tenant-isolated: only this company is affected; candidate application audit history is preserved.
          </Typography>
        </Stack>

        <Divider />

        {/* Operating Model Selector */}
        <Box>
          <Stack spacing={0.5} sx={{ mb: 1.5 }}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: "-0.01em", fontSize: "0.95rem" }}>
              Recruitment Operating Model
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              Select a baseline framework. You can customize individual gates and capabilities below.
            </Typography>
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", lg: "repeat(3, minmax(0, 1fr))" },
              gap: 2,
              width: "100%",
              maxWidth: "100%",
            }}
          >
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
                    p: { xs: 2, sm: 2.25 },
                    border: active ? "2px solid" : "1px solid",
                    borderColor: active
                      ? theme.palette.primary.main
                      : isDark
                      ? "rgba(255, 255, 255, 0.08)"
                      : "#E2E8F0",
                    borderRadius: "14px",
                    bgcolor: active
                      ? isDark
                        ? alpha(theme.palette.primary.main, 0.12)
                        : alpha(theme.palette.primary.main, 0.04)
                      : isDark
                      ? "rgba(30, 41, 59, 0.3)"
                      : "background.paper",
                    cursor: "pointer",
                    transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    minWidth: 0,
                    maxWidth: "100%",
                    boxSizing: "border-box",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: isDark ? "0 8px 24px rgba(0,0,0,0.3)" : "0 8px 20px rgba(15,23,42,0.06)",
                      borderColor: theme.palette.primary.main,
                    },
                    "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 2 },
                  }}
                >
                  <Box sx={{ minWidth: 0, width: "100%" }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="flex-start"
                      flexWrap="wrap"
                      useFlexGap
                      gap={1}
                      sx={{ mb: 1 }}
                    >
                      <Box sx={{ minWidth: 0, flex: "1 1 120px" }}>
                        <Typography fontWeight={800} sx={{ fontSize: "0.925rem", color: active ? "primary.main" : "text.primary" }}>
                          {item.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25, fontSize: "0.75rem", lineHeight: 1.4 }}>
                          {item.subtitle}
                        </Typography>
                      </Box>
                      {active ? (
                        <Chip
                          size="small"
                          color="primary"
                          icon={<CheckCircleRounded sx={{ fontSize: "14px !important" }} />}
                          label="Selected"
                          sx={{ height: 22, fontWeight: 750, fontSize: "0.68rem", borderRadius: "5px", flexShrink: 0 }}
                        />
                      ) : (
                        <Chip
                          size="small"
                          variant="outlined"
                          label={item.badge}
                          sx={{ height: 22, fontWeight: 650, fontSize: "0.68rem", borderRadius: "5px", borderColor: "divider", flexShrink: 0 }}
                        />
                      )}
                    </Stack>

                    <Divider sx={{ my: 1.25, opacity: 0.6 }} />

                    <Stack spacing={0.75}>
                      {item.features.map((feature) => (
                        <Stack direction="row" spacing={0.75} alignItems="flex-start" key={feature}>
                          <CheckCircleOutlineRounded
                            sx={{ fontSize: 15, mt: 0.15, flexShrink: 0 }}
                            color={active ? "primary" : "disabled"}
                          />
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.74rem", lineHeight: 1.4 }}>
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

        {/* Enabled Recruitment Flow Strip */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: "14px",
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
            bgcolor: isDark ? "rgba(30, 41, 59, 0.3)" : "#F8FAFC",
          }}
        >
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: "0.85rem", mb: 1.25 }}>
            Active Recruitment Pipeline Flow
          </Typography>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap sx={{ py: 0.5 }}>
            {selectedMode.flow.map((step, index) => {
              const isLast = index === selectedMode.flow.length - 1;
              return (
                <Stack direction="row" spacing={1} alignItems="center" key={step}>
                  <Chip
                    label={`${index + 1}. ${step}`}
                    size="small"
                    color={isLast ? "primary" : "default"}
                    variant={isLast ? "filled" : "outlined"}
                    sx={{
                      fontWeight: 750,
                      height: 28,
                      fontSize: "0.75rem",
                      borderRadius: "7px",
                      borderColor: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1",
                    }}
                  />
                  {!isLast && <ArrowForwardRounded sx={{ fontSize: 16, color: "text.disabled" }} />}
                </Stack>
              );
            })}
          </Stack>
        </Box>

        {/* Default Interview Plan Editor */}
        <RecruitmentInterviewPlanEditor />

        {/* Interviewer Feedback SLA Card */}
        <RecruitmentFeedbackSlaCard />

        {/* Offer Approval Policy Editor */}
        <RecruitmentOfferApprovalPolicyEditor />

        {/* Screening & Preboarding Configuration */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
            borderRadius: "14px",
            bgcolor: isDark ? "rgba(30, 41, 59, 0.3)" : "background.paper",
            boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.75 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <RuleOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: "0.95rem" }}>
                Screening & Preboarding Policy Configuration
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                Define your company’s screening pass threshold, evaluation criteria, and mandatory checklist tasks.
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <AppTextField
                label="Minimum screening pass score (0–100)"
                type="number"
                value={config.screeningPassScore ?? 60}
                disabled={loading || saving}
                onChange={(e) => update("screeningPassScore", Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
                inputProps={{ min: 0, max: 100 }}
                helperText="Set to 0 if recruiters can pass candidates without a score."
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
              <AppTextField
                label="Default compensation currency"
                value={config.compensationCurrency ?? "INR"}
                disabled={loading || saving}
                onChange={(e) => update("compensationCurrency", e.target.value.toUpperCase().slice(0, 3))}
                helperText="3-letter ISO code (e.g., INR, USD, EUR, GBP)."
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 12, lg: 4 }}>
              <AppTextField
                label="Candidate data retention (days)"
                type="number"
                value={config.defaultCandidateRetentionDays ?? 730}
                disabled={loading || saving}
                onChange={(e) => update("defaultCandidateRetentionDays", Number(e.target.value))}
                inputProps={{ min: 30, max: 3650, step: 1 }}
                helperText="Privacy retention window (30–3650 days)."
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <AppTextField
                label="Screening evaluation criteria (comma-separated)"
                value={criteriaText}
                disabled={loading || saving}
                onChange={(e) => setCriteriaText(e.target.value)}
                helperText="Rubrics used across applicant review screens."
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
              <AppTextField
                label="Preboarding checklist tasks (comma-separated)"
                value={checklistText}
                disabled={loading || saving}
                onChange={(e) => setChecklistText(e.target.value)}
                helperText="Tasks auto-generated when an offer is accepted."
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>

        {/* Offer Letter Template & Live Preview */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
            borderRadius: "14px",
            bgcolor: isDark ? "rgba(30, 41, 59, 0.3)" : "background.paper",
            boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.02)",
            minWidth: 0,
            maxWidth: "100%",
            boxSizing: "border-box",
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.75 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <MarkEmailReadOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box minWidth={0}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: "0.95rem" }}>
                Offer Letter Template & Candidate Preview
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                Tokens: [CandidateName], [JobTitle], [Currency], and [TotalCtc] are merged automatically.
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2} alignItems="stretch">
            {/* Editor Column: Full width on < lg, 50% on desktop (lg) */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Stack spacing={1.5} sx={{ height: "100%", justifyContent: "space-between" }}>
                <Stack spacing={1.5}>
                  <AppTextField
                    label="Offer email subject"
                    value={config.offerLetterSubjectTemplate ?? ""}
                    disabled={loading || saving}
                    onChange={(e) => update("offerLetterSubjectTemplate", e.target.value)}
                    inputProps={{ maxLength: 160 }}
                    fullWidth
                  />
                  <AppTextField
                    label="Offer letter HTML body"
                    value={config.offerLetterBodyTemplate ?? ""}
                    disabled={loading || saving}
                    onChange={(e) => update("offerLetterBodyTemplate", e.target.value)}
                    multiline
                    minRows={8}
                    maxRows={14}
                    inputProps={{ maxLength: 20000 }}
                    helperText="Candidate tokens are sanitized and encoded before template merge."
                    fullWidth
                  />
                </Stack>

                {/* Quick Insert Tokens Bar */}
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ fontSize: "0.72rem" }}>
                    Quick insert tokens:
                  </Typography>
                  {[
                    { token: "[CandidateName]", desc: "Full candidate name" },
                    { token: "[JobTitle]", desc: "Position job title" },
                    { token: "[Currency]", desc: "Compensation currency ISO code" },
                    { token: "[TotalCtc]", desc: "Offered total CTC" },
                  ].map(({ token, desc }) => (
                    <Tooltip key={token} title={`Click to append ${desc}`}>
                      <Chip
                        label={token}
                        size="small"
                        variant="outlined"
                        onClick={() => {
                          update("offerLetterBodyTemplate", (config.offerLetterBodyTemplate ?? "") + ` ${token}`);
                          toast.info(`Appended ${token} to body template`);
                        }}
                        sx={{
                          height: 22,
                          fontSize: "0.68rem",
                          fontFamily: "monospace",
                          fontWeight: 600,
                          cursor: "pointer",
                          borderRadius: "5px",
                          borderColor: isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1",
                          "&:hover": { borderColor: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08) },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Stack>
              </Stack>
            </Grid>

            {/* Preview Column: Full width on < lg, 50% on desktop (lg) */}
            <Grid size={{ xs: 12, lg: 6 }}>
              <Box
                sx={{
                  p: { xs: 1.75, sm: 2 },
                  borderRadius: "12px",
                  bgcolor: isDark ? "rgba(15, 23, 42, 0.3)" : "#F8FAFC",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  height: "100%",
                  minHeight: { xs: 260, lg: 320 },
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                  <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={0.5}>
                    Sample Candidate Email Preview
                  </Typography>
                  <Chip size="small" label="Live Preview" color="primary" sx={{ height: 20, fontSize: "0.66rem", fontWeight: 700 }} />
                </Stack>
                <Box
                  sx={{
                    p: 1.25,
                    borderRadius: "8px",
                    bgcolor: isDark ? "rgba(30,41,59,0.5)" : "#FFFFFF",
                    border: "1px solid",
                    borderColor: "divider",
                    mb: 1.5,
                    minWidth: 0,
                    wordBreak: "break-word",
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block">
                    Subject:
                  </Typography>
                  <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.86rem", color: "primary.main" }}>
                    {offerLetterPreview.subject}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "8px",
                    bgcolor: isDark ? "rgba(30,41,59,0.5)" : "#FFFFFF",
                    border: "1px solid",
                    borderColor: "divider",
                    flex: 1,
                    minHeight: 180,
                    color: "text.primary",
                    fontSize: "0.85rem",
                    lineHeight: 1.65,
                    overflowY: "auto",
                    wordBreak: "break-word",
                  }}
                  dangerouslySetInnerHTML={{ __html: offerLetterPreview.body }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Global Locations, Timezone & Automations */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            border: "1px solid",
            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
            borderRadius: "14px",
            bgcolor: isDark ? "rgba(30, 41, 59, 0.3)" : "background.paper",
            boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.02)",
          }}
        >
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.75 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "10px",
                display: "grid",
                placeItems: "center",
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                flexShrink: 0,
              }}
            >
              <BusinessOutlined sx={{ fontSize: 20 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: "0.95rem" }}>
                Hiring Locations, Timezone & Automations
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
                Company-wide defaults for job creation and automated notifications.
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 6 }}>
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
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <AppTextField
                select
                label="Recruitment mode"
                value={config.recruitmentMode}
                disabled={loading || saving}
                onChange={(e) => selectModePreset(e.target.value as RecruitmentEnterpriseConfig["recruitmentMode"])}
                helperText="Loads recommended baseline gates"
                fullWidth
              >
                <MenuItem value="Simple">Simple (Startup)</MenuItem>
                <MenuItem value="Standard">Standard (Growth)</MenuItem>
                <MenuItem value="Enterprise">Enterprise (Governance)</MenuItem>
              </AppTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <AppTextField
                label="Recruitment timezone"
                value={config.defaultTimezone ?? "UTC"}
                disabled={loading || saving}
                onChange={(e) => update("defaultTimezone", e.target.value)}
                placeholder="UTC or Asia/Kolkata"
                helperText="Valid IANA timezone for interview times"
                fullWidth
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  borderRadius: "10px",
                  bgcolor: isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <AppSwitch
                  checked={config.enableSla}
                  disabled={loading || saving}
                  onChange={(e) => update("enableSla", e.target.checked)}
                />
                <Box minWidth={0}>
                  <Typography variant="body2" fontWeight={750} sx={{ fontSize: "0.82rem" }}>
                    SLA and stage aging alerts
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.74rem" }}>
                    Alert recruiters when applications remain in a stage beyond threshold.
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Box
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  borderRadius: "10px",
                  bgcolor: isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.25,
                }}
              >
                <AppSwitch
                  checked={config.enableAutomation}
                  disabled={loading || saving}
                  onChange={(e) => update("enableAutomation", e.target.checked)}
                />
                <Box minWidth={0}>
                  <Typography variant="body2" fontWeight={750} sx={{ fontSize: "0.82rem" }}>
                    Recruitment automation queue
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.74rem" }}>
                    Automatically queue candidate reminders and approval notifications.
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Capability Controls Groups */}
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ letterSpacing: "-0.01em", fontSize: "0.95rem" }}>
              Fine-Grained Capability & Stage Controls
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem" }}>
              Toggle individual features and gates. Permissions and server-side transition checks remain strictly enforced.
            </Typography>
          </Box>

          {capabilityGroups.map((group) => (
            <Box
              key={group.title}
              sx={{
                p: { xs: 2, sm: 2.25 },
                border: "1px solid",
                borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                borderRadius: "14px",
                bgcolor: isDark ? "rgba(30, 41, 59, 0.3)" : "background.paper",
                boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.02)",
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: "0.88rem" }}>
                {group.title}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5, fontSize: "0.75rem" }}>
                {group.description}
              </Typography>

              <Grid container spacing={1.5}>
                {group.fields.map((field) => (
                  <Grid key={String(field.key)} size={{ xs: 12, lg: 6 }}>
                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#E2E8F0",
                        bgcolor: isDark ? "rgba(15, 23, 42, 0.25)" : "#F8FAFC",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 1.25,
                        height: "100%",
                        minWidth: 0,
                        maxWidth: "100%",
                        boxSizing: "border-box",
                        transition: "border-color 0.18s ease, background-color 0.18s ease",
                        "&:hover": {
                          borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "#CBD5E1",
                        },
                      }}
                    >
                      <AppSwitch
                        checked={Boolean(config[field.key])}
                        disabled={loading || saving}
                        onChange={(event) =>
                          update(field.key, event.target.checked as RecruitmentEnterpriseConfig[typeof field.key])
                        }
                        inputProps={{ "aria-label": field.label }}
                        sx={{ mt: 0.2, flexShrink: 0 }}
                      />
                      <Box minWidth={0} sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={750} sx={{ fontSize: "0.82rem", wordBreak: "break-word" }}>
                          {field.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.72rem", lineHeight: 1.35, mt: 0.2, wordBreak: "break-word" }}>
                          {field.help}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
        </Stack>

        {/* Mode Feature Summary Footer */}
        <Box
          sx={{
            p: 2,
            borderRadius: "14px",
            border: "1px dashed",
            borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
            bgcolor: isDark ? "rgba(15, 23, 42, 0.2)" : alpha(theme.palette.primary.main, 0.02),
          }}
        >
          <Typography variant="subtitle2" fontWeight={800} sx={{ fontSize: "0.84rem" }}>
            Included in {config.recruitmentMode} Mode
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={0.75} sx={{ mt: 1 }}>
            {selectedMode.features.map((feature) => (
              <Chip
                key={feature}
                size="small"
                label={feature}
                variant="outlined"
                sx={{
                  height: 24,
                  fontSize: "0.72rem",
                  fontWeight: 650,
                  borderRadius: "6px",
                  borderColor: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1",
                }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>
    </Card>
  );
}
