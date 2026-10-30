import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import dayjs, { Dayjs } from "dayjs";
import { useAppSelector } from "../../../../Redux/hooks";
import { getAllEmployees } from "../../../employees/employeeServices";
import { getAllDepartments } from "../../../admin/adminservices";
import { DepartmentModel } from "../../../admin/models";
import {
  Avatar,
  Alert,
  Autocomplete,
  Box,
  Button,
  ButtonBase,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  alpha,
  Divider,
  Drawer,
  IconButton,
  LinearProgress,
  Menu,
  MenuItem,
  Rating,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Tooltip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  OutlinedInput,
  InputAdornment,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import MoreVert from "@mui/icons-material/MoreVert";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import CancelOutlined from "@mui/icons-material/CancelOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import Add from "@mui/icons-material/Add";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ContentCopy from "@mui/icons-material/ContentCopy";
import OpenInNew from "@mui/icons-material/OpenInNew";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Check from "@mui/icons-material/Check";
import Delete from "@mui/icons-material/Delete";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import FolderSpecialOutlined from "@mui/icons-material/FolderSpecialOutlined";
import MergeTypeOutlined from "@mui/icons-material/MergeTypeOutlined";
import DocumentScannerOutlined from "@mui/icons-material/DocumentScannerOutlined";
import Send from "@mui/icons-material/Send";
import PersonAdd from "@mui/icons-material/PersonAdd";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import Event from "@mui/icons-material/Event";
import Videocam from "@mui/icons-material/Videocam";
import LocationOn from "@mui/icons-material/LocationOn";
import Edit from "@mui/icons-material/Edit";
import FactCheck from "@mui/icons-material/FactCheck";
import Group from "@mui/icons-material/Group";
import CheckCircle from "@mui/icons-material/CheckCircle";
import clsx from "clsx";
import {
  AppButton,
  AppSwitch,
  AppTextField,
  CustomisedDatePicker,
  CustomisedDateTimePicker,
} from "../../../../shared/components";
import CustomisedButton from "../../../../shared/components/C_Button";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import { PdfViewer } from "../../../../shared/components/PdfViewer";
import { applicationStatusMapper } from "../../../../../utils/common";
import {
  Applicant,
  CandidateHandoffRequest,
  RecruitmentApplicantMergeCommand,
  RecruitmentApplicationStageCommand,
  RecruitmentEnterpriseConfig,
  RecruitmentInterviewCommand,
  RecruitmentInterviewDebriefCommand,
  RecruitmentScreeningReviewCommand,
  RecruitmentOfferCommand,
  RecruitmentHiringDecisionCommand,
  RecruitmentCandidatePrivacyCommand,
  RecruitmentResumeExtractionReviewCommand,
  RecruitmentOfferVersionCommand,
  RecruitmentOfferVersion,
  RecruitmentOfferCounterRequest,
  RecruitmentOfferCounterDecisionCommand,
  RecruitmentScorecardCommand,
  RecruitmentTalentPoolCommand,
  RecruitmentOnboardingCase,
  JobModal,
  RecruitmentInterviewPlan,
  RecruitmentFinalScoreResult,
} from "../../models";
import { ApplicationStatus } from "../../../../../utils/enums";
import { getNextEmployeeId } from "../../../users/userservices";
import {
  handoffCandidateToPreboarding,
  upsertRecruitmentApplicationStage,
  mergeRecruitmentApplicants,
  upsertRecruitmentInterview,
  upsertRecruitmentOffer,
  getRecruitmentOfferByApplicant,
  issueRecruitmentExternalAction,
  upsertRecruitmentHiringDecision,
  applyRecruitmentCandidatePrivacy,
  reviewRecruitmentResumeExtraction,
  createRecruitmentOfferVersion,
  getRecruitmentOfferVersions,
  getRecruitmentOfferCounters,
  decideRecruitmentOfferCounter,
  upsertRecruitmentScreening,
  upsertRecruitmentScorecard,
  upsertRecruitmentTalentPool,
  getRecruitmentOnboarding,
  updateRecruitmentOnboarding,
  getRecruitmentInterviewRounds,
  getRecruitmentScorecards,
  getFinalInterviewScore,
  getRecruitmentInterviewPlan,
  getRecruitmentEnterpriseConfig,
  getRecruitmentResumeExtractionReview,
  getRecruitmentPreboardingQueue,
  updateRecruitmentPreboarding,
  getJobVacancyDetails,
  editJobVacancy,
  completeRecruitmentInterviewDebrief,
} from "../../services";

type Props = {
  open: boolean;
  applicant: Applicant;
  onClose: () => void;
  onSaved?: () => void;
};

type Mode = "screening" | "interview" | "offer" | "handoff";
type UtilityTool = "resume" | "privacy" | "talentpool" | "merge" | null;
type Feedback = { severity: "success" | "error" | "info" | "warning"; text: string; code?: string };

const defaultSteps: { id: Mode; label: string; helper: string }[] = [
  { id: "screening", label: "Screening", helper: "Candidate Review" },
  { id: "interview", label: "Interview", helper: "Schedule & Score" },
  { id: "offer", label: "Offer & Response", helper: "Terms & Acceptance" },
  { id: "handoff", label: "Preboarding & Hire", helper: "Convert to Employee" },
];

export interface DynamicCompensationItem {
  id: string;
  name: string;
  value: string;
}

export const standardPayrollComponentPresets = [
  { code: "HRA", name: "House Rent Allowance (HRA)" },
  { code: "SPECIAL", name: "Special Allowance" },
  { code: "LTA", name: "Leave Travel Allowance (LTA)" },
  { code: "PERF_BONUS", name: "Performance Bonus / Variable Pay" },
  { code: "MEDICAL", name: "Medical Allowance" },
  { code: "CONVEYANCE", name: "Transport / Conveyance Allowance" },
  { code: "FOOD", name: "Meal / Food Allowance" },
  { code: "COMMUNICATION", name: "Internet & Utility Allowance" },
  { code: "RELOCATION", name: "Relocation Assistance" },
];

const createIdempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const getApiMessage = (response: { data?: { message?: string; errorCode?: string | null } }) => ({
  text: response.data?.message ?? "Unable to save this recruitment action.",
  code: response.data?.errorCode,
});

export const RecruitmentLifecycleDrawer = ({ open, applicant, onClose, onSaved }: Props) => {
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.user.userData);
  const reviewerUserId = currentUser?.userId ?? "";
  const currentUserId = reviewerUserId;
  const reviewerDisplayName =
    currentUser?.fullName ||
    (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "") ||
    currentUser?.companyName ||
    "Current User";

  const quickDispositionPresets = [
    {
      label: "Candidate No-Show",
      decision: "Reject" as const,
      notes: "Candidate did not appear for scheduled interview (No-show) and did not respond to follow-up communications.",
      color: "error" as const,
    },
    {
      label: "Candidate Withdrew",
      decision: "Reject" as const,
      notes: "Candidate informed the hiring team that they have accepted another opportunity / withdrawn their application.",
      color: "warning" as const,
    },
    {
      label: "Did Not Meet Technical Bar",
      decision: "Reject" as const,
      notes: "Candidate did not meet required technical competencies for this role following technical assessment/interview.",
      color: "error" as const,
    },
    {
      label: "Hold for Comparison",
      decision: "Hold" as const,
      notes: "Strong profile, but placing on hold while evaluating remaining candidates in the panel pool.",
      color: "warning" as const,
    },
    {
      label: "Recommend for Hire",
      decision: "Approve" as const,
      notes: "Candidate successfully demonstrated required competencies across all criteria. Recommended for employment offer.",
      color: "success" as const,
    },
  ];

  const [mode, setMode] = useState<Mode>("offer");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>();
  const [enterpriseConfig, setEnterpriseConfig] = useState<RecruitmentEnterpriseConfig | null>(null);

  // Resume preview split pane toggle
  const [showResumePreview, setShowResumePreview] = useState(false);

  // Secondary Tools Dialog State
  const [activeUtilityTool, setActiveUtilityTool] = useState<UtilityTool>(null);
  const [moreToolsAnchorEl, setMoreToolsAnchorEl] = useState<null | HTMLElement>(null);

  // Screening state
  const [vacancyData, setVacancyData] = useState<JobModal | null>(null);
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [customThresholdScore, setCustomThresholdScore] = useState<number>(60);
  const [customCriteriaText, setCustomCriteriaText] = useState<string>("");
  const [savingThreshold, setSavingThreshold] = useState(false);

  const handleOpenThresholdModal = () => {
    setCustomThresholdScore(vacancyData?.screeningPassScore ?? passThreshold ?? 60);
    setCustomCriteriaText((vacancyData?.screeningCriteria ?? []).join(", "));
    setThresholdModalOpen(true);
  };

  const handleSaveRoleThreshold = async () => {
    if (!vacancyData?.jobId) return;
    setSavingThreshold(true);
    try {
      const parsedCriteria = customCriteriaText
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean);
      const payload: JobModal = {
        ...vacancyData,
        screeningPassScore: customThresholdScore,
        screeningCriteria: parsedCriteria,
      };
      const res = await editJobVacancy(payload, vacancyData.jobId);
      if (res.data?.success) {
        setVacancyData(payload);
        if (parsedCriteria.length > 0) {
          setScreening((curr) => ({
            ...curr,
            criteria: parsedCriteria.map((name) => {
              const existing = curr.criteria.find((c) => c.name.toLowerCase() === name.toLowerCase());
              return existing || { name, passed: true, notes: "" };
            }),
          }));
        }
        setFeedback({
          severity: "success",
          text: `Updated screening threshold for ${vacancyData.title || "job"} to ≥ ${customThresholdScore}%.`,
        });
        setThresholdModalOpen(false);
      } else {
        throw new Error(res.data?.message || "Failed to update role screening threshold.");
      }
    } catch (err) {
      setFeedback({ severity: "error", text: (err as Error).message });
    } finally {
      setSavingThreshold(false);
    }
  };
  const [screening, setScreening] = useState({
    score: 75,
    decision: "Pass" as RecruitmentScreeningReviewCommand["decision"],
    rejectionReason: "",
    evidence: "",
    criteria: [{ name: "Relevant experience", passed: true, notes: "" }],
  });

  // Interview state
  const [interviewSubTab, setInterviewSubTab] = useState<0 | 1>(0); // 0 = Schedule, 1 = Scorecard & Decision
  const [interviewRounds, setInterviewRounds] = useState<any[]>([]);
  const [savedScorecards, setSavedScorecards] = useState<any[]>([]);
  const [interviewPlan, setInterviewPlan] = useState<RecruitmentInterviewPlan | null>(null);
  const [authoritativeScore, setAuthoritativeScore] = useState<RecruitmentFinalScoreResult | null>(null);
  const [submittingScorecard, setSubmittingScorecard] = useState(false);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [, setDepartments] = useState<DepartmentModel[]>([]);
  const [interviewerQuery, setInterviewerQuery] = useState("");
  const [interview, setInterview] = useState({
    title: "Technical Interview",
    roundNumber: 1,
    roundType: "Technical",
    startsAtUtc: "",
    endsAtUtc: "",
    location: "",
    meetingUrl: "",
    panelistUserIds: "",
  });
  const [isSchedulingRoundOpen, setIsSchedulingRoundOpen] = useState(false);
  const [editingRoundId, setEditingRoundId] = useState<string | null>(null);
  const [selectedRoundFilter, setSelectedRoundFilter] = useState<number | "all">("all");
  const [isEditingScorecard, setIsEditingScorecard] = useState(false);

  const sortedRounds = useMemo(() => {
    return [...interviewRounds].sort((a, b) => (Number(a.roundNumber) || 1) - (Number(b.roundNumber) || 1));
  }, [interviewRounds]);

  const maxRoundNumber = useMemo(() => {
    if (!sortedRounds.length) return 0;
    return Math.max(...sortedRounds.map((r) => Number(r.roundNumber) || 1));
  }, [sortedRounds]);

  const nextRoundNumber = maxRoundNumber + 1;

  const handleStartScheduleRound = (roundNum?: number) => {
    const targetRoundNum = roundNum ?? nextRoundNumber;
    setInterview({
      title: `Round ${targetRoundNum} - Technical Evaluation`,
      roundNumber: targetRoundNum,
      roundType: "Technical",
      startsAtUtc: "",
      endsAtUtc: "",
      location: "",
      meetingUrl: "",
      panelistUserIds: "",
    });
    setEditingRoundId(null);
    setIsSchedulingRoundOpen(true);
  };

  const handleEditRound = (r: any) => {
    setInterview({
      title: r.title || `Round ${r.roundNumber} Interview`,
      roundNumber: r.roundNumber || 1,
      roundType: r.roundType || "Technical",
      startsAtUtc: r.startsAtUtc ? dayjs(r.startsAtUtc).format("YYYY-MM-DDTHH:mm") : "",
      endsAtUtc: r.endsAtUtc ? dayjs(r.endsAtUtc).format("YYYY-MM-DDTHH:mm") : "",
      location: r.location || "",
      meetingUrl: r.meetingUrl || "",
      panelistUserIds: Array.isArray(r.panelistUserIds) ? r.panelistUserIds.join(", ") : (r.panelistUserIds || ""),
    });
    setEditingRoundId(r.interviewId || null);
    setIsSchedulingRoundOpen(true);
  };

  const handleDebriefRound = async (interviewId: string, debriefDecision: "Advance" | "Hold" | "Reject") => {
    setBusy(true);
    setFeedback(undefined);
    try {
      const res = await completeRecruitmentInterviewDebrief({
        interviewId,
        decision: debriefDecision,
        idempotencyKey: createIdempotencyKey(),
      });
      saveResponse(res);
      setFeedback({ severity: "success", text: `Round debrief recorded: ${debriefDecision}.` });
      const roundsRes = await getRecruitmentInterviewRounds(applicant.applicantId, applicant.vacancyId);
      if (roundsRes.data.success && roundsRes.data.methodResult) setInterviewRounds(roundsRes.data.methodResult);
      void getRecruitmentScorecards(applicant.applicantId, applicant.vacancyId).then(({ data }) => {
        if (data.success && data.methodResult) setSavedScorecards(data.methodResult);
      });
      void getFinalInterviewScore(applicant.applicantId).then(({ data }) => {
        if (data.success && data.methodResult) setAuthoritativeScore(data.methodResult);
      });
    } catch (err) {
      setFeedback({ severity: "error", text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  };

  // Dynamic compensation items state (matches company payroll earning structures)
  const [compensationItems, setCompensationItems] = useState<DynamicCompensationItem[]>([
    { id: "comp-1", name: "House Rent Allowance (HRA)", value: "5000" },
    { id: "comp-2", name: "Transport / Conveyance Allowance", value: "10000" },
    { id: "comp-3", name: "Performance Bonus / Variable Pay", value: "12000" },
  ]);

  const handleAddCompensationItem = (name = "", value = "") => {
    if (compensationItems.length >= 30) {
      setFeedback({ severity: "warning", text: "Maximum limit of 30 compensation components reached." });
      return;
    }
    setCompensationItems((prev) => [
      ...prev,
      { id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, name, value },
    ]);
  };

  const handleRemoveCompensationItem = (id: string) => {
    setCompensationItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateCompensationItem = (id: string, field: "name" | "value", val: string) => {
    setCompensationItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: val } : item))
    );
  };

  const handleAddPresetComponent = (presetName: string) => {
    const existing = compensationItems.find(
      (item) => item.name.trim().toLowerCase() === presetName.trim().toLowerCase()
    );
    if (existing) {
      setFeedback({ severity: "info", text: `"${presetName}" is already added in the offer breakdown.` });
      return;
    }
    handleAddCompensationItem(presetName, "");
  };

  // Offer state
  const [offer, setOffer] = useState({
    offerId: "",
    salary: "",
    currency: "INR",
    startDateUtc: "",
    compensationComponents: {} as Record<string, string>,
    approvalReference: "",
    expiresAtUtc: "",
    status: "Draft" as RecruitmentOfferCommand["status"],
  });

  const [isAllowancesOpen, setIsAllowancesOpen] = useState(true);
  const [isRevisionMode, setIsRevisionMode] = useState(false);
  const [offerVersions, setOfferVersions] = useState<RecruitmentOfferVersion[]>([]);
  const [counterRequests, setCounterRequests] = useState<RecruitmentOfferCounterRequest[]>([]);

  // Revision form
  const [revisionForm, setRevisionForm] = useState({
    salary: "",
    currency: "INR",
    reason: "",
    notes: "",
  });

  // Scorecard & Decision state
  const createNewScorecardCriterion = (name = "", rating = 4, notes = "", code?: string) => ({
    id: `crit-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    code,
    name,
    rating,
    notes,
  });

  const [scorecard, setScorecard] = useState({
    scorecardId: "",
    interviewId: "",
    roundNumber: 1,
    reviewerUserId: reviewerUserId,
    recommendation: "Strong Hire",
    debriefDecision: "Advance" as RecruitmentInterviewDebriefCommand["decision"],
    status: "Submitted" as RecruitmentScorecardCommand["status"],
    criteria: [
      { id: "crit-1", name: "Technical Competence", rating: 4, notes: "" },
      { id: "crit-2", name: "Problem Solving & Analytical Ability", rating: 4, notes: "" },
      { id: "crit-3", name: "Communication & Collaboration", rating: 4, notes: "" },
      { id: "crit-4", name: "Culture Add & Values Alignment", rating: 4, notes: "" },
    ],
  });

  const [decision, setDecision] = useState({
    decision: "Approve" as RecruitmentHiringDecisionCommand["decision"],
    notes: "",
  });

  const currentTargetReviewer = scorecard.reviewerUserId || reviewerUserId;
  const currentTargetRound = scorecard.roundNumber || 1;
  const existingScorecardForRoundAndUser = useMemo(() => {
    return savedScorecards.find(
      (sc) => sc.reviewerUserId === currentTargetReviewer && Number(sc.roundNumber || 1) === Number(currentTargetRound)
    );
  }, [savedScorecards, currentTargetReviewer, currentTargetRound]);

  const displayedScorecards = useMemo(() => {
    if (selectedRoundFilter === "all") return savedScorecards;
    return savedScorecards.filter((sc) => Number(sc.roundNumber || 1) === Number(selectedRoundFilter));
  }, [savedScorecards, selectedRoundFilter]);

  // Preboarding & Handoff state
  const [suggestedEmployeeId, setSuggestedEmployeeId] = useState("");
  const [handoff, setHandoff] = useState({
    firstName: applicant.firstName ?? "",
    lastName: applicant.lastName ?? "",
    email: applicant.email ?? "",
    employeeId: "",
    autoCompletePreboarding: true,
  });
  const [preboardingCaseId, setPreboardingCaseId] = useState("");
  const [preboardingTasks, setPreboardingTasks] = useState<
    Array<{ code: string; title: string; status: "Pending" | "InProgress" | "Completed" | "Skipped" }>
  >([
    { code: "candidate-details", title: "Candidate details verified", status: "Completed" },
    { code: "documents", title: "Mandatory documents collected", status: "Completed" },
    { code: "verification", title: "Background & reference verification", status: "Completed" },
  ]);

  // Onboarding state
  const [onboarding, setOnboarding] = useState<RecruitmentOnboardingCase>();
  const [handoffCompleted, setHandoffCompleted] = useState(false);

  // Utility modals state
  const [privacy, setPrivacy] = useState({
    action: "Grant" as RecruitmentCandidatePrivacyCommand["action"],
    retentionDays: "" as number | "",
    reason: "",
  });
  const [talentPool, setTalentPool] = useState({
    poolName: "Future Hires Pool",
    tags: "",
    notes: "",
    status: "Active" as RecruitmentTalentPoolCommand["status"],
  });
  const [merge, setMerge] = useState({ targetApplicantId: "", reason: "" });
  const [resumeReview, setResumeReview] = useState({
    decision: "Pending" as RecruitmentResumeExtractionReviewCommand["decision"],
    fieldsText: "skills: React, TypeScript, C#\nexperience: 2 years\neducation: B.Tech",
    notes: "",
  });

  const stage = applicant.activityType as ApplicationStatus;

  // Effective Workflow & Governance (Vacancy Override -> Enterprise Config -> System Fallback)
  const allowCustomWorkflows = enterpriseConfig?.allowJobWorkflowCustomization ?? true;
  const effectiveRequireInterview =
    allowCustomWorkflows && vacancyData?.requireInterview !== undefined && vacancyData?.requireInterview !== null
      ? vacancyData.requireInterview
      : allowCustomWorkflows && vacancyData?.workflowMode === "Direct"
      ? false
      : allowCustomWorkflows && (vacancyData?.workflowMode === "Enterprise" || vacancyData?.workflowMode === "Standard")
      ? true
      : (enterpriseConfig?.requireInterviewBeforeDecision ?? false) && (enterpriseConfig?.recruitmentMode !== "Simple");

  const effectiveRequirePreboarding =
    allowCustomWorkflows && vacancyData?.requirePreboarding !== undefined && vacancyData?.requirePreboarding !== null
      ? vacancyData.requirePreboarding
      : allowCustomWorkflows && vacancyData?.workflowMode === "Direct"
      ? false
      : allowCustomWorkflows && vacancyData?.workflowMode === "Enterprise"
      ? true
      : (enterpriseConfig?.requirePreboardingBeforeHandoff ?? false) && (enterpriseConfig?.recruitmentMode !== "Simple");

  const workflowMode = (allowCustomWorkflows ? vacancyData?.workflowMode : null) ?? (enterpriseConfig?.recruitmentMode === "Simple" ? "Direct" : enterpriseConfig?.recruitmentMode === "Enterprise" ? "Enterprise" : "Standard");
  const workflowLabel = (allowCustomWorkflows && vacancyData?.workflowMode === "Direct")
    ? "Fast-Track / Direct Hire"
    : (allowCustomWorkflows && vacancyData?.workflowMode === "Enterprise")
    ? "Enterprise Governance"
    : (allowCustomWorkflows && vacancyData?.workflowMode === "Standard")
    ? "Standard"
    : enterpriseConfig?.recruitmentMode
    ? `${enterpriseConfig.recruitmentMode} (Company Default)`
    : "Standard";
  const workflowColor: "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" =
    workflowMode === "Direct" ? "success" : workflowMode === "Enterprise" ? "warning" : "default";

  const primarySteps = useMemo(() => [
    { id: "screening" as Mode, label: "Screening", helper: "Candidate Review" },
    { id: "interview" as Mode, label: "Interview", helper: effectiveRequireInterview ? "Schedule & Score" : "Optional / Fast-Track" },
    { id: "offer" as Mode, label: "Offer & Response", helper: "Terms & Acceptance" },
    { id: "handoff" as Mode, label: "Preboarding & Hire", helper: effectiveRequirePreboarding ? "Convert to Employee" : "1-Click Hire" },
  ], [effectiveRequireInterview, effectiveRequirePreboarding]);

  // Stepper calculations
  const completedStep =
    stage === ApplicationStatus.Selected || offer.status === "Accepted"
      ? 2
      : stage === ApplicationStatus.Shortlisted || stage === ApplicationStatus.OnHold
      ? 1
      : stage === ApplicationStatus.InProgress
      ? 0
      : -1;

  const activeStep = Math.max(0, primarySteps.findIndex((item) => item.id === mode));

  const isActionEnabled = (id: Mode) => {
    if (id === "handoff") return stage === ApplicationStatus.Selected || offer.status === "Accepted";
    if (id === "offer") return true;
    if (id === "screening") return stage !== ApplicationStatus.Rejected;
    return true;
  };

  useEffect(() => {
    setHandoff((current) => ({
      ...current,
      firstName: applicant.firstName ?? "",
      lastName: applicant.lastName ?? "",
      email: applicant.email ?? "",
      employeeId: current.employeeId || (applicant.applicantId ? `EMP-${applicant.applicantId.slice(0, 4).toUpperCase()}` : ""),
    }));
  }, [applicant.firstName, applicant.lastName, applicant.email, applicant.applicantId]);

  // Load offer versions and counters
  const loadOfferVersionsAndCounters = async (offerId: string) => {
    if (!offerId?.trim()) return;
    try {
      const [verRes, cntRes] = await Promise.all([
        getRecruitmentOfferVersions(offerId.trim()).catch(() => null),
        getRecruitmentOfferCounters(offerId.trim()).catch(() => null),
      ]);
      if (verRes?.data?.success && verRes.data.methodResult) {
        setOfferVersions(verRes.data.methodResult);
      }
      if (cntRes?.data?.success && cntRes.data.methodResult) {
        setCounterRequests(cntRes.data.methodResult);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    if (!open) return;
    if (applicant.isHired) setMode("handoff");
    else if (stage === ApplicationStatus.New || stage === ApplicationStatus.InProgress) setMode("screening");
    else if (stage === ApplicationStatus.Shortlisted || stage === ApplicationStatus.OnHold) setMode("interview");
    else if (stage === ApplicationStatus.Selected) setMode("offer");
    else if (stage === ApplicationStatus.Rejected) setMode("interview");

    void getAllDepartments(true)
      .then(({ data }) => setDepartments(((data as any).methodResults ?? (data as any).methodResult ?? []) as DepartmentModel[]))
      .catch(() => setDepartments([]));

    void getAllEmployees({ name: "", pageNo: 1, records: 500, departmentId: [], gender: [], employmentStatus: "Active" })
      .then(({ data }) => setInterviewers(((data as any).methodResults ?? []) as any[]))
      .catch(() => setInterviewers([]));

    if (applicant.applicantId) {
      void getRecruitmentInterviewRounds(applicant.applicantId, applicant.vacancyId).then(({ data }) => {
        if (data.success && data.methodResult) {
          const rows = data.methodResult;
          setInterviewRounds(rows);
          if (rows.length > 0) {
            const latest = rows[rows.length - 1] || rows[0];
            if (latest) {
              setInterview((current) => ({
                ...current,
                title: latest.title ?? current.title,
                roundNumber: latest.roundNumber ?? current.roundNumber,
                roundType: latest.roundType ?? current.roundType,
                startsAtUtc: latest.startsAtUtc ? dayjs(latest.startsAtUtc).format("YYYY-MM-DDTHH:mm") : current.startsAtUtc,
                endsAtUtc: latest.endsAtUtc ? dayjs(latest.endsAtUtc).format("YYYY-MM-DDTHH:mm") : current.endsAtUtc,
                location: latest.location || current.location,
                meetingUrl: latest.meetingUrl || current.meetingUrl,
                panelistUserIds: (latest.panelistUserIds ?? []).join(", "),
              }));
              setScorecard((current) => ({
                ...current,
                interviewId: latest.interviewId ?? current.interviewId,
                roundNumber: latest.roundNumber ?? current.roundNumber,
              }));
            }
          } else {
            setIsSchedulingRoundOpen(true);
          }
        }
      }).catch(() => undefined);

      void getRecruitmentScorecards(applicant.applicantId, applicant.vacancyId).then(({ data }) => {
        if (data.success && data.methodResult) setSavedScorecards(data.methodResult);
      }).catch(() => undefined);

      void getFinalInterviewScore(applicant.applicantId).then(({ data }) => {
        if (data.success && data.methodResult) setAuthoritativeScore(data.methodResult);
      }).catch(() => undefined);
    }

    if (applicant.vacancyId) {
      void getRecruitmentInterviewPlan(applicant.vacancyId).then(({ data }) => {
        if (data.success && data.methodResult) setInterviewPlan(data.methodResult);
      }).catch(() => undefined);

      // Directly load applicant's latest active offer
      void getRecruitmentOfferByApplicant(applicant.applicantId).then(({ data }) => {
        const loadedOffer = data.methodResult;
        if (data.success && loadedOffer) {
          const loadedOfferId = loadedOffer.offerId || "";
          setOffer({
            offerId: loadedOfferId,
            salary: loadedOffer.salary ? String(loadedOffer.salary) : "",
            currency: loadedOffer.currency || "INR",
            startDateUtc: loadedOffer.startDateUtc ? dayjs(loadedOffer.startDateUtc).format("YYYY-MM-DD") : "",
            expiresAtUtc: loadedOffer.expiresAtUtc ? dayjs(loadedOffer.expiresAtUtc).format("YYYY-MM-DDTHH:mm") : "",
            approvalReference: loadedOffer.approvalReference || "",
            compensationComponents: Object.fromEntries(
              Object.entries(loadedOffer.compensationComponents ?? {}).map(([k, v]) => [k, String(v)])
            ),
            status: (loadedOffer.status as RecruitmentOfferCommand["status"]) || "Draft",
          });
          const loadedCompEntries = Object.entries(loadedOffer.compensationComponents ?? {});
          if (loadedCompEntries.length > 0) {
            setCompensationItems(
              loadedCompEntries.map(([k, v], idx) => ({
                id: `comp-${idx}-${Date.now()}`,
                name: k,
                value: String(v),
              }))
            );
          }
          setRevisionForm((current) => ({
            ...current,
            salary: loadedOffer.salary ? String(loadedOffer.salary) : "",
            currency: loadedOffer.currency || "INR",
          }));
          if (loadedOfferId) {
            void loadOfferVersionsAndCounters(loadedOfferId);
          }
        }
      }).catch(() => undefined);

      void getRecruitmentPreboardingQueue().then(({ data }) => {
        const match = (data.methodResult ?? []).find((item) => item.applicantId === applicant.applicantId);
        if (match?.caseId) setPreboardingCaseId(match.caseId);
      }).catch(() => undefined);
    }
  }, [open, stage, applicant.applicantId, applicant.vacancyId]);

  useEffect(() => {
    if (!open || !applicant.applicantId) return;

    void getRecruitmentResumeExtractionReview(applicant.applicantId, applicant.vacancyId).then(({ data }) => {
      const review = data.methodResult;
      if (data.success && review) {
        let fieldsString = "";
        if (review.extractedFields && typeof review.extractedFields === "object" && !Array.isArray(review.extractedFields)) {
          fieldsString = Object.entries(review.extractedFields)
            .filter(([k]) => isNaN(Number(k)))
            .map(([k, v]) => `${k}: ${v}`)
            .join("\n");
        } else if (typeof review.extractedFields === "string") {
          fieldsString = review.extractedFields;
        }

        setResumeReview((current) => ({
          ...current,
          decision: review.decision,
          notes: review.notes ?? "",
          fieldsText: fieldsString || current.fieldsText,
        }));
      }
    }).catch(() => undefined);

    void getRecruitmentEnterpriseConfig().then(({ data }) => {
      if (data.success && data.methodResult) {
        const cfg = data.methodResult;
        setEnterpriseConfig(cfg);
        if (cfg.compensationCurrency && !offer.offerId) {
          setOffer((current) => ({ ...current, currency: cfg.compensationCurrency! }));
          setRevisionForm((current) => ({ ...current, currency: cfg.compensationCurrency! }));
        }
        if (cfg.screeningCriteria?.length) {
          setScreening((current) => ({
            ...current,
            criteria: cfg.screeningCriteria!.map((name) => ({ name, passed: true, notes: "" })),
            score: current.score > 0 ? current.score : 100,
          }));
        }
        if (cfg.preboardingChecklist?.length) {
          setPreboardingTasks(cfg.preboardingChecklist.map((code) => ({ code, title: code.replace(/-/g, " "), status: "Completed" })));
        }
      }
    }).catch(() => undefined);

    if (applicant.vacancyId) {
      void getJobVacancyDetails(applicant.vacancyId)
        .then(({ data }) => {
          if (data?.success && data?.methodResult) {
            const vac = data.methodResult;
            setVacancyData(vac);
            if (vac.screeningCriteria && vac.screeningCriteria.length > 0) {
              setScreening((current) => ({
                ...current,
                criteria: vac.screeningCriteria!.map((name) => ({ name, passed: true, notes: "" })),
                score: 100,
              }));
            }
          }
        })
        .catch(() => undefined);
    }

    void getNextEmployeeId().then(({ data }) => {
      const nextId = (data as { methodResult?: string; message?: string })?.methodResult || data?.message;
      if (data?.success && nextId) {
        const cleanId = String(nextId);
        setSuggestedEmployeeId(cleanId);
        setHandoff((current) => ({
          ...current,
          employeeId: current.employeeId ? current.employeeId : cleanId,
        }));
      }
    }).catch(() => undefined);

    void getRecruitmentOnboarding(applicant.applicantId).then(({ data }) => {
      if (data.success && data.methodResult) setOnboarding(data.methodResult);
    }).catch(() => setOnboarding(undefined));
  }, [open, applicant.applicantId, applicant.vacancyId]);

  const saveResponse = (response: { data: { success: boolean; message?: string; errorCode?: string | null } }) => {
    if (!response.data.success) {
      const api = getApiMessage(response);
      throw Object.assign(new Error(api.text), { code: api.code });
    }
  };

  const offerAllowancesTotal = useMemo(() => {
    return compensationItems.reduce((total, item) => total + (Number(item.value) || 0), 0);
  }, [compensationItems]);

  const baseAnnualSalary = Number(offer.salary || 0);
  const offerComponentTotal = baseAnnualSalary + offerAllowancesTotal;
  const estimatedMonthlyGross = Math.round(offerComponentTotal / 12);

  const duplicateComponentNames = useMemo(() => {
    const names = compensationItems
      .map((i) => i.name.trim().toLowerCase())
      .filter((n) => n.length > 0);
    return names.length !== new Set(names).size;
  }, [compensationItems]);

  const hasEmptyComponentNameWithAmount = useMemo(() => {
    return compensationItems.some((i) => !i.name.trim() && i.value.trim() !== "" && Number(i.value) > 0);
  }, [compensationItems]);

  const hasNegativeComponentValue = useMemo(() => {
    return compensationItems.some((i) => i.value.trim() !== "" && Number(i.value) < 0);
  }, [compensationItems]);

  const offerValidation =
    offer.startDateUtc && new Date(offer.startDateUtc).getTime() < new Date(new Date().toDateString()).getTime()
      ? "Offer start date cannot be in the past."
      : !offer.salary || !Number.isFinite(Number(offer.salary)) || Number(offer.salary) <= 0
      ? "Enter an annual base salary greater than zero."
      : !/^[A-Z]{3}$/.test(offer.currency.trim().toUpperCase())
      ? "Currency must be a 3-letter code such as INR or USD."
      : offer.startDateUtc && offer.expiresAtUtc && new Date(offer.expiresAtUtc).getTime() > new Date(offer.startDateUtc).getTime()
      ? "Offer expiry deadline must be on or before the joining start date."
      : duplicateComponentNames
      ? "Compensation component names must be unique."
      : hasEmptyComponentNameWithAmount
      ? "Please specify a name for all compensation components that have an amount."
      : hasNegativeComponentValue
      ? "Compensation component amounts cannot be negative."
      : compensationItems.length > 30
      ? "Maximum 30 compensation components allowed."
      : null;

  const interviewValidation = !interview.title.trim()
    ? "Interview title is required."
    : !interview.startsAtUtc || !interview.endsAtUtc
    ? "Select both start and end times."
    : new Date(interview.startsAtUtc).getTime() <= Date.now()
    ? "Start time must be in the future."
    : new Date(interview.endsAtUtc).getTime() <= new Date(interview.startsAtUtc).getTime()
    ? "End time must be after the start time."
    : !interview.panelistUserIds.trim()
    ? "Select at least one interviewer."
    : null;

  // Active candidate counter request (if any)
  const pendingCounter = useMemo(() => {
    return counterRequests.find((c) => c.status === "Pending") || counterRequests[0] || null;
  }, [counterRequests]);

  // Handle sending offer to candidate
  const handleSendOffer = async (targetStatus: "Sent" | "Draft" = "Sent") => {
    if (offerValidation) {
      setFeedback({ severity: "error", text: offerValidation });
      return;
    }
    setBusy(true);
    setFeedback(undefined);
    try {
      const salary = Number(offer.salary);
      const compensationPayload = Object.fromEntries(
        compensationItems
          .filter((item) => item.name.trim() !== "" && item.value.trim() !== "")
          .map((item) => [item.name.trim(), Number(item.value)])
      );
      const offerResponse = await upsertRecruitmentOffer({
        offerId: offer.offerId.trim() || undefined,
        applicantId: applicant.applicantId,
        vacancyId: applicant.vacancyId,
        salary,
        currency: offer.currency.trim().toUpperCase(),
        startDateUtc: offer.startDateUtc ? new Date(offer.startDateUtc).toISOString() : null,
        compensationComponents: compensationPayload,
        approvalReference: offer.approvalReference.trim() || null,
        expiresAtUtc: offer.expiresAtUtc ? new Date(offer.expiresAtUtc).toISOString() : null,
        status: targetStatus,
        idempotencyKey: createIdempotencyKey(),
      });
      saveResponse(offerResponse);
      const returnedOfferId = (offerResponse.data as any).methodResult || offer.offerId;
      setOffer((prev) => ({
        ...prev,
        offerId: returnedOfferId,
        status: targetStatus,
        compensationComponents: Object.fromEntries(
          compensationItems.map((item) => [item.name.trim(), item.value])
        ),
      }));
      if (targetStatus === "Sent") {
        setFeedback({ severity: "success", text: "Formal offer letter dispatched directly to candidate via email." });
      } else {
        setFeedback({ severity: "success", text: "Offer saved as Draft." });
      }
      onSaved?.();
    } catch (err) {
      setFeedback({ severity: "error", text: (err as Error).message || "Failed to save offer." });
    } finally {
      setBusy(false);
    }
  };

  // Handle recruiter marking offer accepted offline
  const handleMarkOfferAcceptedOffline = async () => {
    setBusy(true);
    setFeedback(undefined);
    try {
      const salary = Number(offer.salary);
      const compensationPayload = Object.fromEntries(
        compensationItems
          .filter((item) => item.name.trim() !== "" && item.value.trim() !== "")
          .map((item) => [item.name.trim(), Number(item.value)])
      );
      const offerResponse = await upsertRecruitmentOffer({
        offerId: offer.offerId.trim() || undefined,
        applicantId: applicant.applicantId,
        vacancyId: applicant.vacancyId,
        salary,
        currency: offer.currency.trim().toUpperCase(),
        startDateUtc: offer.startDateUtc ? new Date(offer.startDateUtc).toISOString() : null,
        compensationComponents: compensationPayload,
        approvalReference: offer.approvalReference.trim() || null,
        expiresAtUtc: offer.expiresAtUtc ? new Date(offer.expiresAtUtc).toISOString() : null,
        status: "Accepted",
        idempotencyKey: createIdempotencyKey(),
      });
      saveResponse(offerResponse);
      setOffer((prev) => ({
        ...prev,
        status: "Accepted",
        compensationComponents: Object.fromEntries(
          compensationItems.map((item) => [item.name.trim(), item.value])
        ),
      }));
      setFeedback({ severity: "success", text: "Offer marked as Accepted! Candidate is now Selected and ready for Preboarding." });
      onSaved?.();
    } catch (err) {
      setFeedback({ severity: "error", text: (err as Error).message || "Failed to update offer." });
    } finally {
      setBusy(false);
    }
  };

  // Handle accepting candidate counter-offer
  const handleDecideCounter = async (counterId: string, counterDecision: "Approved" | "Rejected") => {
    setBusy(true);
    setFeedback(undefined);
    try {
      const targetCounter = counterRequests.find((c) => c.counterRequestId === counterId);
      const payload: RecruitmentOfferCounterDecisionCommand = {
        counterRequestId: counterId,
        decision: counterDecision,
        resolutionNote: counterDecision === "Approved" ? "Counter-offer accepted by HR." : "Counter-offer declined.",
        approvedSalary: counterDecision === "Approved" ? targetCounter?.requestedSalary : undefined,
        approvedCurrency: counterDecision === "Approved" ? targetCounter?.requestedCurrency : undefined,
        approvedStartDateUtc: counterDecision === "Approved" ? targetCounter?.requestedStartDateUtc : undefined,
        idempotencyKey: createIdempotencyKey(),
        expectedBaseVersionNumber: targetCounter?.baseVersionNumber,
      };

      const res = await decideRecruitmentOfferCounter(payload);
      saveResponse(res);
      setFeedback({
        severity: "success",
        text: counterDecision === "Approved" ? "Candidate counter-offer approved! New offer version created." : "Candidate counter-offer declined.",
      });

      if (offer.offerId) {
        await loadOfferVersionsAndCounters(offer.offerId);
      }
      onSaved?.();
    } catch (err) {
      setFeedback({ severity: "error", text: (err as Error).message || "Failed to process counter-offer." });
    } finally {
      setBusy(false);
    }
  };

  // Handle creating revised offer
  const handleCreateOfferRevision = async () => {
    if (!offer.offerId) {
      setFeedback({ severity: "error", text: "Save the primary offer before creating a revision." });
      return;
    }
    const salary = Number(revisionForm.salary);
    if (!salary || salary <= 0) {
      setFeedback({ severity: "error", text: "Please enter a valid revised salary greater than zero." });
      return;
    }

    setBusy(true);
    setFeedback(undefined);
    try {
      const payload: RecruitmentOfferVersionCommand = {
        offerId: offer.offerId,
        salary,
        currency: revisionForm.currency.trim().toUpperCase(),
        status: "PendingApproval",
        versionReason: revisionForm.reason.trim() || "Offer revised during negotiation",
        startDateUtc: offer.startDateUtc ? new Date(offer.startDateUtc).toISOString() : null,
        expiresAtUtc: offer.expiresAtUtc ? new Date(offer.expiresAtUtc).toISOString() : null,
        idempotencyKey: createIdempotencyKey(),
      };

      const res = await createRecruitmentOfferVersion(payload);
      saveResponse(res);
      setFeedback({ severity: "success", text: "Offer revision created successfully!" });
      await loadOfferVersionsAndCounters(offer.offerId);
      setIsRevisionMode(false);
      onSaved?.();
    } catch (err) {
      setFeedback({ severity: "error", text: (err as Error).message || "Unable to create offer revision." });
    } finally {
      setBusy(false);
    }
  };

  // Main lifecycle submission
  const submit = async () => {
    let successMessage = "Saved successfully.";
    setBusy(true);
    setFeedback(undefined);
    try {
      if (mode === "screening") {
        const score = Number.isFinite(Number(screening.score)) && Number(screening.score) > 0
          ? Number(screening.score)
          : currentScreeningScore;
        if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error("Enter a screening score from 0 to 100.");
        if (screening.decision === "Reject" && !screening.rejectionReason.trim()) throw new Error("A rejection reason is required.");
        saveResponse(
          await upsertRecruitmentScreening({
            applicantId: applicant.applicantId,
            vacancyId: applicant.vacancyId,
            reviewerUserId,
            score,
            decision: screening.decision,
            rejectionReason: screening.rejectionReason.trim() || null,
            evidence: screening.evidence.trim() || null,
            criteria: screening.criteria,
            idempotencyKey: createIdempotencyKey(),
          })
        );
        const nextStage =
          screening.decision === "Pass" ? "Shortlisted" : screening.decision === "Hold" ? "OnHold" : screening.decision === "Reject" ? "Rejected" : null;
        if (nextStage) {
          await upsertRecruitmentApplicationStage({
            applicantId: applicant.applicantId,
            vacancyId: applicant.vacancyId,
            stage: nextStage,
            reason: screening.rejectionReason.trim() || screening.evidence.trim() || null,
            idempotencyKey: createIdempotencyKey(),
          });
        }
        if (screening.decision === "Pass" && !effectiveRequireInterview) {
          await upsertRecruitmentHiringDecision({
            applicantId: applicant.applicantId,
            vacancyId: applicant.vacancyId,
            decision: "Approve",
            notes: "Direct hire fast-track approval after screening pass",
            idempotencyKey: createIdempotencyKey(),
          }).catch(() => undefined);
          successMessage = "Screening passed! Candidate fast-tracked directly to Offer.";
          setMode("offer");
        } else {
          successMessage = "Screening review recorded. Candidate moved to next pipeline stage.";
          setMode("interview");
        }
      } else if (mode === "interview") {
        if (interviewSubTab === 0) {
          if (isSchedulingRoundOpen) {
            if (!interview.startsAtUtc || !interview.endsAtUtc) throw new Error("Start and end time are required.");
            if (!interview.panelistUserIds.trim()) throw new Error("Select at least one interviewer.");
            if (new Date(interview.startsAtUtc).getTime() <= Date.now()) throw new Error("Interview must start in the future.");
            saveResponse(
              await upsertRecruitmentInterview({
                interviewId: editingRoundId || undefined,
                applicantId: applicant.applicantId,
                vacancyId: applicant.vacancyId,
                title: interview.title.trim() || `Round ${interview.roundNumber} Interview`,
                roundNumber: interview.roundNumber,
                roundType: interview.roundType.trim() || null,
                startsAtUtc: new Date(interview.startsAtUtc).toISOString(),
                endsAtUtc: new Date(interview.endsAtUtc).toISOString(),
                location: interview.location.trim() || null,
                meetingUrl: interview.meetingUrl.trim() || null,
                panelistUserIds: interview.panelistUserIds.split(",").map((id) => id.trim()).filter(Boolean),
                idempotencyKey: createIdempotencyKey(),
                status: "Scheduled",
              } as RecruitmentInterviewCommand)
            );
            successMessage = `Round ${interview.roundNumber} scheduled successfully! Video meeting details & candidate briefing dispatched.`;
            setIsSchedulingRoundOpen(false);
            setEditingRoundId(null);
            const roundsRes = await getRecruitmentInterviewRounds(applicant.applicantId, applicant.vacancyId);
            if (roundsRes.data.success && roundsRes.data.methodResult) {
              setInterviewRounds(roundsRes.data.methodResult);
            }
          } else {
            setInterviewSubTab(1);
            return;
          }
        } else {
          // Submit decision and scorecard
          if ((decision.decision === "Reject" || decision.decision === "Hold") && !decision.notes.trim()) {
            throw new Error(`A reason / note is required when marking an application as ${decision.decision}.`);
          }
          saveResponse(
            await upsertRecruitmentHiringDecision({
              applicantId: applicant.applicantId,
              vacancyId: applicant.vacancyId,
              decision: decision.decision,
              notes: decision.notes.trim() || (decision.decision === "Approve" ? "Approved by hiring team" : "Decision recorded"),
              idempotencyKey: createIdempotencyKey(),
            })
          );
          successMessage = `Hiring decision recorded. Candidate is now ${decision.decision === "Approve" ? "Selected (Ready for Offer)" : decision.decision}.`;
          if (decision.decision === "Approve") {
            setMode("offer");
          }
        }
      } else if (mode === "offer") {
        await handleSendOffer("Sent");
        return;
      } else if (mode === "handoff") {
        const resolvedEmpId = handoff.employeeId.trim() || suggestedEmployeeId.trim();
        if (!resolvedEmpId) throw new Error("Employee ID could not be resolved. Please provide an Employee ID.");
        if (preboardingCaseId) {
          await updateRecruitmentPreboarding({
            caseId: preboardingCaseId,
            status: preboardingTasks.every((t) => t.status === "Completed" || t.status === "Skipped") ? "ReadyForHire" : "InProgress",
            tasks: preboardingTasks.map((t) => ({ code: t.code, status: t.status })),
            idempotencyKey: createIdempotencyKey(),
          }).catch(() => undefined);
        }
        saveResponse(
          await handoffCandidateToPreboarding({
            applicantId: applicant.applicantId,
            idempotencyKey: createIdempotencyKey(),
            firstName: handoff.firstName.trim(),
            lastName: handoff.lastName.trim(),
            email: handoff.email.trim(),
            employeeId: resolvedEmpId,
            autoCompletePreboarding: handoff.autoCompletePreboarding,
          } as CandidateHandoffRequest)
        );
        successMessage = `Candidate handoff complete! Employee ${resolvedEmpId} has been created.`;
        setHandoff((h) => ({ ...h, employeeId: resolvedEmpId }));
        setHandoffCompleted(true);
      }
      setFeedback({ severity: "success", text: successMessage });
      onSaved?.();
    } catch (error) {
      setFeedback({ severity: "error", text: (error as Error).message || "An error occurred." });
    } finally {
      setBusy(false);
    }
  };

  const handleSaveScorecard = async () => {
    setSubmittingScorecard(true);
    setFeedback(undefined);
    try {
      if (!scorecard.criteria || scorecard.criteria.length === 0) {
        throw new Error("At least one evaluation criterion is required.");
      }
      const minR = interviewPlan?.ratingScale?.minRating ?? 1;
      const maxR = interviewPlan?.ratingScale?.maxRating ?? 5;
      for (const c of scorecard.criteria) {
        if (!c.name.trim()) throw new Error("All criteria must have a name.");
        if (c.rating < minR || c.rating > maxR) throw new Error(`Ratings must be between ${minR} and ${maxR}.`);
      }
      const targetReviewer = scorecard.reviewerUserId || reviewerUserId;
      if (!targetReviewer) throw new Error("Please select an evaluator/reviewer.");

      const activeInterview =
        interviewRounds.find((r) => r.roundNumber === (scorecard.roundNumber || 1)) || interviewRounds[0];

      const res = await upsertRecruitmentScorecard({
        applicantId: applicant.applicantId,
        vacancyId: applicant.vacancyId,
        interviewId: scorecard.interviewId || activeInterview?.interviewId || undefined,
        roundNumber: scorecard.roundNumber || 1,
        reviewerUserId: targetReviewer,
        recommendation: scorecard.recommendation,
        criteria: scorecard.criteria.map((c: any) => ({
          code: c.code,
          name: c.name.trim(),
          rating: Number(c.rating) || minR,
          qualitativeLabel: c.qualitativeLabel,
          weight: c.weight,
          isMandatory: c.isMandatory,
          notes: c.notes?.trim() || undefined,
        })),
        status: scorecard.status || "Submitted",
        idempotencyKey: createIdempotencyKey(),
      });
      saveResponse(res);
      setFeedback({ severity: "success", text: "Scorecard submitted successfully." });
      setIsEditingScorecard(false);

      // Refresh scorecards list & authoritative benchmark
      void getRecruitmentScorecards(applicant.applicantId, applicant.vacancyId).then(({ data }) => {
        if (data.success && data.methodResult) setSavedScorecards(data.methodResult);
      });
      void getFinalInterviewScore(applicant.applicantId).then(({ data }) => {
        if (data.success && data.methodResult) setAuthoritativeScore(data.methodResult);
      });
    } catch (err) {
      setFeedback({ severity: "error", text: (err as Error).message });
    } finally {
      setSubmittingScorecard(false);
    }
  };

  const getEmployeeName = (emp: any) => {
    if (!emp) return "";
    if (typeof emp === "string") return emp;
    if (emp.fullName && emp.fullName.trim()) return emp.fullName.trim();
    const combined = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
    if (combined) return combined;
    if (emp.name && emp.name.trim()) return emp.name.trim();
    return emp.email || emp.employeeId || emp.userId || "Employee";
  };

  const selectedInterviewerIds = useMemo(() => {
    return interview.panelistUserIds
      .split(",")
      .map((id) => id.trim())
      .filter(Boolean);
  }, [interview.panelistUserIds]);

  const selectedInterviewerObjs = useMemo(() => {
    return selectedInterviewerIds.map((id) => {
      const found = interviewers.find((e) => e.userId === id);
      return found || { userId: id, fullName: id, email: "" };
    });
  }, [selectedInterviewerIds, interviewers]);

  const quorumNeeded = Math.max(1, Math.floor((selectedInterviewerIds.length + 1) / 2));

  // Screening threshold logic: active when role specifies or non-Simple company has active auto-pass gate
  const isJobSpecificThreshold = Boolean(
    vacancyData?.screeningPassScore &&
    vacancyData.screeningPassScore > 0 &&
    vacancyData?.workflowMode !== "Direct"
  );
  const isCompanyThresholdActive = Boolean(
    enterpriseConfig &&
    enterpriseConfig.recruitmentMode !== "Simple" &&
    enterpriseConfig.autoAdvanceOnScreening &&
    (enterpriseConfig.screeningPassScore ?? 0) > 0 &&
    vacancyData?.workflowMode !== "Direct"
  );
  const isScreeningThresholdActive = isJobSpecificThreshold || isCompanyThresholdActive;
  const passThreshold = isJobSpecificThreshold
    ? vacancyData!.screeningPassScore!
    : isCompanyThresholdActive
    ? (enterpriseConfig?.screeningPassScore ?? 60)
    : 0;

  const finalInterviewEvaluation = useMemo(() => {
    if (authoritativeScore && authoritativeScore.totalScorecardsCount > 0) {
      return {
        score: authoritativeScore.finalInterviewScore,
        rating: authoritativeScore.finalInterviewRating,
        consensus: authoritativeScore.finalInterviewRecommendation,
        evaluatedRoundsCount: authoritativeScore.evaluatedRoundsCount,
        evaluatedRounds: authoritativeScore.evaluatedRoundNumbers,
        totalScorecards: authoritativeScore.totalScorecardsCount,
        excludesHr: authoritativeScore.excludesHrRound,
        passedMandatoryGates: authoritativeScore.passedMandatoryGates ?? true,
        mandatoryGateFailures: authoritativeScore.mandatoryGateFailures ?? [],
        targetScore: authoritativeScore.targetScore ?? 70,
        meetsHiringTarget: authoritativeScore.meetsHiringTarget ?? true,
        scaleType: authoritativeScore.scaleType ?? "Numeric1To5",
      };
    }

    if (!savedScorecards || savedScorecards.length === 0) return null;
    const validCards = savedScorecards.filter(
      (c) => (c.status === "Submitted" || c.status === "Locked") && Array.isArray(c.criteria) && c.criteria.length > 0
    );
    if (validCards.length === 0) return null;

    const isHrCard = (card: any) => {
      const interview = interviewRounds.find(
        (r) => (card.interviewId && r.interviewId === card.interviewId) || r.roundNumber === card.roundNumber
      );
      if (!interview) return false;
      const title = (interview.title || "").toLowerCase();
      const type = (interview.roundType || "").toLowerCase();
      return type === "hr" || /\b(hr|human\s+resources?|salary|negotiation|offer\s+discussion|compensation)\b/i.test(title);
    };

    const nonHrCards = validCards.filter((c) => !isHrCard(c));
    const targetCards = nonHrCards.length > 0 ? nonHrCards : validCards;
    const excludesHr = validCards.length > nonHrCards.length && nonHrCards.length > 0;

    const allCriteria = targetCards.flatMap((c) => c.criteria || []).filter((cr: any) => cr.rating >= 1 && cr.rating <= 5);
    if (!allCriteria || allCriteria.length === 0) return null;

    const avgRating = allCriteria.reduce((sum: number, c: any) => sum + Number(c.rating || 0), 0) / allCriteria.length;
    const scorePct = Math.round((avgRating / 5) * 100);
    const ratingNum = Math.round(avgRating * 100) / 100;

    let strongHire = 0, hire = 0, noHire = 0, hold = 0;
    targetCards.forEach((c) => {
      const rec = (c.recommendation || "").toLowerCase();
      const isReject = rec.includes("no") || rec.includes("reject");
      if (rec.includes("strong") && !isReject) strongHire++;
      else if (isReject) noHire++;
      else if (rec.includes("hire")) hire++;
      else if (rec.includes("hold")) hold++;
    });

    let consensus = "Hire";
    if (noHire > 0 && noHire >= hire + strongHire) consensus = "No Hire";
    else if (strongHire > 0 && strongHire >= hire) consensus = "Strong Hire";
    else if (hire > 0) consensus = "Hire";
    else if (hold > 0) consensus = "Hold";

    const evaluatedRounds = Array.from(new Set(targetCards.map((c) => c.roundNumber || 1))).sort();

    return {
      score: scorePct,
      rating: ratingNum,
      consensus,
      evaluatedRoundsCount: evaluatedRounds.length,
      evaluatedRounds,
      totalScorecards: targetCards.length,
      excludesHr,
      passedMandatoryGates: true,
      mandatoryGateFailures: [] as string[],
      targetScore: 70,
      meetsHiringTarget: scorePct >= 70,
      scaleType: "Numeric1To5",
    };
  }, [authoritativeScore, savedScorecards, interviewRounds]);

  const passedCriteriaCount = screening.criteria.filter((c) => c.passed).length;
  const calculatedCriteriaScore =
    screening.criteria.length > 0 ? Math.round((passedCriteriaCount / screening.criteria.length) * 100) : 0;

  // Real-time screening score: fallback to calculated criteria score if 0 with passed criteria
  const currentScreeningScore =
    Number(screening.score) === 0 && passedCriteriaCount > 0
      ? calculatedCriteriaScore
      : (Number(screening.score) || 0);

  const meetsScreeningThreshold = !isScreeningThresholdActive || currentScreeningScore >= passThreshold;

  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } };
  const initials = ((applicant.firstName?.[0] ?? "") + (applicant.lastName?.[0] ?? "")).toUpperCase() || "CA";
  const showSplitResumePane = showResumePreview && Boolean(applicant.resumeUrl);

  return (
    <>
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        aria-labelledby="recruitment-lifecycle-title"
        PaperProps={{
          sx: {
            width: {
              xs: "100vw",
              sm: 660,
              md: showSplitResumePane ? 1180 : 780,
              lg: showSplitResumePane ? 1320 : 860,
              xl: showSplitResumePane ? 1440 : 920,
            },
            maxWidth: "100vw",
            height: "100dvh",
            p: { xs: 2, sm: 2.5 },
            overflow: "hidden",
            transition: "width 220ms ease",
          },
        }}
      >
        <Stack spacing={{ xs: 1.5, sm: 2 }} sx={{ height: "100%", minWidth: 0 }}>
          {/* Header Bar */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            justifyContent="space-between"
            sx={{
              flex: "0 0 auto",
              p: 1.5,
              borderRadius: 2.5,
              border: "1px solid",
              borderColor: "divider",
              bgcolor: "background.default",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
              <Avatar sx={{ width: 42, height: 42, fontWeight: 800, bgcolor: "primary.main", color: "primary.contrastText" }}>
                {initials}
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography id="recruitment-lifecycle-title" variant="subtitle1" fontWeight={850} noWrap>
                  {applicant.firstName} {applicant.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                  {applicant.vacancyName || "Applicant"} · {applicant.email}
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
              {applicant.resumeUrl && (
                <Tooltip title={showResumePreview ? "Hide Resume" : "View Resume"}>
                  <IconButton
                    size="small"
                    onClick={() => setShowResumePreview((v) => !v)}
                    sx={{
                      borderRadius: 1.75,
                      border: "1px solid",
                      borderColor: "divider",
                      bgcolor: showResumePreview ? "primary.main" : "background.paper",
                      color: showResumePreview ? "primary.contrastText" : "text.primary",
                    }}
                  >
                    {showResumePreview ? <Close fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </Tooltip>
              )}

              <StyleStatus
                label={applicationStatusMapper[stage]}
                className={clsx({
                  info: stage === ApplicationStatus.New,
                  warning: [ApplicationStatus.InProgress, ApplicationStatus.OnHold, ApplicationStatus.Shortlisted].includes(stage),
                  success: stage === ApplicationStatus.Selected,
                  danger: stage === ApplicationStatus.Rejected,
                })}
              />

              <Tooltip title="More Recruitment Actions">
                <IconButton
                  size="small"
                  onClick={(e) => setMoreToolsAnchorEl(e.currentTarget)}
                  sx={{
                    borderRadius: 1.75,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <MoreVert fontSize="small" />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={moreToolsAnchorEl}
                open={Boolean(moreToolsAnchorEl)}
                onClose={() => setMoreToolsAnchorEl(null)}
                PaperProps={{ sx: { minWidth: 220, borderRadius: 2, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" } }}
              >
                <MenuItem
                  onClick={() => {
                    setActiveUtilityTool("resume");
                    setMoreToolsAnchorEl(null);
                  }}
                >
                  <DocumentScannerOutlined sx={{ mr: 1.5, fontSize: 18, color: "text.secondary" }} />
                  Resume Extraction Review
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setActiveUtilityTool("talentpool");
                    setMoreToolsAnchorEl(null);
                  }}
                >
                  <FolderSpecialOutlined sx={{ mr: 1.5, fontSize: 18, color: "text.secondary" }} />
                  Add to Talent Pool
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setActiveUtilityTool("privacy");
                    setMoreToolsAnchorEl(null);
                  }}
                >
                  <ShieldOutlined sx={{ mr: 1.5, fontSize: 18, color: "text.secondary" }} />
                  Candidate Privacy / GDPR
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setActiveUtilityTool("merge");
                    setMoreToolsAnchorEl(null);
                  }}
                >
                  <MergeTypeOutlined sx={{ mr: 1.5, fontSize: 18, color: "text.secondary" }} />
                  Merge Duplicate Applicant
                </MenuItem>
              </Menu>
            </Stack>
          </Stack>

          {/* Main Workspace Body */}
          <Box
            sx={{
              flex: "1 1 auto",
              minHeight: 0,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: showSplitResumePane ? "minmax(360px, 45%) minmax(0, 55%)" : "1fr",
              },
              gap: 2,
              overflow: "hidden",
            }}
          >
            {/* Desktop Side-by-Side CV Preview */}
            {showSplitResumePane && (
              <Stack
                spacing={1}
                sx={{
                  height: "100%",
                  minHeight: 0,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2.5,
                  bgcolor: "background.default",
                  p: 1.25,
                  overflow: "hidden",
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flex: "0 0 auto" }}>
                  <Typography variant="subtitle2" fontWeight={800}>
                    Candidate Resume
                  </Typography>
                  <CustomisedButton size="small" variant="outlined" label="Hide CV" handleClick={() => setShowResumePreview(false)} />
                </Stack>
                <Box
                  sx={{
                    flex: "1 1 auto",
                    minHeight: 0,
                    overflow: "auto",
                    borderRadius: 1.5,
                    bgcolor: "background.paper",
                  }}
                >
                  <PdfViewer pdfUrl={applicant.resumeUrl ?? ""} />
                </Box>
              </Stack>
            )}

            {/* Right Work Area */}
            <Stack spacing={{ xs: 1.25, sm: 1.5 }} sx={{ height: "100%", minHeight: 0, minWidth: 0, overflow: "hidden" }}>
              {/* Stepper Card */}
              <Box
                sx={{
                  flex: "0 0 auto",
                  p: { xs: 1.25, sm: 1.75 },
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2.5,
                  bgcolor: "action.hover",
                }}
              >
                <Stepper
                  activeStep={activeStep}
                  alternativeLabel
                  sx={{
                    "& .MuiStepLabel-label": { fontSize: { xs: ".7rem", sm: ".8rem" }, mt: 0.5, fontWeight: 700 },
                    "& .MuiStepConnector-line": { borderColor: "divider" },
                  }}
                >
                  {primarySteps.map((item, index) => {
                    const enabled = isActionEnabled(item.id) && (index <= completedStep + 1 || index === activeStep);
                    return (
                      <Step key={item.id} completed={index <= completedStep}>
                        <StepLabel
                          onClick={() => enabled && (setMode(item.id), setFeedback(undefined))}
                          sx={{ cursor: enabled ? "pointer" : "not-allowed" }}
                        >
                          {item.label}
                          <Typography component="span" variant="caption" sx={{ display: { xs: "none", sm: "block" }, color: "text.secondary" }}>
                            {item.helper}
                          </Typography>
                        </StepLabel>
                      </Step>
                    );
                  })}
                </Stepper>

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.25 }} flexWrap="wrap" gap={1}>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <Chip
                      size="small"
                      label={"Current Stage: " + (ApplicationStatus[stage] ?? "New")}
                      sx={{
                        fontWeight: 750,
                        fontSize: "0.75rem",
                        height: 24,
                        bgcolor:
                          stage === ApplicationStatus.Rejected
                            ? (t) => alpha(t.palette.error.main, 0.08)
                            : stage === ApplicationStatus.Selected
                            ? (t) => alpha(t.palette.success.main, 0.08)
                            : stage === ApplicationStatus.Shortlisted || stage === ApplicationStatus.OnHold
                            ? (t) => alpha(t.palette.warning.main, 0.08)
                            : (t) => alpha(t.palette.primary.main, 0.08),
                        color:
                          stage === ApplicationStatus.Rejected
                            ? "error.dark"
                            : stage === ApplicationStatus.Selected
                            ? "success.dark"
                            : stage === ApplicationStatus.Shortlisted || stage === ApplicationStatus.OnHold
                            ? "warning.dark"
                            : "primary.dark",
                        border: "1px solid",
                        borderColor:
                          stage === ApplicationStatus.Rejected
                            ? (t) => alpha(t.palette.error.main, 0.25)
                            : stage === ApplicationStatus.Selected
                            ? (t) => alpha(t.palette.success.main, 0.25)
                            : stage === ApplicationStatus.Shortlisted || stage === ApplicationStatus.OnHold
                            ? (t) => alpha(t.palette.warning.main, 0.25)
                            : (t) => alpha(t.palette.primary.main, 0.25),
                      }}
                    />
                    <Chip
                      size="small"
                      label={`Workflow: ${workflowLabel}`}
                      variant="outlined"
                      sx={{
                        fontWeight: 650,
                        fontSize: "0.72rem",
                        height: 24,
                        bgcolor: (t) => alpha(t.palette.action.hover, 0.5),
                        borderColor: "divider",
                        color: "text.secondary",
                      }}
                    />
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    Step {activeStep + 1} of {primarySteps.length}
                  </Typography>
                </Stack>
              </Box>

              <Divider />

              {/* Form Content Area */}
              <Box sx={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden", pr: { xs: 0.25, sm: 0.75 } }}>
                <Stack spacing={2} sx={{ minWidth: 0 }}>
                  {/* Concluded / Terminal State Banner */}
                  {stage === ApplicationStatus.Rejected && (
                    <Box
                      sx={{
                        p: 2.25,
                        borderRadius: 2.5,
                        border: "1.5px solid",
                        borderColor: "error.main",
                        bgcolor: alpha("#ef4444", 0.06),
                        boxShadow: "0 4px 16px rgba(239, 68, 68, 0.08)",
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <CancelOutlined sx={{ color: "error.main", fontSize: 28, mt: 0.25, flexShrink: 0 }} />
                        <Box sx={{ flex: 1 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                            <Typography variant="subtitle2" fontWeight={850} color="error.dark">
                              Application Concluded — Rejected
                            </Typography>
                            <Chip size="small" label="Application Closed" color="error" sx={{ fontWeight: 800 }} />
                          </Stack>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: "0.82rem" }}>
                            This candidate was marked as <strong>Rejected</strong>. Active interview scheduling, scorecard submissions, and offer letters are locked. Past scorecards, interview history, and notes remain preserved below for audit and compliance.
                          </Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                  {/* STEP 1: SCREENING */}
                  {mode === "screening" && (
                    <Stack spacing={2}>
                      {/* Pass Score Threshold & Policy Banner */}
                      {isScreeningThresholdActive ? (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: "1px solid",
                            borderColor: meetsScreeningThreshold ? "success.main" : "warning.main",
                            bgcolor: meetsScreeningThreshold ? "success.lighter" : "warning.lighter",
                          }}
                        >
                          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={800} color={meetsScreeningThreshold ? "success.dark" : "warning.dark"}>
                                Screening Evaluation Policy
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Pass Threshold: <strong>≥ {passThreshold}%</strong>{" "}
                                <Chip
                                  size="small"
                                  variant="outlined"
                                  color={isJobSpecificThreshold ? "primary" : "default"}
                                  label={isJobSpecificThreshold ? `From Job Description (${vacancyData?.title || "Role"})` : "Company Auto-Advance Policy"}
                                  sx={{ height: 20, fontSize: "0.68rem", ml: 0.5, fontWeight: 700 }}
                                />
                                {" "}| Current Score: <strong>{currentScreeningScore}%</strong>
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={meetsScreeningThreshold ? `Meets Threshold (≥ ${passThreshold}%)` : `Below Threshold (< ${passThreshold}%)`}
                              color={meetsScreeningThreshold ? "success" : "warning"}
                              sx={{ fontWeight: 800 }}
                            />
                          </Stack>

                          <Box sx={{ mt: 1.5 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" color="text.secondary">
                                Evaluation Score Meter
                              </Typography>
                              <Typography variant="caption" fontWeight={700} color={meetsScreeningThreshold ? "success.dark" : "warning.dark"}>
                                {currentScreeningScore} / 100
                              </Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, Math.max(0, currentScreeningScore))}
                              color={meetsScreeningThreshold ? "success" : "warning"}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>

                          {screening.criteria.length > 0 && (
                            <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                              <Button
                                size="small"
                                variant="text"
                                onClick={() => setScreening((curr) => ({ ...curr, score: calculatedCriteriaScore }))}
                                sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
                              >
                                Sync score from criteria ({passedCriteriaCount}/{screening.criteria.length} passed = {calculatedCriteriaScore}%)
                              </Button>
                            </Stack>
                          )}
                        </Box>
                      ) : (
                        <Box
                          sx={{
                            p: 2,
                            borderRadius: 2.5,
                            border: "1px solid",
                            borderColor: "divider",
                            bgcolor: "background.paper",
                          }}
                        >
                          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={800} color="text.primary">
                                Screening Evaluation (Flexible Review)
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {vacancyData?.workflowMode === "Direct"
                                  ? "Fast-track / direct hire workflow active — no minimum screening score cutoff required."
                                  : "Flexible review policy — no mandatory threshold cutoff enforced for this position."}
                              </Typography>
                            </Box>
                            <Chip
                              size="small"
                              label={vacancyData?.workflowMode === "Direct" ? "Direct Hire" : "Flexible Review"}
                              color="default"
                              variant="outlined"
                              sx={{ fontWeight: 700 }}
                            />
                          </Stack>

                          {screening.criteria.length > 0 && (
                            <Box sx={{ mt: 1.5 }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                                <Typography variant="caption" color="text.secondary">
                                  Evaluation Score Meter
                                </Typography>
                                <Typography variant="caption" fontWeight={700} color="text.primary">
                                  {currentScreeningScore} / 100
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={Math.min(100, Math.max(0, currentScreeningScore))}
                                color="primary"
                                sx={{ height: 8, borderRadius: 4 }}
                              />
                              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1 }}>
                                <Button
                                  size="small"
                                  variant="text"
                                  onClick={() => setScreening((curr) => ({ ...curr, score: calculatedCriteriaScore }))}
                                  sx={{ textTransform: "none", fontSize: "0.75rem", fontWeight: 700 }}
                                >
                                  Sync score from criteria ({passedCriteriaCount}/{screening.criteria.length} passed = {calculatedCriteriaScore}%)
                                </Button>
                              </Stack>
                            </Box>
                          )}
                        </Box>
                      )}

                      {/* Score Input & Outcome */}
                      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                        <AppTextField
                          sx={{ ...fieldSx, flex: 1 }}
                          label="Screening Score (0–100) *"
                          type="number"
                          value={screening.score > 0 ? screening.score : (currentScreeningScore > 0 ? currentScreeningScore : 0)}
                          onChange={(event) => setScreening({ ...screening, score: Number(event.target.value) })}
                          inputProps={{ min: 0, max: 100, step: 1 }}
                          helperText={
                            isScreeningThresholdActive
                              ? `Pass requires ≥ ${passThreshold}% (${isJobSpecificThreshold ? "Job-specific threshold" : "Company auto-advance policy"})`
                              : "Evaluation score (0–100). No mandatory pass threshold enforced."
                          }
                        />
                        <AppTextField
                          sx={{ ...fieldSx, flex: 1 }}
                          select
                          label="Screening Outcome *"
                          value={screening.decision}
                          onChange={(event) =>
                            setScreening({ ...screening, decision: event.target.value as RecruitmentScreeningReviewCommand["decision"] })
                          }
                        >
                          <MenuItem value="Pending">Pending</MenuItem>
                          <MenuItem value="Pass">Pass (Advance to Interview)</MenuItem>
                          <MenuItem value="Hold">Hold for Comparison</MenuItem>
                          <MenuItem value="Reject">Reject Application</MenuItem>
                        </AppTextField>
                      </Stack>

                      {/* Threshold warning alert if Pass is selected but score is insufficient */}
                      {isScreeningThresholdActive && screening.decision === "Pass" && !meetsScreeningThreshold && (
                        <Alert severity="warning" sx={{ borderRadius: 2 }}>
                          <strong>Score below pass threshold:</strong> Evaluation policy requires a score of at least <strong>{passThreshold}%</strong> ({isJobSpecificThreshold ? "configured in the Job Description" : "company enterprise default"}) to mark an applicant as <strong>Pass</strong>. Please increase the score or select <strong>Hold</strong> / <strong>Reject</strong>.
                        </Alert>
                      )}

                      {/* Screening Criteria Evaluation */}
                      <Box sx={{ mt: 1 }}>
                        <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1 }}>
                          Role Qualification Criteria ({passedCriteriaCount} of {screening.criteria.length} met)
                        </Typography>
                        <Stack spacing={1.25}>
                          {screening.criteria.map((criterion, index) => (
                            <Box key={`${criterion.name}-${index}`} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.paper" }}>
                              <Stack direction="row" alignItems="center" justifyContent="space-between">
                                <Box>
                                  <Typography fontWeight={700} variant="body2">
                                    {criterion.name}
                                  </Typography>
                                </Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip
                                    size="small"
                                    label={criterion.passed ? "Met" : "Not Met"}
                                    color={criterion.passed ? "success" : "default"}
                                    variant={criterion.passed ? "filled" : "outlined"}
                                    sx={{ fontWeight: 700, height: 22, fontSize: "0.7rem" }}
                                  />
                                  <AppSwitch
                                    checked={criterion.passed}
                                    onChange={(event) => {
                                      const checked = event.target.checked;
                                      setScreening((current) => {
                                        const updatedCriteria = current.criteria.map((item, itemIndex) =>
                                          itemIndex === index ? { ...item, passed: checked } : item
                                        );
                                        const passed = updatedCriteria.filter((c) => c.passed).length;
                                        const autoScore = updatedCriteria.length > 0 ? Math.round((passed / updatedCriteria.length) * 100) : 0;
                                        return {
                                          ...current,
                                          criteria: updatedCriteria,
                                          score: autoScore,
                                        };
                                      });
                                    }}
                                  />
                                </Stack>
                              </Stack>
                              <AppTextField
                                sx={{ ...fieldSx, mt: 1 }}
                                size="small"
                                placeholder="Add specific evaluator notes or evidence..."
                                value={criterion.notes ?? ""}
                                onChange={(event) =>
                                  setScreening((current) => ({
                                    ...current,
                                    criteria: current.criteria.map((item, itemIndex) =>
                                      itemIndex === index ? { ...item, notes: event.target.value } : item
                                    ),
                                  }))
                                }
                              />
                            </Box>
                          ))}
                        </Stack>
                      </Box>

                      <AppTextField
                        sx={fieldSx}
                        multiline
                        minRows={2}
                        label="Screening Evidence / Summary Notes"
                        placeholder="Summary of resume evaluation, key skills verified, and recruiter recommendations..."
                        value={screening.evidence}
                        onChange={(event) => setScreening({ ...screening, evidence: event.target.value })}
                      />

                      {screening.decision === "Reject" && (
                        <AppTextField
                          sx={fieldSx}
                          multiline
                          minRows={2}
                          label="Rejection Reason *"
                          placeholder="Provide regulatory / compliance reason for rejection..."
                          required
                          value={screening.rejectionReason}
                          onChange={(event) => setScreening({ ...screening, rejectionReason: event.target.value })}
                        />
                      )}
                    </Stack>
                  )}

                  {/* STEP 2: INTERVIEW & DECISION */}
                  {mode === "interview" && (
                    <Stack spacing={2.5}>
                      {/* Modern Segmented Control Switcher */}
                      <Box
                        sx={{
                          p: 0.5,
                          bgcolor: "action.hover",
                          borderRadius: 3,
                          border: "1px solid",
                          borderColor: "divider",
                          display: "flex",
                          gap: 0.75,
                        }}
                      >
                        <ButtonBase
                          onClick={() => setInterviewSubTab(0)}
                          sx={{
                            flex: 1,
                            py: 1.1,
                            px: { xs: 1.5, sm: 2.5 },
                            borderRadius: 2.5,
                            bgcolor: interviewSubTab === 0 ? "background.paper" : "transparent",
                            color: interviewSubTab === 0 ? "primary.main" : "text.secondary",
                            fontWeight: interviewSubTab === 0 ? 850 : 600,
                            fontSize: "0.835rem",
                            boxShadow: interviewSubTab === 0 ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                            transition: "all 0.18s ease-in-out",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.25,
                            "&:hover": {
                              color: "text.primary",
                              bgcolor: interviewSubTab === 0 ? "background.paper" : "action.selected",
                            },
                          }}
                        >
                          <Event sx={{ fontSize: 18 }} />
                          <span>1. Interview Rounds</span>
                          <Chip
                            size="small"
                            label={sortedRounds.length}
                            sx={{
                              height: 20,
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              borderRadius: 1.5,
                              bgcolor: interviewSubTab === 0 ? "primary.main" : (t) => alpha(t.palette.text.primary, 0.08),
                              color: interviewSubTab === 0 ? "primary.contrastText" : "text.secondary",
                            }}
                          />
                        </ButtonBase>

                        <ButtonBase
                          onClick={() => setInterviewSubTab(1)}
                          sx={{
                            flex: 1,
                            py: 1.1,
                            px: { xs: 1.5, sm: 2.5 },
                            borderRadius: 2.5,
                            bgcolor: interviewSubTab === 1 ? "background.paper" : "transparent",
                            color: interviewSubTab === 1 ? "primary.main" : "text.secondary",
                            fontWeight: interviewSubTab === 1 ? 850 : 600,
                            fontSize: "0.835rem",
                            boxShadow: interviewSubTab === 1 ? "0 2px 8px rgba(0,0,0,0.08)" : "none",
                            transition: "all 0.18s ease-in-out",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 1.25,
                            "&:hover": {
                              color: "text.primary",
                              bgcolor: interviewSubTab === 1 ? "background.paper" : "action.selected",
                            },
                          }}
                        >
                          <FactCheck sx={{ fontSize: 18 }} />
                          <span>2. Scorecard & Hiring Decision</span>
                          <Chip
                            size="small"
                            label={savedScorecards.length}
                            sx={{
                              height: 20,
                              fontSize: "0.72rem",
                              fontWeight: 800,
                              borderRadius: 1.5,
                              bgcolor: interviewSubTab === 1 ? "primary.main" : (t) => alpha(t.palette.text.primary, 0.08),
                              color: interviewSubTab === 1 ? "primary.contrastText" : "text.secondary",
                            }}
                          />
                        </ButtonBase>
                      </Box>

                      {/* SUB-TAB 0: INTERVIEW ROUNDS LIST & SCHEDULER */}
                      {interviewSubTab === 0 && (
                        <Stack spacing={2}>
                          {/* Header overview banner */}
                          <Box
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              bgcolor: "background.paper",
                              border: "1px solid",
                              borderColor: "divider",
                              boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                            }}
                          >
                            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
                              <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Typography variant="subtitle1" fontWeight={850}>
                                    Scheduled Interview Stages ({sortedRounds.length})
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={`${sortedRounds.length} ${sortedRounds.length === 1 ? "Round" : "Rounds"}`}
                                    variant="outlined"
                                    sx={{
                                      fontWeight: 750,
                                      height: 22,
                                      borderRadius: 1.5,
                                      bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
                                      color: "primary.main",
                                      borderColor: (t) => alpha(t.palette.primary.main, 0.25),
                                    }}
                                  />
                                </Stack>
                                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                                  Review interview schedules, join meeting links, track panel feedback, and advance stages.
                                </Typography>
                              </Box>
                              {!isSchedulingRoundOpen && (
                                <Button
                                  variant="contained"
                                  color="primary"
                                  size="small"
                                  startIcon={<Add sx={{ fontSize: 18 }} />}
                                  onClick={() => handleStartScheduleRound()}
                                  sx={{
                                    textTransform: "none",
                                    fontWeight: 750,
                                    borderRadius: 2,
                                    px: 2,
                                    py: 0.85,
                                    whiteSpace: "nowrap",
                                    boxShadow: "0 2px 8px rgba(37,99,235,0.2)",
                                    alignSelf: { xs: "stretch", sm: "auto" },
                                  }}
                                >
                                  Schedule Round {nextRoundNumber}
                                </Button>
                              )}
                            </Stack>
                          </Box>

                          {/* Render existing scheduled rounds cards */}
                          {sortedRounds.length > 0 && (
                            <Stack spacing={2}>
                              {sortedRounds.map((round) => {
                                const rPanelistIds: string[] = Array.isArray(round.panelistUserIds)
                                  ? round.panelistUserIds
                                  : typeof round.panelistUserIds === "string"
                                  ? round.panelistUserIds.split(",").map((s: string) => s.trim()).filter(Boolean)
                                  : [];
                                const roundScorecards = savedScorecards.filter(
                                  (sc) => Number(sc.roundNumber || 1) === Number(round.roundNumber || 1)
                                );
                                const quorum = round.quorumRequired > 0 ? round.quorumRequired : Math.max(1, Math.ceil((rPanelistIds.length || 1) / 2));
                                const isDebriefed = round.debriefStatus === "Complete";
                                const isQuorumMet = roundScorecards.length >= quorum;

                                return (
                                  <Box
                                    key={round.interviewId || round.roundNumber}
                                    sx={{
                                      p: { xs: 2, sm: 2.5 },
                                      borderRadius: 3,
                                      border: "1px solid",
                                      borderColor: isDebriefed ? "success.main" : "divider",
                                      bgcolor: "background.paper",
                                      boxShadow: isDebriefed
                                        ? "0 4px 16px rgba(16,185,129,0.06)"
                                        : "0 2px 10px rgba(0,0,0,0.03)",
                                      transition: "all 0.2s ease-in-out",
                                      "&:hover": {
                                        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
                                        borderColor: isDebriefed ? "success.main" : "primary.light",
                                      },
                                    }}
                                  >
                                    {/* Top Row: Badges, Title, Action Buttons */}
                                    <Stack
                                      direction={{ xs: "column", sm: "row" }}
                                      justifyContent="space-between"
                                      alignItems={{ sm: "center" }}
                                      spacing={1.5}
                                      sx={{ mb: 1.5 }}
                                    >
                                      <Box sx={{ minWidth: 0, flex: 1 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" sx={{ mb: 0.5 }}>
                                          <Chip
                                            label={`Round ${round.roundNumber}: ${round.roundType || "Interview"}`}
                                            color="primary"
                                            size="small"
                                            sx={{ fontWeight: 800, fontSize: "0.75rem", height: 24, borderRadius: 1.5 }}
                                          />
                                          <Chip
                                            label={isDebriefed ? `Debriefed (${round.debriefDecision || "Advance"})` : round.status || "Scheduled"}
                                            color={isDebriefed ? "success" : round.status === "Scheduled" ? "info" : "default"}
                                            size="small"
                                            variant={isDebriefed ? "filled" : "outlined"}
                                            sx={{ fontWeight: 750, fontSize: "0.72rem", height: 24, borderRadius: 1.5 }}
                                          />
                                        </Stack>
                                        <Typography variant="subtitle1" fontWeight={850} color="text.primary">
                                          {round.title || `Round ${round.roundNumber} Interview`}
                                        </Typography>
                                      </Box>

                                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                                        <Button
                                          size="small"
                                          variant="outlined"
                                          color="inherit"
                                          startIcon={<Edit sx={{ fontSize: 16 }} />}
                                          onClick={() => handleEditRound(round)}
                                          sx={{
                                            textTransform: "none",
                                            fontWeight: 700,
                                            fontSize: "0.78rem",
                                            borderRadius: 2,
                                            whiteSpace: "nowrap",
                                            px: 1.5,
                                            py: 0.6,
                                          }}
                                        >
                                          Edit Round
                                        </Button>
                                        <Button
                                          size="small"
                                          variant="contained"
                                          color="primary"
                                          endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                                          onClick={() => {
                                            setScorecard((sc) => ({
                                              ...sc,
                                              roundNumber: round.roundNumber || 1,
                                              interviewId: round.interviewId,
                                            }));
                                            setSelectedRoundFilter(round.roundNumber || 1);
                                            setInterviewSubTab(1);
                                          }}
                                          sx={{
                                            textTransform: "none",
                                            fontWeight: 800,
                                            fontSize: "0.78rem",
                                            borderRadius: 2,
                                            whiteSpace: "nowrap",
                                            px: 1.75,
                                            py: 0.6,
                                            boxShadow: "none",
                                          }}
                                        >
                                          Evaluate Round
                                        </Button>
                                      </Stack>
                                    </Stack>

                                    {/* Middle Row: Schedule Timing, Meeting Link & Location */}
                                    <Box
                                      sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        bgcolor: "action.hover",
                                        border: "1px solid",
                                        borderColor: "divider",
                                        mb: 1.75,
                                      }}
                                    >
                                      <Stack
                                        direction={{ xs: "column", md: "row" }}
                                        spacing={{ xs: 1, md: 2.5 }}
                                        alignItems={{ md: "center" }}
                                        flexWrap="wrap"
                                      >
                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Event sx={{ fontSize: 18, color: "primary.main" }} />
                                          <Typography variant="body2" fontWeight={650} color="text.primary">
                                            {round.startsAtUtc
                                              ? `${dayjs(round.startsAtUtc).format("ddd, D MMM YYYY • h:mm A")} UTC`
                                              : "Schedule date/time pending"}
                                          </Typography>
                                          {round.startsAtUtc && round.endsAtUtc && (
                                            <Chip
                                              size="small"
                                              variant="outlined"
                                              label={`${Math.max(1, Math.round(dayjs(round.endsAtUtc).diff(dayjs(round.startsAtUtc), "minute")))} mins`}
                                              sx={{
                                                height: 20,
                                                fontSize: "0.68rem",
                                                fontWeight: 750,
                                                bgcolor: (t) => alpha(t.palette.text.primary, 0.05),
                                                color: "text.primary",
                                                borderColor: "divider",
                                              }}
                                            />
                                          )}
                                        </Stack>

                                        {round.meetingUrl && (
                                          <Stack direction="row" spacing={1} alignItems="center">
                                            <Videocam sx={{ fontSize: 18, color: "success.main" }} />
                                            <Button
                                              size="small"
                                              variant="text"
                                              component="a"
                                              href={round.meetingUrl}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              endIcon={<OpenInNew sx={{ fontSize: 13 }} />}
                                              sx={{
                                                textTransform: "none",
                                                fontWeight: 750,
                                                fontSize: "0.8rem",
                                                p: 0,
                                                minWidth: 0,
                                                color: "primary.main",
                                                "&:hover": { textDecoration: "underline" },
                                              }}
                                            >
                                              Join Video Meeting
                                            </Button>
                                          </Stack>
                                        )}

                                        {round.location && (
                                          <Stack direction="row" spacing={0.75} alignItems="center">
                                            <LocationOn sx={{ fontSize: 18, color: "text.secondary" }} />
                                            <Typography variant="body2" color="text.secondary">
                                              {round.location}
                                            </Typography>
                                          </Stack>
                                        )}
                                      </Stack>
                                    </Box>

                                    {/* Panelists Section */}
                                    {rPanelistIds.length > 0 && (
                                      <Box sx={{ mb: 1.75 }}>
                                        <Typography variant="caption" color="text.secondary" fontWeight={750} sx={{ display: "block", mb: 0.75 }}>
                                          Assigned Panelists ({rPanelistIds.length}):
                                        </Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.75}>
                                          {rPanelistIds.map((pId) => {
                                            const pEmp = interviewers.find((e) => e.userId === pId);
                                            const pName = getEmployeeName(pEmp) || (pId === currentUserId ? `${reviewerDisplayName} (You)` : `Panelist (${pId.slice(0, 6)}...)`);
                                            return (
                                              <Chip
                                                key={pId}
                                                size="small"
                                                avatar={
                                                  <Avatar sx={{ width: 22, height: 22, fontSize: "0.7rem", fontWeight: 700, bgcolor: "primary.main", color: "primary.contrastText" }}>
                                                    {pName.charAt(0).toUpperCase()}
                                                  </Avatar>
                                                }
                                                label={pName}
                                                variant="outlined"
                                                sx={{
                                                  fontWeight: 650,
                                                  fontSize: "0.78rem",
                                                  height: 28,
                                                  bgcolor: "background.paper",
                                                  color: "text.primary",
                                                  borderColor: "divider",
                                                }}
                                              />
                                            );
                                          })}
                                        </Stack>
                                      </Box>
                                    )}

                                    <Divider sx={{ my: 1.5 }} />

                                    {/* Evaluation Progress & Debrief Section */}
                                    <Stack spacing={1.25}>
                                      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                          <Chip
                                            size="small"
                                            label={`${roundScorecards.length} / ${rPanelistIds.length || 1} Scorecards Recorded`}
                                            color={isQuorumMet ? "success" : "warning"}
                                            sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                                          />
                                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                            Quorum needed: {quorum} {quorum === 1 ? "vote" : "votes"}
                                          </Typography>
                                        </Stack>

                                        {isDebriefed && (
                                          <Chip
                                            size="small"
                                            variant="filled"
                                            color="success"
                                            label={`Debrief Decision: ${round.debriefDecision || "Advance"} ✓`}
                                            sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                                          />
                                        )}
                                      </Stack>

                                      {/* Debrief Callout Card when Quorum is reached */}
                                      {!isDebriefed && isQuorumMet && (
                                        <Box
                                          sx={{
                                            mt: 1,
                                            p: 1.75,
                                            borderRadius: 2.5,
                                            bgcolor: (t) => alpha(t.palette.success.main, 0.04),
                                            border: "1px solid",
                                            borderColor: (t) => alpha(t.palette.success.main, 0.25),
                                            boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                                          }}
                                        >
                                          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ md: "center" }} spacing={1.25}>
                                            <Box>
                                              <Stack direction="row" spacing={0.75} alignItems="center">
                                                <Typography variant="subtitle2" fontWeight={750} color="success.dark">
                                                  Debrief Quorum Reached for Round {round.roundNumber}
                                                </Typography>
                                                <Chip size="small" label="Ready to Advance" color="success" variant="outlined" sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }} />
                                              </Stack>
                                              <Typography variant="caption" color="text.secondary" display="block">
                                                Record hiring committee consensus to advance candidate or conclude evaluation.
                                              </Typography>
                                            </Box>
                                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                              <Button
                                                size="small"
                                                variant="contained"
                                                color="success"
                                                onClick={() => handleDebriefRound(round.interviewId, "Advance")}
                                                sx={{ textTransform: "none", fontWeight: 750, fontSize: "0.75rem", borderRadius: 1.75, px: 1.75, py: 0.6, whiteSpace: "nowrap" }}
                                              >
                                                Advance Candidate ✓
                                              </Button>
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                color="inherit"
                                                onClick={() => handleDebriefRound(round.interviewId, "Hold")}
                                                sx={{ textTransform: "none", fontWeight: 650, fontSize: "0.75rem", borderRadius: 1.75, px: 1.5, py: 0.6, whiteSpace: "nowrap", borderColor: "divider" }}
                                              >
                                                Hold
                                              </Button>
                                              <Button
                                                size="small"
                                                variant="outlined"
                                                color="inherit"
                                                onClick={() => handleDebriefRound(round.interviewId, "Reject")}
                                                sx={{ textTransform: "none", fontWeight: 650, fontSize: "0.75rem", borderRadius: 1.75, px: 1.5, py: 0.6, whiteSpace: "nowrap", borderColor: "divider" }}
                                              >
                                                Reject
                                              </Button>
                                            </Stack>
                                          </Stack>
                                        </Box>
                                      )}
                                    </Stack>
                                  </Box>
                                );
                              })}
                            </Stack>
                          )}

                          {/* Empty State when no rounds scheduled */}
                          {sortedRounds.length === 0 && !isSchedulingRoundOpen && (
                            <Box sx={{ p: 4, textAlign: "center", borderRadius: 3, bgcolor: "action.hover", border: "1.5px dashed", borderColor: "divider" }}>
                              <Event sx={{ fontSize: 48, color: "primary.main", mb: 1, opacity: 0.8 }} />
                              <Typography variant="subtitle1" fontWeight={850}>
                                No Interview Rounds Scheduled Yet
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ display: "block", mb: 2.5, maxWidth: 440, mx: "auto" }}>
                                Schedule Round 1 to send candidate invites, assign panelists, and generate calendar meeting links.
                              </Typography>
                              <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleStartScheduleRound(1)}
                                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, px: 3, py: 1 }}
                              >
                                Schedule Round 1
                              </Button>
                            </Box>
                          )}

                          {/* Schedule / Edit Form */}
                          {isSchedulingRoundOpen && (
                            <Box sx={{ p: 2.5, border: "1.5px solid", borderColor: "primary.main", borderRadius: 3, bgcolor: "background.paper", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
                              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                                <Typography variant="subtitle1" fontWeight={850} color="primary.main">
                                  {editingRoundId ? `Edit Interview Round ${interview.roundNumber}` : `Schedule Interview Round ${interview.roundNumber}`}
                                </Typography>
                                {sortedRounds.length > 0 && (
                                  <Button
                                    size="small"
                                    color="inherit"
                                    onClick={() => {
                                      setIsSchedulingRoundOpen(false);
                                      setEditingRoundId(null);
                                    }}
                                    sx={{ textTransform: "none", fontSize: "0.78rem" }}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </Stack>

                              <Stack spacing={2}>
                                <AppTextField
                                  sx={fieldSx}
                                  label="Interview Title *"
                                  value={interview.title}
                                  onChange={(event) => setInterview({ ...interview, title: event.target.value })}
                                />
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                  <AppTextField
                                    sx={{ ...fieldSx, flex: 1 }}
                                    type="number"
                                    label="Round Number"
                                    value={interview.roundNumber}
                                    onChange={(event) => setInterview({ ...interview, roundNumber: Number(event.target.value) })}
                                    inputProps={{ min: 1, max: 10 }}
                                  />
                                  <AppTextField
                                    sx={{ ...fieldSx, flex: 2 }}
                                    select
                                    label="Round Type"
                                    value={interview.roundType}
                                    onChange={(event) => setInterview({ ...interview, roundType: event.target.value })}
                                  >
                                    {["HR", "Technical", "Management", "Culture"].map((v) => (
                                      <MenuItem key={v} value={v}>
                                        {v}
                                      </MenuItem>
                                    ))}
                                  </AppTextField>
                                </Stack>

                                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                  <CustomisedDateTimePicker
                                    label="Start Time (UTC) *"
                                    value={interview.startsAtUtc ? dayjs(interview.startsAtUtc) : null}
                                    minDateTime={dayjs()}
                                    onChange={(val) => setInterview({ ...interview, startsAtUtc: val?.format("YYYY-MM-DDTHH:mm") ?? "" })}
                                    slotProps={{ textField: { fullWidth: true, sx: fieldSx, size: "small" } }}
                                  />

                                  <CustomisedDateTimePicker
                                    label="End Time (UTC) *"
                                    value={interview.endsAtUtc ? dayjs(interview.endsAtUtc) : null}
                                    minDateTime={dayjs()}
                                    onChange={(val) => setInterview({ ...interview, endsAtUtc: val?.format("YYYY-MM-DDTHH:mm") ?? "" })}
                                    slotProps={{ textField: { fullWidth: true, sx: fieldSx, size: "small" } }}
                                  />
                                </Stack>

                                <AppTextField
                                  sx={fieldSx}
                                  label="Video Meeting URL (Google Meet / Zoom / MS Teams)"
                                  placeholder="e.g. https://meet.google.com/abc-defg-hij"
                                  value={interview.meetingUrl}
                                  onChange={(event) => setInterview({ ...interview, meetingUrl: event.target.value })}
                                />

                                <AppTextField
                                  sx={fieldSx}
                                  label="Physical Location / Office (Optional for in-person)"
                                  placeholder="e.g. Conference Room 3B, HQ"
                                  value={interview.location}
                                  onChange={(event) => setInterview({ ...interview, location: event.target.value })}
                                />

                                <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2.5, bgcolor: "action.hover" }}>
                                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 1 }}>
                                    <Typography variant="subtitle2" fontWeight={800}>
                                      Select Panelists / Interviewers *
                                    </Typography>
                                    {selectedInterviewerIds.length > 0 && (
                                      <Chip
                                        size="small"
                                        label={`Debrief Quorum: ${quorumNeeded} of ${selectedInterviewerIds.length} votes required`}
                                        color="info"
                                        variant="outlined"
                                        sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                                      />
                                    )}
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
                                    Select team members to evaluate this candidate. By policy, debrief requires a majority quorum of scorecards.
                                  </Typography>

                                  <Autocomplete
                                    multiple
                                    size="small"
                                    options={interviewers}
                                    value={selectedInterviewerObjs}
                                    getOptionLabel={(option) => getEmployeeName(option)}
                                    isOptionEqualToValue={(option, val) => option.userId === val.userId}
                                    onChange={(_, newValues) => {
                                      setInterview({
                                        ...interview,
                                        panelistUserIds: newValues.map((v) => v.userId).join(", "),
                                      });
                                    }}
                                    renderInput={(params) => (
                                      <AppTextField
                                        {...params}
                                        sx={fieldSx}
                                        placeholder={selectedInterviewerObjs.length === 0 ? "Search by employee name, email or ID..." : "Add another interviewer..."}
                                      />
                                    )}
                                    renderOption={(props, option, { selected }) => (
                                      <li {...props} key={option.userId}>
                                        <Checkbox size="small" checked={selected} sx={{ mr: 1, p: 0.5 }} />
                                        <Avatar sx={{ width: 28, height: 28, mr: 1.5, fontSize: "0.75rem", bgcolor: "primary.main" }}>
                                          {getEmployeeName(option).charAt(0).toUpperCase()}
                                        </Avatar>
                                        <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                          <Typography variant="body2" fontWeight={600} noWrap>
                                            {getEmployeeName(option)} {option.employeeId ? `(${option.employeeId})` : ""}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block" }}>
                                            {option.email ?? ""} {option.jobRole?.roleName ? `• ${option.jobRole.roleName}` : option.department?.departmentName ? `• ${option.department.departmentName}` : ""}
                                          </Typography>
                                        </Box>
                                      </li>
                                    )}
                                    renderTags={(values, getTagProps) =>
                                      values.map((option, index) => (
                                        <Chip
                                          {...getTagProps({ index })}
                                          key={option.userId}
                                          avatar={<Avatar sx={{ width: 22, height: 22, fontSize: "0.7rem" }}>{getEmployeeName(option).charAt(0).toUpperCase()}</Avatar>}
                                          label={`${getEmployeeName(option)}${option.employeeId ? ` (${option.employeeId})` : ""}`}
                                          size="small"
                                          color="primary"
                                          variant="filled"
                                          sx={{ fontWeight: 600, m: 0.25 }}
                                        />
                                      ))
                                    }
                                  />
                                </Box>

                                <Stack direction="row" spacing={1.5} justifyContent="flex-end" sx={{ pt: 1 }}>
                                  {sortedRounds.length > 0 && (
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => {
                                        setIsSchedulingRoundOpen(false);
                                        setEditingRoundId(null);
                                      }}
                                      sx={{ textTransform: "none", borderRadius: 2, px: 2 }}
                                    >
                                      Cancel
                                    </Button>
                                  )}
                                  <Button
                                    variant="contained"
                                    size="small"
                                    onClick={submit}
                                    disabled={busy || Boolean(interviewValidation)}
                                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, px: 3, py: 0.85 }}
                                  >
                                    {busy ? "Saving..." : editingRoundId ? "Save Round Changes" : `Confirm & Schedule Round ${interview.roundNumber}`}
                                  </Button>
                                </Stack>
                              </Stack>
                            </Box>
                          )}
                        </Stack>
                      )}

                      {/* SUB-TAB 1: SCORECARDS & HIRING DECISION */}
                      {interviewSubTab === 1 && (
                        <Stack spacing={2}>
                          {/* Round Filter Tabs */}
                          {sortedRounds.length > 1 && (
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography variant="caption" fontWeight={750} color="text.secondary">
                                Filter by Round:
                              </Typography>
                              <Chip
                                size="small"
                                label={`All Rounds (${savedScorecards.length})`}
                                variant={selectedRoundFilter === "all" ? "filled" : "outlined"}
                                onClick={() => setSelectedRoundFilter("all")}
                                sx={{
                                  fontWeight: 700,
                                  fontSize: "0.74rem",
                                  cursor: "pointer",
                                  bgcolor: selectedRoundFilter === "all" ? (t) => alpha(t.palette.primary.main, 0.1) : "transparent",
                                  color: selectedRoundFilter === "all" ? "primary.dark" : "text.secondary",
                                  borderColor: selectedRoundFilter === "all" ? "primary.main" : "divider",
                                }}
                              />
                              {sortedRounds.map((r) => {
                                const rCount = savedScorecards.filter((sc) => Number(sc.roundNumber || 1) === Number(r.roundNumber || 1)).length;
                                const isSelected = selectedRoundFilter === r.roundNumber;
                                return (
                                  <Chip
                                    key={r.roundNumber}
                                    size="small"
                                    label={`Round ${r.roundNumber} (${rCount})`}
                                    variant={isSelected ? "filled" : "outlined"}
                                    onClick={() => setSelectedRoundFilter(r.roundNumber)}
                                    sx={{
                                      fontWeight: 700,
                                      fontSize: "0.74rem",
                                      cursor: "pointer",
                                      bgcolor: isSelected ? (t) => alpha(t.palette.primary.main, 0.1) : "transparent",
                                      color: isSelected ? "primary.dark" : "text.secondary",
                                      borderColor: isSelected ? "primary.main" : "divider",
                                    }}
                                  />
                                );
                              })}
                            </Stack>
                          )}

                          {/* Live Authoritative Interview Benchmark */}
                          {finalInterviewEvaluation && (
                            <Box
                              sx={{
                                p: 2,
                                borderRadius: 2.5,
                                border: "1px solid",
                                borderColor: "divider",
                                bgcolor: "background.paper",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                              }}
                            >
                              <Stack
                                direction={{ xs: "column", sm: "row" }}
                                justifyContent="space-between"
                                alignItems={{ xs: "flex-start", sm: "center" }}
                                spacing={1}
                              >
                                <Box>
                                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={750}
                                      color="text.primary"
                                    >
                                      Authoritative Interview Benchmark
                                    </Typography>
                                    <Chip
                                      size="small"
                                      variant="outlined"
                                      label={finalInterviewEvaluation.consensus}
                                      sx={{
                                        fontWeight: 750,
                                        fontSize: "0.72rem",
                                        height: 22,
                                        borderColor: finalInterviewEvaluation.consensus.includes("Hire") && !finalInterviewEvaluation.consensus.includes("No")
                                          ? (t) => alpha(t.palette.success.main, 0.4)
                                          : (t) => alpha(t.palette.warning.main, 0.4),
                                        bgcolor: finalInterviewEvaluation.consensus.includes("Hire") && !finalInterviewEvaluation.consensus.includes("No")
                                          ? (t) => alpha(t.palette.success.main, 0.08)
                                          : (t) => alpha(t.palette.warning.main, 0.08),
                                        color: finalInterviewEvaluation.consensus.includes("Hire") && !finalInterviewEvaluation.consensus.includes("No")
                                          ? "success.dark"
                                          : "warning.dark",
                                      }}
                                    />
                                  </Stack>
                                  <Typography variant="caption" color="text.secondary">
                                    Aggregated across {finalInterviewEvaluation.evaluatedRoundsCount} substantive technical round
                                    {finalInterviewEvaluation.evaluatedRoundsCount > 1 ? "s" : ""} (
                                    {finalInterviewEvaluation.totalScorecards} scorecard
                                    {finalInterviewEvaluation.totalScorecards > 1 ? "s" : ""})
                                    {finalInterviewEvaluation.excludesHr ? " • Excludes non-technical HR discussion" : ""}
                                  </Typography>
                                </Box>
                                <Chip
                                  size="medium"
                                  label={`${finalInterviewEvaluation.score}% (${finalInterviewEvaluation.rating} / 5.0 ⭐)`}
                                  sx={{
                                    fontWeight: 800,
                                    fontSize: "0.85rem",
                                    py: 0.5,
                                    bgcolor: finalInterviewEvaluation.score >= 75
                                      ? (t) => alpha(t.palette.success.main, 0.1)
                                      : finalInterviewEvaluation.score >= 60
                                      ? (t) => alpha(t.palette.warning.main, 0.1)
                                      : (t) => alpha(t.palette.error.main, 0.1),
                                    color: finalInterviewEvaluation.score >= 75
                                      ? "success.dark"
                                      : finalInterviewEvaluation.score >= 60
                                      ? "warning.dark"
                                      : "error.dark",
                                    border: "1px solid",
                                    borderColor: finalInterviewEvaluation.score >= 75
                                      ? (t) => alpha(t.palette.success.main, 0.3)
                                      : finalInterviewEvaluation.score >= 60
                                      ? (t) => alpha(t.palette.warning.main, 0.3)
                                      : (t) => alpha(t.palette.error.main, 0.3),
                                  }}
                                />
                              </Stack>

                              {finalInterviewEvaluation.passedMandatoryGates === false && (
                                <Alert severity="error" sx={{ mt: 1.5, py: 0.5, fontSize: "0.78rem" }}>
                                  <strong>Mandatory Evaluation Gate Failed:</strong> Candidate failed mandatory round or competency minimums. Final recommendation cannot be Hire.
                                  {Array.isArray(finalInterviewEvaluation.mandatoryGateFailures) && finalInterviewEvaluation.mandatoryGateFailures.length > 0 && (
                                    <Box component="ul" sx={{ m: "4px 0 0 0", pl: 2 }}>
                                      {finalInterviewEvaluation.mandatoryGateFailures.map((msg: string, mIdx: number) => (
                                        <li key={mIdx}>{msg}</li>
                                      ))}
                                    </Box>
                                  )}
                                </Alert>
                              )}
                            </Box>
                          )}

                          {/* Committee Consensus & Stage Disposition Gate */}
                          {stage !== ApplicationStatus.Rejected && (
                            <Box
                              sx={{
                                p: 2.25,
                                borderRadius: 2.5,
                                bgcolor: "background.paper",
                                border: "1px solid",
                                borderColor: "divider",
                                boxShadow: "0 1px 3px rgba(0,0,0,0.02)",
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1}>
                                <Box>
                                  <Typography
                                    variant="subtitle2"
                                    fontWeight={750}
                                    color="text.primary"
                                  >
                                    Hiring Committee Consensus & Stage Disposition
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {decision.decision === "Approve"
                                      ? "Approving candidate advances application to Selected and unlocks Step 3 (Offer Generation)."
                                      : decision.decision === "Hold"
                                      ? "Placing candidate on hold preserves interview history while reviewing remaining candidates."
                                      : "Rejecting candidate immediately concludes the hiring process and records disposition reason."}
                                  </Typography>
                                </Box>
                                <Chip
                                  size="small"
                                  label={`Action: ${decision.decision === "Approve" ? "Advance to Offer" : decision.decision === "Hold" ? "Place on Hold" : "Reject Application"}`}
                                  variant="outlined"
                                  sx={{
                                    fontWeight: 750,
                                    fontSize: "0.72rem",
                                    borderColor:
                                      decision.decision === "Reject"
                                        ? (t) => alpha(t.palette.error.main, 0.4)
                                        : decision.decision === "Hold"
                                        ? (t) => alpha(t.palette.warning.main, 0.4)
                                        : (t) => alpha(t.palette.primary.main, 0.4),
                                    bgcolor:
                                      decision.decision === "Reject"
                                        ? (t) => alpha(t.palette.error.main, 0.08)
                                        : decision.decision === "Hold"
                                        ? (t) => alpha(t.palette.warning.main, 0.08)
                                        : (t) => alpha(t.palette.primary.main, 0.08),
                                    color:
                                      decision.decision === "Reject"
                                        ? "error.dark"
                                        : decision.decision === "Hold"
                                        ? "warning.dark"
                                        : "primary.dark",
                                  }}
                                />
                              </Stack>

                              {/* Quick Preset Reason Chips */}
                              <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 2, bgcolor: (t) => alpha(t.palette.text.primary, 0.02), border: "1px solid", borderColor: "divider" }}>
                                <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                                  1-Click Preset Disposition Reasons:
                                </Typography>
                                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap gap={0.75}>
                                  {quickDispositionPresets.map((preset) => {
                                    const isSelected = decision.decision === preset.decision && decision.notes === preset.notes;
                                    return (
                                      <Chip
                                        key={preset.label}
                                        size="small"
                                        label={preset.label}
                                        variant={isSelected ? "filled" : "outlined"}
                                        onClick={() => setDecision({ decision: preset.decision, notes: preset.notes })}
                                        sx={{
                                          fontWeight: 650,
                                          fontSize: "0.72rem",
                                          cursor: "pointer",
                                          borderColor: isSelected ? "primary.main" : "divider",
                                          bgcolor: isSelected ? "primary.main" : (t) => alpha(t.palette.action.hover, 0.5),
                                          color: isSelected ? "primary.contrastText" : "text.secondary",
                                          transition: "all 0.15s ease-in-out",
                                          "&:hover": {
                                            borderColor: "primary.light",
                                            bgcolor: isSelected ? "primary.main" : (t) => alpha(t.palette.primary.main, 0.06),
                                            color: isSelected ? "primary.contrastText" : "primary.main",
                                          },
                                        }}
                                      />
                                    );
                                  })}
                                </Stack>
                              </Box>

                              <AppTextField
                                sx={{ ...fieldSx, mt: 1.5 }}
                                select
                                label="Hiring Committee Decision *"
                                value={decision.decision}
                                onChange={(e) => setDecision({ ...decision, decision: e.target.value as any })}
                              >
                                <MenuItem value="Approve">Approve (Advance to Offer)</MenuItem>
                                <MenuItem value="Hold">Hold for Comparison</MenuItem>
                                <MenuItem value="Reject">Reject Application</MenuItem>
                              </AppTextField>

                              <AppTextField
                                sx={{ ...fieldSx, mt: 1.5 }}
                                multiline
                                minRows={2}
                                label={decision.decision === "Approve" ? "Hiring Committee Notes" : "Hiring Committee Notes / Reason *"}
                                placeholder={
                                  decision.decision === "Reject"
                                    ? "Reason for rejection (e.g., candidate no-show, unresponsive, failed technical evaluation)..."
                                    : decision.decision === "Hold"
                                    ? "Reason for hold (e.g., evaluating other panel candidates, awaiting debrief)..."
                                    : "Summary of committee consensus, strengths, and conditions for hire..."
                                }
                                value={decision.notes}
                                onChange={(e) => setDecision({ ...decision, notes: e.target.value })}
                                helperText={
                                  decision.decision === "Reject"
                                    ? "💡 Tip: Click 'Candidate No-Show' above to auto-fill this field if the candidate did not attend."
                                    : undefined
                                }
                              />

                              <Stack direction="row" justifyContent="flex-end" sx={{ mt: 1.5 }}>
                                <Button
                                  variant="contained"
                                  size="small"
                                  color={
                                    decision.decision === "Reject"
                                      ? "error"
                                      : decision.decision === "Hold"
                                      ? "warning"
                                      : "primary"
                                  }
                                  onClick={submit}
                                  disabled={busy || ((decision.decision === "Reject" || decision.decision === "Hold") && !decision.notes.trim())}
                                  sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, px: 2.5 }}
                                >
                                  {busy
                                    ? "Saving..."
                                    : decision.decision === "Reject"
                                    ? "Confirm & Reject Application"
                                    : decision.decision === "Hold"
                                    ? "Confirm Hold"
                                    : "Approve & Advance to Offer"}
                                </Button>
                              </Stack>
                            </Box>
                          )}

                          {/* Saved / Submitted Scorecards Section */}
                          <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                              <Box>
                                <Typography variant="subtitle2" fontWeight={850}>
                                  Panelist Evaluation Scorecards
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Scores recorded in database ({displayedScorecards.length} {selectedRoundFilter === "all" ? "total" : `in Round ${selectedRoundFilter}`})
                                </Typography>
                              </Box>
                              {displayedScorecards.length > 0 && (
                                <Chip
                                  size="small"
                                  label={`${displayedScorecards.filter((c) => c.status === "Submitted" || c.status === "Locked").length} / ${quorumNeeded} Quorum ${
                                    displayedScorecards.filter((c) => c.status === "Submitted" || c.status === "Locked").length >= quorumNeeded
                                      ? "Met"
                                      : "Pending"
                                  }`}
                                  color={
                                    displayedScorecards.filter((c) => c.status === "Submitted" || c.status === "Locked").length >= quorumNeeded
                                      ? "success"
                                      : "warning"
                                  }
                                  sx={{ fontWeight: 800 }}
                                />
                              )}
                            </Stack>

                            {displayedScorecards.length === 0 ? (
                              <Alert severity="info" sx={{ borderRadius: 2 }}>
                                No scorecards recorded {selectedRoundFilter === "all" ? "yet for this candidate" : `for Round ${selectedRoundFilter}`}.
                              </Alert>
                            ) : (
                              <Stack spacing={1.5}>
                                {displayedScorecards.map((card, idx) => {
                                  const panelist = interviewers.find((e) => e.userId === card.reviewerUserId);
                                  const reviewerName = card.reviewerUserId === currentUserId ? `${reviewerDisplayName} (You)` : getEmployeeName(panelist) || card.reviewerUserId;
                                  const isHire = card.recommendation?.toLowerCase().includes("hire");
                                  const isReject = card.recommendation?.toLowerCase().includes("reject") || card.recommendation?.toLowerCase().includes("no hire");

                                  return (
                                    <Box
                                      key={card.scorecardId || idx}
                                      sx={{
                                        p: 1.5,
                                        borderRadius: 2,
                                        border: 1,
                                        borderColor: "divider",
                                        bgcolor: "action.hover",
                                      }}
                                    >
                                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Avatar sx={{ width: 26, height: 26, fontSize: "0.75rem", bgcolor: "primary.main" }}>
                                            {reviewerName.charAt(0).toUpperCase()}
                                          </Avatar>
                                          <Box>
                                            <Typography variant="body2" fontWeight={750}>
                                              {reviewerName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              Round {card.roundNumber ?? 1} • Status: {card.status}
                                            </Typography>
                                          </Box>
                                        </Stack>
                                        <Chip
                                          size="small"
                                          label={card.recommendation || "Evaluated"}
                                          color={isHire ? "success" : isReject ? "error" : "warning"}
                                          sx={{ fontWeight: 800 }}
                                        />
                                      </Stack>

                                      {/* Criteria list */}
                                      {Array.isArray(card.criteria) && card.criteria.length > 0 && (
                                        <Stack spacing={0.5} sx={{ mt: 1, pl: 0.5 }}>
                                          {card.criteria.map((c: any, cIdx: number) => (
                                            <Stack key={cIdx} direction="row" justifyContent="space-between" alignItems="center">
                                              <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                {c.name}:
                                              </Typography>
                                              <Stack direction="row" spacing={0.5} alignItems="center">
                                                <Rating size="small" readOnly value={Number(c.rating) || 0} max={5} />
                                                {c.notes && (
                                                  <Typography variant="caption" color="text.secondary" sx={{ ml: 1, fontStyle: "italic" }}>
                                                    "{c.notes}"
                                                  </Typography>
                                                )}
                                              </Stack>
                                            </Stack>
                                          ))}
                                        </Stack>
                                      )}

                                      {card.notes && (
                                        <Box sx={{ mt: 1, p: 1, borderRadius: 1.5, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                                            "{card.notes}"
                                          </Typography>
                                        </Box>
                                      )}
                                    </Box>
                                  );
                                })}
                              </Stack>
                            )}
                          </Box>

                          {/* Submit New / Edit Scorecard Form */}
                          {stage !== ApplicationStatus.Rejected && (
                            existingScorecardForRoundAndUser && !isEditingScorecard ? (
                              <Box sx={{ p: 2.5, borderRadius: 2.5, border: 1, borderColor: "success.main", bgcolor: "success.lighter" }}>
                                <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
                                  <Stack direction="row" spacing={1.25} alignItems="center">
                                    <CheckCircle color="success" sx={{ fontSize: 32 }} />
                                    <Box>
                                      <Typography variant="subtitle2" fontWeight={850} color="success.dark">
                                        Scorecard Recorded for Round {currentTargetRound}
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary">
                                        Evaluator: {currentTargetReviewer === currentUserId ? `${reviewerDisplayName} (You)` : getEmployeeName(interviewers.find((e) => e.userId === currentTargetReviewer)) || currentTargetReviewer} • Status: {existingScorecardForRoundAndUser.status || "Submitted"}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                  <Stack direction="row" spacing={1} alignItems="center">
                                    <Chip
                                      label={existingScorecardForRoundAndUser.recommendation || "Completed"}
                                      color={existingScorecardForRoundAndUser.recommendation?.toLowerCase().includes("hire") ? "success" : "default"}
                                      sx={{ fontWeight: 800 }}
                                    />
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<Edit fontSize="small" />}
                                      onClick={() => {
                                        if (Array.isArray(existingScorecardForRoundAndUser.criteria) && existingScorecardForRoundAndUser.criteria.length > 0) {
                                          setScorecard((sc) => ({
                                            ...sc,
                                            roundNumber: existingScorecardForRoundAndUser.roundNumber || currentTargetRound,
                                            recommendation: existingScorecardForRoundAndUser.recommendation || "Hire",
                                            notes: existingScorecardForRoundAndUser.notes || "",
                                            criteria: existingScorecardForRoundAndUser.criteria.map((cr: any, idx: number) => ({
                                              id: cr.id || `crit-drawer-edit-${idx}`,
                                              name: cr.name,
                                              rating: cr.rating,
                                              notes: cr.notes || "",
                                            })),
                                          }));
                                        } else {
                                          setScorecard((sc) => ({
                                            ...sc,
                                            roundNumber: existingScorecardForRoundAndUser.roundNumber || currentTargetRound,
                                            recommendation: existingScorecardForRoundAndUser.recommendation || "Hire",
                                            notes: existingScorecardForRoundAndUser.notes || "",
                                          }));
                                        }
                                        setIsEditingScorecard(true);
                                      }}
                                      sx={{ textTransform: "none", fontWeight: 750, borderRadius: 2 }}
                                    >
                                      Edit / Revise Scorecard
                                    </Button>
                                  </Stack>
                                </Stack>

                                {Array.isArray(existingScorecardForRoundAndUser.criteria) && existingScorecardForRoundAndUser.criteria.length > 0 && (
                                  <Stack spacing={0.75} sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                                    {existingScorecardForRoundAndUser.criteria.map((cr: any, cIdx: number) => (
                                      <Stack key={cIdx} direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="body2" fontWeight={600}>
                                          {cr.name}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                          <Rating size="small" readOnly value={Number(cr.rating) || 0} max={5} />
                                          <Typography variant="caption" fontWeight={750}>
                                            {cr.rating}/5
                                          </Typography>
                                        </Stack>
                                      </Stack>
                                    ))}
                                  </Stack>
                                )}

                                {existingScorecardForRoundAndUser.notes && (
                                  <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 1.5, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                      Recorded Feedback & Notes:
                                    </Typography>
                                    <Typography variant="body2" sx={{ mt: 0.25, fontStyle: "italic" }}>
                                      "{existingScorecardForRoundAndUser.notes}"
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                            ) : (
                              <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                                  <Typography variant="subtitle2" fontWeight={850}>
                                    {isEditingScorecard
                                      ? `Update Scorecard for Round ${currentTargetRound}`
                                      : `Record Panelist Scorecard for Round ${currentTargetRound}`}
                                  </Typography>
                                  {isEditingScorecard && (
                                    <Button
                                      size="small"
                                      color="inherit"
                                      onClick={() => setIsEditingScorecard(false)}
                                      sx={{ textTransform: "none", fontSize: "0.75rem" }}
                                    >
                                      Cancel Edit
                                    </Button>
                                  )}
                                </Stack>

                                <Stack spacing={1.75}>
                                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                                    <AppTextField
                                      sx={{ ...fieldSx, flex: 1 }}
                                      select
                                      label="Evaluating Round *"
                                      value={scorecard.roundNumber || 1}
                                      onChange={(e) => {
                                        const rNum = Number(e.target.value) || 1;
                                        const matchRound = sortedRounds.find((r) => Number(r.roundNumber) === rNum);
                                        setScorecard((sc) => ({
                                          ...sc,
                                          roundNumber: rNum,
                                          interviewId: matchRound?.interviewId || sc.interviewId,
                                        }));
                                        setIsEditingScorecard(false);
                                      }}
                                    >
                                      {sortedRounds.length > 0 ? (
                                        sortedRounds.map((r) => (
                                          <MenuItem key={r.roundNumber || r.interviewId} value={r.roundNumber || 1}>
                                            Round {r.roundNumber}: {r.roundType || r.title || "Interview"}
                                          </MenuItem>
                                        ))
                                      ) : (
                                        <MenuItem value={1}>Round 1</MenuItem>
                                      )}
                                    </AppTextField>

                                    <AppTextField
                                      sx={{ ...fieldSx, flex: 1.5 }}
                                      select
                                      label="Evaluator / Reviewer *"
                                      value={scorecard.reviewerUserId || reviewerUserId}
                                      onChange={(e) => {
                                        setScorecard({ ...scorecard, reviewerUserId: e.target.value });
                                        setIsEditingScorecard(false);
                                      }}
                                    >
                                      {selectedInterviewerObjs.length > 0 ? (
                                        selectedInterviewerObjs.map((emp) => (
                                          <MenuItem key={emp.userId} value={emp.userId}>
                                            {getEmployeeName(emp)} {emp.employeeId ? `(${emp.employeeId})` : ""}
                                          </MenuItem>
                                        ))
                                      ) : (
                                        <MenuItem value={reviewerUserId}>{reviewerDisplayName} (You)</MenuItem>
                                      )}
                                    </AppTextField>

                                    <AppTextField
                                      sx={{ ...fieldSx, flex: 1 }}
                                      select
                                      label="Recommendation *"
                                      value={scorecard.recommendation}
                                      onChange={(event) => setScorecard({ ...scorecard, recommendation: event.target.value })}
                                    >
                                      {["Strong Hire", "Hire", "Hold", "Reject"].map((item) => (
                                        <MenuItem key={item} value={item}>
                                          {item}
                                        </MenuItem>
                                      ))}
                                    </AppTextField>
                                  </Stack>

                                  {/* Interactive Criteria with Configurable Scales & Competencies */}
                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1 }}>
                                    <Typography variant="caption" fontWeight={750} color="text.secondary">
                                      Evaluation Criteria & Ratings ({interviewPlan?.ratingScale?.scaleType ? `Scale: ${interviewPlan.ratingScale.scaleType}` : "1–5 Stars"})
                                    </Typography>
                                    {interviewPlan?.competencies && interviewPlan.competencies.length > 0 && (
                                      <Button
                                        size="small"
                                        variant="text"
                                        onClick={() => {
                                          const defaultRating = interviewPlan.ratingScale?.scaleType === "Numeric0To100" ? 75
                                            : interviewPlan.ratingScale?.scaleType === "Numeric1To10" ? 7
                                            : 4;
                                          setScorecard((c) => ({
                                            ...c,
                                            criteria: interviewPlan.competencies!.map((comp, idx) => ({
                                              id: `crit-plan-${comp.code || idx}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                                              code: comp.code,
                                              name: comp.name,
                                              rating: defaultRating,
                                              notes: comp.description || "",
                                              weight: comp.weight,
                                              isMandatory: comp.isMandatory,
                                            })),
                                          }));
                                        }}
                                        sx={{ textTransform: "none", fontSize: "0.74rem", fontWeight: 700 }}
                                      >
                                        Import Plan Competencies ({interviewPlan.competencies.length})
                                      </Button>
                                    )}
                                  </Stack>
                                  {scorecard.criteria.length === 0 ? (
                                    <Alert
                                      severity="info"
                                      sx={{ borderRadius: 2 }}
                                      action={
                                        <Button
                                          color="inherit"
                                          size="small"
                                          onClick={() => {
                                            const defaultRating = interviewPlan?.ratingScale?.scaleType === "Numeric0To100" ? 75
                                              : interviewPlan?.ratingScale?.scaleType === "Numeric1To10" ? 7
                                              : 4;
                                            setScorecard((c) => ({
                                              ...c,
                                              criteria: [createNewScorecardCriterion("", defaultRating, "")],
                                            }));
                                          }}
                                        >
                                          Add Criterion
                                        </Button>
                                      }
                                    >
                                      No evaluation criteria configured. Click "Add Criterion" or "Import Plan Competencies" to define scorecard criteria.
                                    </Alert>
                                  ) : (
                                    <Stack spacing={1.25}>
                                      {scorecard.criteria.map((criterion, index) => {
                                        const critId = criterion.id || `crit-fallback-${index}`;
                                        return (
                                          <Box key={critId} sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover" }}>
                                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }} justifyContent="space-between">
                                              <AppTextField
                                                sx={{ ...fieldSx, flex: 1.5 }}
                                                size="small"
                                                label="Criterion Name *"
                                                value={criterion.name}
                                                onChange={(e) =>
                                                  setScorecard((c) => ({
                                                    ...c,
                                                    criteria: c.criteria.map((it, idx) =>
                                                      (it.id ? it.id === critId : idx === index) ? { ...it, name: e.target.value } : it
                                                    ),
                                                  }))
                                                }
                                              />
                                              <Stack direction="row" spacing={1} alignItems="center">
                                                <Typography variant="caption" fontWeight={700}>
                                                  Rating:
                                                </Typography>
                                                {interviewPlan?.ratingScale?.scaleType === "Numeric0To100" ? (
                                                  <AppTextField
                                                    size="small"
                                                    type="number"
                                                    value={criterion.rating ?? 75}
                                                    inputProps={{ min: 0, max: 100 }}
                                                    onChange={(e) =>
                                                      setScorecard((c) => ({
                                                        ...c,
                                                        criteria: c.criteria.map((it, idx) =>
                                                          (it.id ? it.id === critId : idx === index) ? { ...it, rating: Number(e.target.value) || 0 } : it
                                                        ),
                                                      }))
                                                    }
                                                    sx={{ width: 100 }}
                                                  />
                                                ) : interviewPlan?.ratingScale?.scaleType === "Numeric1To10" ? (
                                                  <Stack direction="row" spacing={0.75} alignItems="center">
                                                    <Typography variant="caption" fontWeight={700}>
                                                      {criterion.rating || 7}/10
                                                    </Typography>
                                                    <Rating
                                                      value={criterion.rating || 7}
                                                      max={10}
                                                      precision={0.5}
                                                      onChange={(_, val) =>
                                                        setScorecard((c) => ({
                                                          ...c,
                                                          criteria: c.criteria.map((it, idx) =>
                                                            (it.id ? it.id === critId : idx === index) ? { ...it, rating: val || 5 } : it
                                                          ),
                                                        }))
                                                      }
                                                    />
                                                  </Stack>
                                                ) : interviewPlan?.ratingScale?.scaleType === "Qualitative" && (interviewPlan.ratingScale.levels?.length ?? 0) > 0 ? (
                                                  <AppTextField
                                                    select
                                                    size="small"
                                                    value={criterion.rating || 3}
                                                    onChange={(e) =>
                                                      setScorecard((c) => ({
                                                        ...c,
                                                        criteria: c.criteria.map((it, idx) =>
                                                          (it.id ? it.id === critId : idx === index) ? { ...it, rating: Number(e.target.value) } : it
                                                        ),
                                                      }))
                                                    }
                                                    sx={{ minWidth: 150 }}
                                                  >
                                                    {interviewPlan.ratingScale.levels.map((lvl) => (
                                                      <MenuItem key={lvl.value} value={lvl.value}>
                                                        {lvl.label} ({lvl.value})
                                                      </MenuItem>
                                                    ))}
                                                  </AppTextField>
                                                ) : (
                                                  <Rating
                                                    value={criterion.rating || 4}
                                                    max={5}
                                                    precision={0.5}
                                                    onChange={(_, val) =>
                                                      setScorecard((c) => ({
                                                        ...c,
                                                        criteria: c.criteria.map((it, idx) =>
                                                          (it.id ? it.id === critId : idx === index) ? { ...it, rating: val || 3 } : it
                                                        ),
                                                      }))
                                                    }
                                                  />
                                                )}
                                                <Tooltip title="Delete criterion">
                                                  <IconButton
                                                    size="small"
                                                    color="error"
                                                    aria-label={`Delete ${criterion.name || "criterion"}`}
                                                    onClick={() =>
                                                      setScorecard((c) => ({
                                                        ...c,
                                                        criteria: c.criteria.filter((it, idx) => (it.id ? it.id !== critId : idx !== index)),
                                                      }))
                                                    }
                                                  >
                                                    <Delete fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                              </Stack>
                                            </Stack>
                                            <AppTextField
                                              sx={{ ...fieldSx, mt: 1 }}
                                              size="small"
                                              placeholder="Specific notes or evidence for this criterion..."
                                              value={criterion.notes ?? ""}
                                              onChange={(e) =>
                                                setScorecard((c) => ({
                                                  ...c,
                                                  criteria: c.criteria.map((it, idx) =>
                                                    (it.id ? it.id === critId : idx === index) ? { ...it, notes: e.target.value } : it
                                                  ),
                                                }))
                                              }
                                            />
                                          </Box>
                                        );
                                      })}
                                    </Stack>
                                  )}

                                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ pt: 0.5 }}>
                                    <Button
                                      size="small"
                                      startIcon={<Add />}
                                      onClick={() => {
                                        const defaultRating = interviewPlan?.ratingScale?.scaleType === "Numeric0To100" ? 75
                                          : interviewPlan?.ratingScale?.scaleType === "Numeric1To10" ? 7
                                          : 4;
                                        setScorecard((c) => ({
                                          ...c,
                                          criteria: [...c.criteria, createNewScorecardCriterion("", defaultRating, "")],
                                        }));
                                      }}
                                      sx={{ textTransform: "none", fontWeight: 700 }}
                                    >
                                      Add Criterion
                                    </Button>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={handleSaveScorecard}
                                      disabled={submittingScorecard}
                                      sx={{ textTransform: "none", fontWeight: 750, borderRadius: 2 }}
                                    >
                                      {submittingScorecard ? "Saving..." : isEditingScorecard ? "Update Scorecard" : "Submit Panelist Scorecard"}
                                    </Button>
                                  </Stack>
                                </Stack>
                              </Box>
                            )
                          )}
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {/* STEP 3: CLEAN, SIMPLE OFFER & ACCEPTANCE */}
                  {mode === "offer" && (
                    <Stack spacing={2}>
                      {/* 1. If Candidate ACCEPTED the offer */}
                      {offer.status === "Accepted" && (
                        <Box sx={{ p: 2.5, borderRadius: 3, bgcolor: "success.lighter", border: "1px solid", borderColor: "success.main" }}>
                          <Stack spacing={1.5} alignItems="center" textAlign="center">
                            <CheckCircleOutline sx={{ fontSize: 44, color: "success.main" }} />
                            <Box>
                              <Typography variant="h6" fontWeight={850} color="success.dark">
                                Candidate Accepted Offer!
                              </Typography>
                              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                {applicant.firstName} {applicant.lastName} accepted the employment offer of{" "}
                                <strong>
                                  {offer.currency} {Number(offer.salary || 0).toLocaleString()}
                                </strong>
                                . The applicant stage has been advanced to <strong>Selected</strong>.
                              </Typography>
                            </Box>
                            <Button
                              variant="contained"
                              color="success"
                              size="large"
                              endIcon={<ArrowForward />}
                              onClick={() => setMode("handoff")}
                              sx={{ mt: 1, textTransform: "none", fontWeight: 800, px: 3, py: 1.25, borderRadius: 2.5 }}
                            >
                              Proceed to Employee Handoff →
                            </Button>
                          </Stack>
                        </Box>
                      )}

                      {/* 2. If Candidate requested changes (Counter) */}
                      {offer.status === "ChangeRequested" && pendingCounter && (
                        <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: "warning.lighter", border: "1px solid", borderColor: "warning.main" }}>
                          <Stack spacing={1.5}>
                            <Typography variant="subtitle2" fontWeight={800} color="warning.dark">
                              Candidate Requested Compensation Changes (Round {pendingCounter.negotiationRound})
                            </Typography>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ p: 1.5, bgcolor: "background.paper", borderRadius: 2 }}>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="text.secondary">CURRENT OFFER</Typography>
                                <Typography variant="h6" fontWeight={750}>{offer.currency} {Number(offer.salary || 0).toLocaleString()}</Typography>
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <Typography variant="caption" color="warning.dark" fontWeight={700}>CANDIDATE REQUESTED</Typography>
                                <Typography variant="h6" fontWeight={850} color="warning.dark">
                                  {pendingCounter.requestedCurrency} {pendingCounter.requestedSalary.toLocaleString()}
                                </Typography>
                              </Box>
                            </Stack>
                            {pendingCounter.message && (
                              <Typography variant="body2" sx={{ fontStyle: "italic", p: 1, bgcolor: "background.paper", borderRadius: 1.5 }}>
                                "{pendingCounter.message}"
                              </Typography>
                            )}
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ pt: 1 }}>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                onClick={() => handleDecideCounter(pendingCounter.counterRequestId, "Approved")}
                                disabled={busy}
                                sx={{ textTransform: "none", fontWeight: 750 }}
                              >
                                Accept Requested Salary ({pendingCounter.requestedCurrency} {pendingCounter.requestedSalary.toLocaleString()})
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                onClick={() => handleDecideCounter(pendingCounter.counterRequestId, "Rejected")}
                                disabled={busy}
                                sx={{ textTransform: "none" }}
                              >
                                Decline Request
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      )}

                      {/* 3. If Offer was SENT to candidate (Awaiting response) */}
                      {offer.status === "Sent" && (
                        <Box sx={{ p: 2.25, borderRadius: 2.5, bgcolor: (t) => alpha(t.palette.info.main, 0.05), border: "1px solid", borderColor: "info.main" }}>
                          <Stack spacing={1.75}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Stack direction="row" spacing={1.25} alignItems="center">
                                <Box sx={{ width: 36, height: 36, borderRadius: "50%", bgcolor: "info.lighter", display: "grid", placeItems: "center", color: "info.main" }}>
                                  <EmailOutlined sx={{ fontSize: 20 }} />
                                </Box>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight={850} color="info.dark">
                                    Official Offer Dispatched via Email
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Delivered to <strong>{applicant.email || "candidate's email"}</strong>
                                  </Typography>
                                </Box>
                              </Stack>
                              <Chip size="small" label="Sent · Awaiting Response" color="info" sx={{ fontWeight: 800, fontSize: "0.72rem" }} />
                            </Stack>

                            <Box sx={{ p: 1.75, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                              <Typography variant="body2" color="text.primary">
                                Offered Compensation: <strong>{offer.currency} {Number(offer.salary || 0).toLocaleString()}</strong>
                                {offer.startDateUtc && ` · Expected Joining: ${offer.startDateUtc}`}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.75, lineHeight: 1.5 }}>
                                The formal offer letter was sent directly to the candidate's email inbox. The candidate reviews the terms and replies with their written confirmation or signed copy.
                              </Typography>
                            </Box>

                            {/* HR Candidate Acceptance Action */}
                            <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ pt: 0.5 }}>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckCircleOutline />}
                                onClick={handleMarkOfferAcceptedOffline}
                                disabled={busy}
                                sx={{ textTransform: "none", fontWeight: 800, px: 2, py: 0.75, borderRadius: 1.5 }}
                              >
                                {busy ? "Recording..." : "Record Candidate Acceptance"}
                              </Button>
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setIsRevisionMode(!isRevisionMode)}
                                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 1.5 }}
                              >
                                {isRevisionMode ? "Cancel Revision" : "Revise Terms"}
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      )}

                      {/* 4. Primary Offer Form (When Draft, New, or Revising) */}
                      {(offer.status === "Draft" || isRevisionMode || !offer.offerId) && (
                        <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2.5, bgcolor: "background.paper" }}>
                          <Typography variant="subtitle2" fontWeight={850} sx={{ mb: 1.5 }}>
                            {offer.offerId ? "Offer Terms" : "Create New Employment Offer"}
                          </Typography>
                          <Stack spacing={1.75}>
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                              <AppTextField
                                sx={{ ...fieldSx, flex: 2 }}
                                label="Base Annual Salary *"
                                type="number"
                                placeholder="E.g. 950000"
                                value={offer.salary}
                                onChange={(event) => setOffer({ ...offer, salary: event.target.value })}
                                inputProps={{ min: 0, step: "any" }}
                              />
                              <AppTextField
                                sx={{ ...fieldSx, flex: 1 }}
                                label="Currency"
                                value={offer.currency}
                                onChange={(event) => setOffer({ ...offer, currency: event.target.value.toUpperCase() })}
                              />
                            </Stack>

                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                              <Box sx={{ flex: 1 }}>
                                <CustomisedDatePicker
                                  label="Planned Joining Date"
                                  value={offer.startDateUtc ? dayjs(offer.startDateUtc) : null}
                                  minDate={dayjs().startOf("day")}
                                  setValue={(value) => setOffer({ ...offer, startDateUtc: value?.format("YYYY-MM-DD") ?? "" })}
                                  sx={fieldSx}
                                />
                              </Box>
                              <Box sx={{ flex: 1 }}>
                                <CustomisedDateTimePicker
                                  label="Offer Expiry Deadline"
                                  value={offer.expiresAtUtc ? dayjs(offer.expiresAtUtc) : null}
                                  minDateTime={dayjs()}
                                  onChange={(value) => setOffer({ ...offer, expiresAtUtc: value?.format("YYYY-MM-DDTHH:mm") ?? "" })}
                                  slotProps={{
                                    textField: {
                                      fullWidth: true,
                                      sx: fieldSx,
                                      size: "small",
                                      helperText: "Formal offer response window expires after this timestamp.",
                                    },
                                  }}
                                />
                              </Box>
                            </Stack>

                            {/* Dynamic Allowances & Bonus Components Collapsible Accordion */}
                            <Accordion
                              expanded={isAllowancesOpen}
                              onChange={(_, expanded) => setIsAllowancesOpen(expanded)}
                              sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: "12px !important",
                                "&:before": { display: "none" },
                                boxShadow: "none",
                              }}
                            >
                              <AccordionSummary expandIcon={<ExpandMore />}>
                                <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                                  <Typography variant="body2" fontWeight={750}>
                                    Allowances & Compensation Components (Optional)
                                  </Typography>
                                  <Chip
                                    size="small"
                                    label={`${compensationItems.length} active`}
                                    sx={{ height: 20, fontSize: "0.72rem", fontWeight: 700 }}
                                  />
                                </Stack>
                              </AccordionSummary>
                              <AccordionDetails sx={{ pt: 0 }}>
                                <Stack spacing={1.75}>
                                  {/* Standard Company Presets */}
                                  <Box sx={{ p: 1.25, bgcolor: (t) => alpha(t.palette.text.primary, 0.02), borderRadius: 2, border: "1px solid", borderColor: "divider" }}>
                                    <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                                      Standard Company Payroll Components (Click to Add):
                                    </Typography>
                                    <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap gap={0.75}>
                                      {standardPayrollComponentPresets.map((preset) => {
                                        const isAdded = compensationItems.some(
                                          (ci) => ci.name.trim().toLowerCase() === preset.name.toLowerCase() ||
                                                  ci.name.trim().toLowerCase() === preset.code.toLowerCase()
                                        );
                                        return (
                                          <Chip
                                            key={preset.code}
                                            size="small"
                                            label={isAdded ? `✓ ${preset.code} Added` : `+ ${preset.code}`}
                                            title={preset.name}
                                            onClick={() => handleAddPresetComponent(preset.name)}
                                            disabled={isAdded || compensationItems.length >= 30}
                                            sx={{
                                              fontWeight: 700,
                                              fontSize: "0.74rem",
                                              borderRadius: 1.5,
                                              cursor: isAdded ? "default" : "pointer",
                                              color: isAdded ? "success.dark" : "primary.main",
                                              bgcolor: (t) =>
                                                isAdded
                                                  ? alpha(t.palette.success.main, 0.12)
                                                  : alpha(t.palette.primary.main, 0.08),
                                              border: "1px solid",
                                              borderColor: (t) =>
                                                isAdded
                                                  ? alpha(t.palette.success.main, 0.35)
                                                  : alpha(t.palette.primary.main, 0.25),
                                              transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                                              "&:hover": {
                                                bgcolor: (t) =>
                                                  isAdded
                                                    ? alpha(t.palette.success.main, 0.18)
                                                    : alpha(t.palette.primary.main, 0.16),
                                                borderColor: (t) =>
                                                  isAdded
                                                    ? alpha(t.palette.success.main, 0.5)
                                                    : alpha(t.palette.primary.main, 0.5),
                                                transform: isAdded ? "none" : "translateY(-1px)",
                                                boxShadow: (t) =>
                                                  isAdded
                                                    ? "none"
                                                    : `0 2px 8px ${alpha(t.palette.primary.main, 0.2)}`,
                                              },
                                            }}
                                          />
                                        );
                                      })}
                                    </Stack>
                                  </Box>

                                  {/* Dynamic list of compensation rows */}
                                  {compensationItems.length === 0 ? (
                                    <Box sx={{ p: 2, textAlign: "center", bgcolor: "action.hover", borderRadius: 2 }}>
                                      <Typography variant="body2" color="text.secondary">
                                        No allowances added. Total CTC equals Base Annual Salary. Click the presets above or 'Add Component' below to include allowances.
                                      </Typography>
                                    </Box>
                                  ) : (
                                    <Stack spacing={1.25}>
                                      {compensationItems.map((item, index) => (
                                        <Stack
                                          key={item.id}
                                          direction={{ xs: "column", sm: "row" }}
                                          spacing={1}
                                          alignItems={{ sm: "center" }}
                                          sx={{
                                            p: 1.25,
                                            borderRadius: 2,
                                            bgcolor: (t) => alpha(t.palette.background.default, 0.4),
                                            border: "1px solid",
                                            borderColor: "divider",
                                          }}
                                        >
                                          <Box sx={{ flex: 2 }}>
                                            <Autocomplete
                                              freeSolo
                                              size="small"
                                              options={standardPayrollComponentPresets.map((p) => p.name)}
                                              value={item.name}
                                              onInputChange={(_, newInputValue) =>
                                                handleUpdateCompensationItem(item.id, "name", newInputValue)
                                              }
                                              renderInput={(params) => (
                                                <AppTextField
                                                  {...params}
                                                  sx={fieldSx}
                                                  label={`Component ${index + 1} Name`}
                                                  placeholder="E.g. House Rent Allowance (HRA)"
                                                />
                                              )}
                                            />
                                          </Box>
                                          <Box sx={{ flex: 1.5 }}>
                                            <AppTextField
                                              sx={fieldSx}
                                              label="Annual Amount"
                                              type="number"
                                              placeholder="0"
                                              value={item.value}
                                              onChange={(e) =>
                                                handleUpdateCompensationItem(item.id, "value", e.target.value)
                                              }
                                              inputProps={{ min: 0, step: "any" }}
                                              InputProps={{
                                                startAdornment: (
                                                  <InputAdornment position="start">
                                                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                                                      {offer.currency}
                                                    </Typography>
                                                  </InputAdornment>
                                                ),
                                              }}
                                            />
                                          </Box>
                                          <IconButton
                                            size="small"
                                            color="error"
                                            aria-label={`Delete ${item.name || `component ${index + 1}`}`}
                                            onClick={() => handleRemoveCompensationItem(item.id)}
                                            sx={{ alignSelf: { xs: "flex-end", sm: "center" }, borderRadius: 1.5 }}
                                          >
                                            <Delete fontSize="small" />
                                          </IconButton>
                                        </Stack>
                                      ))}
                                    </Stack>
                                  )}

                                  {/* Add Component Action Button */}
                                  <Box>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<Add sx={{ fontSize: 18 }} />}
                                      onClick={() => handleAddCompensationItem()}
                                      disabled={compensationItems.length >= 30}
                                      sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, fontSize: "0.78rem" }}
                                    >
                                      Add Component / Allowance
                                    </Button>
                                  </Box>

                                  {/* Executive CTC Breakdown Card */}
                                  <Box
                                    sx={{
                                      p: 2,
                                      borderRadius: 2,
                                      bgcolor: (t) => alpha(t.palette.text.primary, 0.03),
                                      border: "1px solid",
                                      borderColor: "divider",
                                    }}
                                  >
                                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
                                      <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={650} display="block">
                                          BASE SALARY (ANNUAL)
                                        </Typography>
                                        <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                                          {offer.currency} {baseAnnualSalary.toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          ≈ {offer.currency} {Math.round(baseAnnualSalary / 12).toLocaleString()} / mo
                                        </Typography>
                                      </Box>

                                      <Box>
                                        <Typography variant="caption" color="text.secondary" fontWeight={650} display="block">
                                          ALLOWANCES & BONUSES
                                        </Typography>
                                        <Typography variant="subtitle2" fontWeight={750} color="text.primary">
                                          {offer.currency} {offerAllowancesTotal.toLocaleString()}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {compensationItems.filter((i) => Number(i.value) > 0).length} active component(s)
                                        </Typography>
                                      </Box>

                                      <Box sx={{ sm: { textAlign: "right" } }}>
                                        <Typography variant="caption" color="primary.main" fontWeight={800} display="block">
                                          TOTAL ANNUAL CTC
                                        </Typography>
                                        <Typography variant="h6" fontWeight={850} color="primary.main">
                                          {offer.currency} {offerComponentTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                          Est. Gross: {offer.currency} {estimatedMonthlyGross.toLocaleString()} / mo
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </Box>
                                </Stack>
                              </AccordionDetails>
                            </Accordion>

                            {/* Single Clean Primary Action Button */}
                            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ pt: 1 }}>
                              <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                startIcon={<Send />}
                                onClick={() => handleSendOffer("Sent")}
                                disabled={busy || Boolean(offerValidation)}
                                sx={{ flex: 2, textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                              >
                                Send Offer to Candidate
                              </Button>
                              <Button
                                variant="outlined"
                                size="large"
                                onClick={() => handleSendOffer("Draft")}
                                disabled={busy}
                                sx={{ flex: 1, textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                              >
                                Save Draft
                              </Button>
                            </Stack>
                          </Stack>
                        </Box>
                      )}

                      {/* Revision history (if any revisions exist) */}
                      {offerVersions.length > 0 && (
                        <Box sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover" }}>
                          <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                            OFFER REVISION HISTORY ({offerVersions.length} versions)
                          </Typography>
                          <Stack spacing={0.75}>
                            {offerVersions.map((v) => (
                              <Stack key={v.offerVersionId} direction="row" justifyContent="space-between" alignItems="center" sx={{ p: 1, bgcolor: "background.paper", borderRadius: 1.5 }}>
                                <Typography variant="body2" fontWeight={750}>
                                  v{v.versionNumber}: {v.currency} {(v.totalCtc ?? v.salary).toLocaleString()}
                                </Typography>
                                <Chip size="small" label={v.status} variant="outlined" />
                              </Stack>
                            ))}
                          </Stack>
                        </Box>
                      )}
                    </Stack>
                  )}

                  {/* STEP 4: PREBOARDING & EMPLOYEE HANDOFF */}
                  {mode === "handoff" && (
                    <Stack spacing={2}>
                      {(handoffCompleted || applicant.isHired) ? (
                        <Box sx={{ p: 3, borderRadius: 3, bgcolor: "success.lighter", border: "1px solid", borderColor: "success.main", textAlign: "center" }}>
                          <CheckCircleOutline sx={{ fontSize: 50, color: "success.main", mb: 1 }} />
                          <Typography variant="h6" fontWeight={850} color="success.dark">
                            Employee Successfully Created!
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            {applicant.firstName} {applicant.lastName} is officially an employee with ID: <strong>{applicant.employeeId || handoff.employeeId || suggestedEmployeeId}</strong>.
                          </Typography>
                          <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 2 }}>
                            {applicant.employeeUserId && (
                              <Button
                                variant="contained"
                                color="success"
                                onClick={() => {
                                  const targetId = applicant.employeeUserId || applicant.employeeId;
                                  if (targetId) {
                                    navigate(`/employees/${targetId}`);
                                  } else {
                                    navigate("/employees");
                                  }
                                }}
                                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                              >
                                View Employee Profile →
                              </Button>
                            )}
                            <Button
                              variant="outlined"
                              color="success"
                              onClick={onClose}
                              sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                            >
                              Close
                            </Button>
                          </Stack>
                        </Box>
                      ) : (
                        <Stack spacing={2}>
                          <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2.5, bgcolor: "background.paper" }}>
                            <Typography variant="subtitle2" fontWeight={850} sx={{ mb: 1.5 }}>
                              Candidate Details & Assigned Employee ID
                            </Typography>
                            <Stack spacing={1.75}>
                              <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                                <AppTextField
                                  sx={{ ...fieldSx, flex: 1 }}
                                  label="First Name *"
                                  value={handoff.firstName}
                                  onChange={(e) => setHandoff({ ...handoff, firstName: e.target.value })}
                                  required
                                />
                                <AppTextField
                                  sx={{ ...fieldSx, flex: 1 }}
                                  label="Last Name *"
                                  value={handoff.lastName}
                                  onChange={(e) => setHandoff({ ...handoff, lastName: e.target.value })}
                                  required
                                />
                              </Stack>

                              <AppTextField
                                sx={fieldSx}
                                label="Official / Login Email *"
                                type="email"
                                value={handoff.email}
                                onChange={(e) => setHandoff({ ...handoff, email: e.target.value })}
                                required
                              />

                              <Box>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 0.75 }}>
                                  <Typography variant="body2" fontWeight={750}>
                                    Assigned Employee ID *
                                  </Typography>
                                  {suggestedEmployeeId && (
                                    <Chip
                                      size="small"
                                      color="primary"
                                      variant="outlined"
                                      label={`Next in Sequence: ${suggestedEmployeeId}`}
                                      sx={{ fontSize: "0.75rem", fontWeight: 700 }}
                                    />
                                  )}
                                </Stack>
                                <AppTextField
                                  sx={fieldSx}
                                  placeholder={suggestedEmployeeId || "E.g. CD-0137"}
                                  value={handoff.employeeId}
                                  onChange={(e) => setHandoff({ ...handoff, employeeId: e.target.value })}
                                  required
                                />
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                  Official ID generated sequentially from company policy ({suggestedEmployeeId || "CD-####"}). Keep as-is or enter a custom ID.
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>

                          {/* Preboarding Verification Checklist */}
                          <Box sx={{ p: 2, border: 1, borderColor: "divider", borderRadius: 2.5, bgcolor: "action.hover" }}>
                            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="subtitle2" fontWeight={800}>
                                Preboarding Checklist
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={1}>
                                <Typography variant="caption" color="text.secondary">
                                  Auto-complete verification
                                </Typography>
                                <AppSwitch
                                  checked={handoff.autoCompletePreboarding}
                                  onChange={(event) =>
                                    setHandoff({ ...handoff, autoCompletePreboarding: event.target.checked })
                                  }
                                />
                              </Stack>
                            </Stack>
                            {preboardingTasks.map((task, index) => (
                              <Stack key={task.code} direction="row" spacing={1} alignItems="center" sx={{ py: 0.5 }}>
                                <Typography variant="body2" sx={{ flex: 1 }}>
                                  {task.title}
                                </Typography>
                                <Chip size="small" label={task.status} color={task.status === "Completed" ? "success" : "default"} />
                              </Stack>
                            ))}
                          </Box>

                          <Button
                            variant="contained"
                            color="success"
                            size="large"
                            startIcon={<PersonAdd />}
                            onClick={submit}
                            disabled={busy || (!handoff.employeeId.trim() && !suggestedEmployeeId.trim())}
                            sx={{ py: 1.5, textTransform: "none", fontWeight: 850, borderRadius: 2.5, fontSize: "0.95rem" }}
                          >
                            {busy ? "Creating Employee…" : "Complete Handoff & Create Employee"}
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {/* Feedback Message */}
                  {feedback && (
                    <Alert severity={feedback.severity} onClose={() => setFeedback(undefined)}>
                      {feedback.code ? `${feedback.code}: ` : ""}
                      {feedback.text}
                    </Alert>
                  )}
                </Stack>
              </Box>

              {/* Action Footer Buttons */}
              <Stack
                direction={{ xs: "column-reverse", sm: "row" }}
                spacing={1}
                justifyContent="flex-end"
                sx={{ flex: "0 0 auto", pt: 1.25, borderTop: 1, borderColor: "divider" }}
              >
                {mode === "offer" ? (
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1}
                    alignItems={{ sm: "center" }}
                    justifyContent="space-between"
                    sx={{ width: "100%" }}
                  >
                    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
                      <Typography variant="caption" color="text.secondary" fontWeight={750}>
                        TOTAL CTC:
                      </Typography>
                      <Typography variant="subtitle2" fontWeight={850} color="primary.main">
                        {offer.currency} {offerComponentTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" }, justifyContent: "flex-end" }}>
                      <CustomisedButton
                        variant="outlined"
                        label="Close"
                        handleClick={onClose}
                        disabled={busy}
                        sx={{ width: { xs: "auto", sm: "auto" } }}
                      />
                      <Button
                        variant="outlined"
                        size="medium"
                        onClick={() => handleSendOffer("Draft")}
                        disabled={busy}
                        sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                      >
                        Save Draft
                      </Button>
                      <Button
                        variant="contained"
                        color="primary"
                        size="medium"
                        startIcon={<Send />}
                        onClick={() => handleSendOffer("Sent")}
                        disabled={busy || Boolean(offerValidation)}
                        sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                      >
                        Send Offer
                      </Button>
                    </Stack>
                  </Stack>
                ) : (
                  <CustomisedButton
                    variant="outlined"
                    label="Close"
                    handleClick={onClose}
                    disabled={busy}
                    sx={{ width: { xs: "100%", sm: "auto" } }}
                  />
                )}
                {mode !== "offer" && mode !== "handoff" && stage !== ApplicationStatus.Rejected && (
                  <CustomisedButton
                    variant="contained"
                    label={
                      busy
                        ? "Saving…"
                        : mode === "screening" && screening.decision === "Pass" && !effectiveRequireInterview
                        ? "Fast-Track to Offer"
                        : mode === "screening" && screening.decision === "Reject"
                        ? "Reject Candidate"
                        : mode === "interview" && interviewSubTab === 0
                        ? isSchedulingRoundOpen ? (editingRoundId ? "Save Round Changes" : `Schedule Round ${interview.roundNumber}`) : "Proceed to Scorecards & Decision →"
                        : mode === "interview" && decision.decision === "Reject"
                        ? "Reject Application"
                        : mode === "interview" && decision.decision === "Hold"
                        ? "Place on Hold"
                        : mode === "interview" && decision.decision === "Approve"
                        ? "Approve & Advance to Offer"
                        : "Save & Advance"
                    }
                    loading={busy}
                    handleClick={submit}
                    disabled={
                      busy ||
                      (mode === "screening" && screening.decision === "Pass" && isScreeningThresholdActive && !meetsScreeningThreshold) ||
                      (mode === "interview" && interviewSubTab === 0 && isSchedulingRoundOpen && Boolean(interviewValidation)) ||
                      (mode === "interview" && interviewSubTab === 1 && (decision.decision === "Reject" || decision.decision === "Hold") && !decision.notes.trim())
                    }
                    sx={{
                      width: { xs: "100%", sm: "auto" },
                      bgcolor:
                        (mode === "screening" && screening.decision === "Reject") ||
                        (mode === "interview" && interviewSubTab === 1 && decision.decision === "Reject")
                          ? "error.main"
                          : (mode === "interview" && interviewSubTab === 1 && decision.decision === "Hold")
                          ? "warning.main"
                          : undefined,
                      "&:hover": {
                        bgcolor:
                          (mode === "screening" && screening.decision === "Reject") ||
                          (mode === "interview" && interviewSubTab === 1 && decision.decision === "Reject")
                            ? "error.dark"
                            : (mode === "interview" && interviewSubTab === 1 && decision.decision === "Hold")
                            ? "warning.dark"
                            : undefined,
                      },
                    }}
                  />
                )}
                {mode === "offer" && offer.status === "Accepted" && (
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setMode("handoff")}
                    endIcon={<ArrowForward />}
                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                  >
                    Proceed to Handoff
                  </Button>
                )}
              </Stack>
            </Stack>
          </Box>
        </Stack>
            {/* Modal to configure role-specific screening threshold */}
      <Dialog open={thresholdModalOpen} onClose={() => setThresholdModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight={800}>
            Role Screening Policy
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {vacancyData?.title ? `For role: ${vacancyData.title}` : "Configure job threshold"}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Define the minimum screening pass score required for candidates applying to <strong>{vacancyData?.title || "this role"}</strong>.
            </Typography>
            <AppTextField
              fullWidth
              label="Role Screening Pass Score (%) *"
              type="number"
              value={customThresholdScore}
              onChange={(e) => setCustomThresholdScore(Math.max(0, Math.min(100, Number(e.target.value) || 0)))}
              inputProps={{ min: 0, max: 100 }}
              helperText="Candidates must meet or exceed this score during screening to pass."
            />
            <AppTextField
              fullWidth
              multiline
              rows={3}
              label="Role Screening Criteria (comma-separated)"
              value={customCriteriaText}
              onChange={(e) => setCustomCriteriaText(e.target.value)}
              placeholder="e.g. C#, .NET Core, Web API, SQL Server, Clean Architecture"
              helperText="Evaluation checklist items recruiters check when screening candidates for this JD."
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setThresholdModalOpen(false)} color="inherit" sx={{ textTransform: "none" }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSaveRoleThreshold}
            disabled={savingThreshold || !vacancyData?.jobId}
            sx={{ textTransform: "none", fontWeight: 750 }}
          >
            {savingThreshold ? "Saving..." : "Save Policy for this Role"}
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>

      {/* SECONDARY RECRUITMENT UTILITY TOOLS (Clean dialog instead of screen clutter) */}
      <Dialog
        open={Boolean(activeUtilityTool)}
        onClose={() => setActiveUtilityTool(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          {activeUtilityTool === "resume" && "Resume Extraction Review"}
          {activeUtilityTool === "privacy" && "Candidate Privacy & GDPR"}
          {activeUtilityTool === "talentpool" && "Add to Talent Pool"}
          {activeUtilityTool === "merge" && "Merge Duplicate Applicant"}
        </DialogTitle>
        <DialogContent dividers>
          {activeUtilityTool === "resume" && (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Review parsed resume parameters. Corrections remain advisory and audit-logged.
              </Typography>
              <AppTextField
                sx={fieldSx}
                select
                label="Extraction Decision"
                value={resumeReview.decision}
                onChange={(e) => setResumeReview({ ...resumeReview, decision: e.target.value as any })}
              >
                <MenuItem value="Pending">Pending</MenuItem>
                <MenuItem value="Approved">Approved</MenuItem>
                <MenuItem value="Rejected">Rejected</MenuItem>
              </AppTextField>
              <AppTextField
                sx={fieldSx}
                multiline
                minRows={5}
                label="Extracted Candidate Attributes"
                value={resumeReview.fieldsText}
                onChange={(e) => setResumeReview({ ...resumeReview, fieldsText: e.target.value })}
              />
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    await reviewRecruitmentResumeExtraction({
                      applicantId: applicant.applicantId,
                      vacancyId: applicant.vacancyId,
                      decision: resumeReview.decision,
                      extractedFields: Object.fromEntries(
                        resumeReview.fieldsText.split("\n").filter((l) => l.includes(":")).map((l) => {
                          const [k, ...v] = l.split(":");
                          return [k.trim(), v.join(":").trim()];
                        })
                      ),
                      notes: resumeReview.notes || null,
                      idempotencyKey: createIdempotencyKey(),
                    });
                    setActiveUtilityTool(null);
                    setFeedback({ severity: "success", text: "Resume extraction review saved." });
                  } catch (e) {
                    setFeedback({ severity: "error", text: (e as Error).message });
                  }
                }}
                sx={{ textTransform: "none", fontWeight: 750 }}
              >
                Save Review
              </Button>
            </Stack>
          )}

          {activeUtilityTool === "privacy" && (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Manage candidate consent or execute GDPR anonymization requests.
              </Typography>
              <AppTextField
                sx={fieldSx}
                select
                label="Privacy Action"
                value={privacy.action}
                onChange={(e) => setPrivacy({ ...privacy, action: e.target.value as any })}
              >
                <MenuItem value="Grant">Grant Data Retention Consent</MenuItem>
                <MenuItem value="Revoke">Revoke Consent</MenuItem>
                <MenuItem value="Anonymize">Anonymize / Erase Candidate Record</MenuItem>
              </AppTextField>
              <AppTextField
                sx={fieldSx}
                multiline
                minRows={2}
                label="Privacy / Regulatory Reason *"
                value={privacy.reason}
                onChange={(e) => setPrivacy({ ...privacy, reason: e.target.value })}
              />
              <Button
                variant="contained"
                color={privacy.action === "Anonymize" ? "error" : "primary"}
                onClick={async () => {
                  try {
                    await applyRecruitmentCandidatePrivacy({
                      applicantId: applicant.applicantId,
                      action: privacy.action,
                      reason: privacy.reason || "Candidate GDPR privacy request",
                      idempotencyKey: createIdempotencyKey(),
                    });
                    setActiveUtilityTool(null);
                    setFeedback({ severity: "success", text: `Privacy action '${privacy.action}' applied successfully.` });
                    onSaved?.();
                  } catch (e) {
                    setFeedback({ severity: "error", text: (e as Error).message });
                  }
                }}
                sx={{ textTransform: "none", fontWeight: 750 }}
              >
                Apply Privacy Action
              </Button>
            </Stack>
          )}

          {activeUtilityTool === "talentpool" && (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <AppTextField
                sx={fieldSx}
                label="Pool Name"
                value={talentPool.poolName}
                onChange={(e) => setTalentPool({ ...talentPool, poolName: e.target.value })}
              />
              <AppTextField
                sx={fieldSx}
                label="Tags (comma separated)"
                placeholder="Senior, Frontend, Fast-Track"
                value={talentPool.tags}
                onChange={(e) => setTalentPool({ ...talentPool, tags: e.target.value })}
              />
              <Button
                variant="contained"
                onClick={async () => {
                  try {
                    await upsertRecruitmentTalentPool({
                      applicantId: applicant.applicantId,
                      poolName: talentPool.poolName,
                      tags: talentPool.tags.split(",").map((t) => t.trim()).filter(Boolean),
                      status: talentPool.status,
                      notes: talentPool.notes || null,
                      idempotencyKey: createIdempotencyKey(),
                    });
                    setActiveUtilityTool(null);
                    setFeedback({ severity: "success", text: "Added to talent pool." });
                  } catch (e) {
                    setFeedback({ severity: "error", text: (e as Error).message });
                  }
                }}
                sx={{ textTransform: "none", fontWeight: 750 }}
              >
                Add Candidate to Talent Pool
              </Button>
            </Stack>
          )}

          {activeUtilityTool === "merge" && (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <AppTextField
                sx={fieldSx}
                label="Target Applicant ID to Merge Into *"
                value={merge.targetApplicantId}
                onChange={(e) => setMerge({ ...merge, targetApplicantId: e.target.value })}
              />
              <AppTextField
                sx={fieldSx}
                label="Merge Justification Reason *"
                value={merge.reason}
                onChange={(e) => setMerge({ ...merge, reason: e.target.value })}
              />
              <Button
                variant="contained"
                color="warning"
                onClick={async () => {
                  try {
                    await mergeRecruitmentApplicants({
                      sourceApplicantId: applicant.applicantId,
                      targetApplicantId: merge.targetApplicantId.trim(),
                      reason: merge.reason.trim(),
                      idempotencyKey: createIdempotencyKey(),
                    });
                    setActiveUtilityTool(null);
                    setFeedback({ severity: "success", text: "Applicants merged successfully." });
                    onSaved?.();
                  } catch (e) {
                    setFeedback({ severity: "error", text: (e as Error).message });
                  }
                }}
                sx={{ textTransform: "none", fontWeight: 750 }}
              >
                Confirm Merge Duplicate
              </Button>
            </Stack>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
