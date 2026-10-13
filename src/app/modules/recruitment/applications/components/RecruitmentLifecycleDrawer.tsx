import { useEffect, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import { useAppSelector } from "../../../../Redux/hooks";
import { getAllEmployees } from "../../../employees/employeeServices";
import { getAllDepartments } from "../../../admin/adminservices";
import { DepartmentModel } from "../../../admin/models";
import { Avatar, Alert, Box, Chip, Divider, Drawer, MenuItem, Stack, Step, StepLabel, Stepper, Typography, useMediaQuery, useTheme } from "@mui/material";
import { Close, Visibility } from "@mui/icons-material";
import clsx from "clsx";
import { AppButton, AppSwitch, AppTextField, CustomisedDatePicker, CustomisedDateTimePicker } from "../../../../shared/components";
import CustomisedButton from "../../../../shared/components/C_Button";
import { CustomIconButton } from "../../../../shared/components/C_IconButton";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import { PdfViewer } from "../../../../shared/components/PdfViewer";
import { ApplicationPreview } from "./ApplicationPreview";
import { applicationStatusMapper } from "../../../../../utils/common";
import { Applicant, CandidateHandoffRequest, RecruitmentApplicantMergeCommand, RecruitmentApplicationStageCommand, RecruitmentEnterpriseConfig, RecruitmentInterviewCommand, RecruitmentInterviewDebriefCommand, RecruitmentScreeningReviewCommand, RecruitmentOfferCommand, RecruitmentHiringDecisionCommand, RecruitmentCandidatePrivacyCommand, RecruitmentResumeExtractionReviewCommand, RecruitmentOfferVersionCommand, RecruitmentOfferVersion, RecruitmentOfferCounterRequest, RecruitmentOfferCounterCommand, RecruitmentScorecardCommand, RecruitmentTalentPoolCommand, RecruitmentWorkflow, RecruitmentOnboardingCase } from "../../models";
import { ApplicationStatus } from "../../../../../utils/enums";
import { completeRecruitmentInterviewDebrief, getRecruitmentWorkflow, handoffCandidateToPreboarding, upsertRecruitmentApplicationStage, mergeRecruitmentApplicants, upsertRecruitmentInterview, upsertRecruitmentOffer, upsertRecruitmentHiringDecision, applyRecruitmentCandidatePrivacy, reviewRecruitmentResumeExtraction, createRecruitmentOfferVersion, getRecruitmentOfferVersions, getRecruitmentOfferCounters, requestRecruitmentOfferCounter, upsertRecruitmentScreening, upsertRecruitmentScorecard, upsertRecruitmentTalentPool, getRecruitmentOnboarding, updateRecruitmentOnboarding, retryRecruitmentOnboardingActivation, retryRecruitmentInterviewCalendar, getRecruitmentInterviewRounds, getRecruitmentScorecards, getRecruitmentEnterpriseConfig, getRecruitmentResumeExtractionReview, getRecruitmentPendingOffers, getRecruitmentPreboardingQueue, updateRecruitmentPreboarding } from "../../services";

type Props = { open: boolean; applicant: Applicant; onClose: () => void; onSaved?: () => void };
type Mode = "screening" | "interview" | "offer" | "handoff" | "onboarding" | "decision" | "privacy" | "resume" | "negotiation" | "scorecard" | "talentpool" | "merge";
type Feedback = { severity: "success" | "error"; text: string; code?: string };
const primarySteps: { id: Mode; label: string; helper: string }[] = [{ id: "screening", label: "Screening", helper: "Review evidence" }, { id: "interview", label: "Interview", helper: "Schedule rounds" }, { id: "decision", label: "Decision", helper: "Approve or hold" }, { id: "offer", label: "Offer", helper: "Prepare offer" }, { id: "handoff", label: "Employee handoff", helper: "Create employee" }, { id: "onboarding", label: "Onboarding", helper: "Activate employee" }];
const createIdempotencyKey = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;
const getApiMessage = (response: { data?: { message?: string; errorCode?: string | null } }) => ({ text: response.data?.message ?? "Unable to save this recruitment action.", code: response.data?.errorCode });

export const RecruitmentLifecycleDrawer = ({ open, applicant, onClose, onSaved }: Props) => {
  const reviewerUserId = useAppSelector((state) => state.user.userData?.userId) ?? "";
  const [mode, setMode] = useState<Mode>("interview"); const [busy, setBusy] = useState(false); const [feedback, setFeedback] = useState<Feedback>();
  const [workflow, setWorkflow] = useState<RecruitmentWorkflow>();
  const [enterpriseConfig, setEnterpriseConfig] = useState<RecruitmentEnterpriseConfig | null>(null);
  const [screening, setScreening] = useState({ score: 75, decision: "Pass" as RecruitmentScreeningReviewCommand["decision"], rejectionReason: "", evidence: "", criteria: [{ name: "Relevant experience", passed: true, notes: "" }] });
  const [interviewRounds, setInterviewRounds] = useState<any[]>([]);
  const [savedScorecards, setSavedScorecards] = useState<any[]>([]);
  const [interviewSearchBusy, setInterviewSearchBusy] = useState(false);
  const [interviewers, setInterviewers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<DepartmentModel[]>([]);
  const [interviewerQuery, setInterviewerQuery] = useState("");
  const [interviewerDepartment, setInterviewerDepartment] = useState("");
  const [interview, setInterview] = useState({ title: "Interview", roundNumber: 1, roundType: "Technical", startsAtUtc: "", endsAtUtc: "", location: "", panelistUserIds: "" });
  const [offer, setOffer] = useState({ offerId: "", salary: "", currency: "INR", startDateUtc: "", compensationComponents: { "Housing allowance": "", "Transport allowance": "", "Variable pay": "" } as Record<string, string>, approvalReference: "", expiresAtUtc: "", status: "Draft" as RecruitmentOfferCommand["status"] });
  const [handoff, setHandoff] = useState({ firstName: applicant.firstName ?? "", lastName: applicant.lastName ?? "", email: applicant.email ?? "", employeeId: "", autoCompletePreboarding: true });
  const [preboardingCaseId, setPreboardingCaseId] = useState("");
  const [preboardingTasks, setPreboardingTasks] = useState<Array<{ code: string; title: string; status: "Pending" | "InProgress" | "Completed" | "Skipped" }>>([
    { code: "candidate-details", title: "Candidate details verified", status: "Completed" },
    { code: "documents", title: "Mandatory documents collected", status: "Completed" },
    { code: "verification", title: "Background & reference verification", status: "Completed" },
  ]);
  const [merge, setMerge] = useState({ targetApplicantId: "", reason: "" });
  const [scorecard, setScorecard] = useState({ scorecardId: "", interviewId: "", roundNumber: 1, reviewerUserId: reviewerUserId, recommendation: "Strong Hire", debriefDecision: "Advance" as RecruitmentInterviewDebriefCommand["decision"], status: "Submitted" as RecruitmentScorecardCommand["status"], criteria: [{ name: "Technical assessment", rating: 4, notes: "" }] });
  const [talentPool, setTalentPool] = useState({ poolName: "Future hires", tags: "", notes: "", status: "Active" as RecruitmentTalentPoolCommand["status"] });
  const [onboarding, setOnboarding] = useState<RecruitmentOnboardingCase>();
  const [decision, setDecision] = useState({ decision: "Approve" as RecruitmentHiringDecisionCommand["decision"], notes: "" });
  const [privacy, setPrivacy] = useState({ action: "Grant" as RecruitmentCandidatePrivacyCommand["action"], retentionDays: "" as number | "", reason: "" });
  const [negotiation, setNegotiation] = useState({ action: "Version" as "Version" | "Counter", offerId: "", salary: "", currency: "INR", compensationComponents: { "Housing allowance": "", "Transport allowance": "", "Variable pay": "" } as Record<string, string>, message: "" });
  const [offerVersions, setOfferVersions] = useState<RecruitmentOfferVersion[]>([]); const [counterRequests, setCounterRequests] = useState<RecruitmentOfferCounterRequest[]>([]); const [versionsBusy, setVersionsBusy] = useState(false);
  const [resumeReview, setResumeReview] = useState({ decision: "Pending" as RecruitmentResumeExtractionReviewCommand["decision"], fieldsText: "skills: \nexperience: \neducation: \n", notes: "" });
  const stage = applicant.activityType as ApplicationStatus;
  const isStartupSimpleMode = enterpriseConfig?.recruitmentMode === "Simple";
  const utilityModes: { id: Mode; label: string }[] = [{ id: "resume", label: "Resume review" }, { id: "scorecard", label: "Scorecard" }, { id: "privacy", label: "Privacy" }, { id: "negotiation", label: "Offer negotiation" }, { id: "talentpool", label: "Talent pool" }, { id: "merge", label: "Merge" }];
  const completedStep = stage === ApplicationStatus.New ? (isStartupSimpleMode ? 2 : -1) : stage === ApplicationStatus.InProgress ? (isStartupSimpleMode ? 2 : 0) : stage === ApplicationStatus.Shortlisted ? 2 : stage === ApplicationStatus.OnHold ? 2 : stage === ApplicationStatus.Selected ? 4 : -1;
  const activeStep = Math.max(0, primarySteps.findIndex((item) => item.id === mode));
  const canScorecard = stage === ApplicationStatus.Shortlisted || stage === ApplicationStatus.OnHold || stage === ApplicationStatus.Selected || isStartupSimpleMode;
  const canOffer = stage === ApplicationStatus.Selected || isStartupSimpleMode;
  const canHandoff = stage === ApplicationStatus.Selected;
  const isActionEnabled = (id: Mode) => {
    if (id === "onboarding" && !onboarding) return false;
    if (id === "decision") return [ApplicationStatus.Shortlisted, ApplicationStatus.OnHold, ApplicationStatus.Selected].includes(stage) || isStartupSimpleMode || enterpriseConfig?.applicationReview === false;
    if (id === "offer") return canOffer;
    if (id === "handoff") return canHandoff;
    if (id === "scorecard") return canScorecard;
    if (id === "screening") return stage !== ApplicationStatus.Rejected && stage !== ApplicationStatus.Selected;
    const serverAction = workflow?.actions.find(action => action.code === (id === "onboarding" ? "StartPreboarding" : id === "privacy" ? "ManageCandidatePrivacy" : id === "resume" ? "ReviewResumeExtraction" : id === "negotiation" ? "ManageOfferNegotiation" : id === "talentpool" ? "AddToTalentPool" : id === "merge" ? "MergeApplicant" : id === "interview" ? "ScheduleInterview" : "CreateOffer"));
    return serverAction ? serverAction.enabled : id === "onboarding" ? Boolean(onboarding) : id === "privacy" ? true : id === "resume" ? stage !== ApplicationStatus.Rejected : id === "negotiation" ? stage === ApplicationStatus.Selected : true;
  };
  useEffect(() => setHandoff((current) => ({ ...current, firstName: applicant.firstName ?? "", lastName: applicant.lastName ?? "", email: applicant.email ?? "" })), [applicant.firstName, applicant.lastName, applicant.email]);
  useEffect(() => {
    if (!open) return;
    if (stage === ApplicationStatus.New || stage === ApplicationStatus.InProgress) setMode("screening");
    else if (stage === ApplicationStatus.Shortlisted || stage === ApplicationStatus.OnHold) setMode("interview");
    else if (stage === ApplicationStatus.Selected) setMode("offer");
    void getAllDepartments(true).then(({ data }) => setDepartments((((data as any).methodResults ?? (data as any).methodResult ?? []) as unknown) as DepartmentModel[])).catch(() => setDepartments([]));
    void getAllEmployees({ name: "", pageNo: 1, records: 500, departmentId: [], gender: [], employmentStatus: "Active" }).then(({ data }) => setInterviewers((((data as any).methodResults ?? []) as any[]))).catch(() => setInterviewers([]));
    if (applicant.applicantId) {
      void getRecruitmentInterviewRounds(applicant.applicantId, applicant.vacancyId).then(({ data }) => {
        if (data.success && data.methodResult?.length) {
          const rows = data.methodResult;
          setInterviewRounds(rows);
          const latest = rows[0];
          if (latest) {
            setInterview((current) => ({
              ...current,
              title: latest.title ?? current.title,
              roundNumber: latest.roundNumber ?? current.roundNumber,
              roundType: latest.roundType ?? current.roundType,
              startsAtUtc: latest.startsAtUtc ? dayjs(latest.startsAtUtc).format("YYYY-MM-DDTHH:mm") : current.startsAtUtc,
              endsAtUtc: latest.endsAtUtc ? dayjs(latest.endsAtUtc).format("YYYY-MM-DDTHH:mm") : current.endsAtUtc,
              location: latest.meetingUrl || latest.location || current.location,
              panelistUserIds: (latest.panelistUserIds ?? []).join(", "),
            }));
            setScorecard((current) => ({
              ...current,
              interviewId: latest.interviewId ?? current.interviewId,
              roundNumber: latest.roundNumber ?? current.roundNumber,
            }));
          }
        }
      }).catch(() => undefined);
      void getRecruitmentScorecards(applicant.applicantId, applicant.vacancyId).then(({ data }) => {
        if (data.success && data.methodResult) setSavedScorecards(data.methodResult);
      }).catch(() => undefined);
      // REC-BUG-02 Fix: Pre-populate existing offer ID and compensation if an offer exists for this applicant
      void getRecruitmentPendingOffers(applicant.vacancyId).then(({ data }) => {
        const match = (data.methodResult ?? []).find((item) => item.applicantId === applicant.applicantId);
        if (match) {
          setOffer((current) => ({
            ...current,
            offerId: match.offerId || current.offerId,
            salary: match.salary ? String(match.salary) : current.salary,
            currency: match.currency || current.currency,
            status: (match.status as RecruitmentOfferCommand["status"]) || current.status,
          }));
          setNegotiation((current) => ({ ...current, offerId: match.offerId || current.offerId, currency: match.currency || current.currency }));
        }
      }).catch(() => undefined);
      // REC-BUG-04 Fix: Load preboarding case ID if one exists
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
        setResumeReview(current => ({ ...current, decision: review.decision, notes: review.notes ?? "", fieldsText: Object.entries(review.extractedFields ?? {}).map(([key, value]) => `${key}: ${value}`).join("\n") }));
      }
    }).catch(() => undefined);
    void getRecruitmentEnterpriseConfig().then(({ data }) => {
      if (data.success && data.methodResult) {
        const cfg = data.methodResult;
        setEnterpriseConfig(cfg);
        if (cfg.compensationCurrency) {
          setOffer(current => ({ ...current, currency: current.offerId ? current.currency : cfg.compensationCurrency! }));
          setNegotiation(current => ({ ...current, currency: cfg.compensationCurrency! }));
        }
        if (cfg.screeningCriteria?.length) {
          setScreening(current => ({ ...current, criteria: cfg.screeningCriteria!.map(name => ({ name, passed: true, notes: "" })) }));
        }
        if (cfg.preboardingChecklist?.length) {
          setPreboardingTasks(cfg.preboardingChecklist.map(code => ({ code, title: code.replace(/-/g, " "), status: "Completed" })));
        }
      }
    }).catch(() => undefined);
    void getRecruitmentWorkflow(applicant.applicantId).then(({ data }) => { if (data.success && data.methodResult) setWorkflow(data.methodResult); }).catch(() => setWorkflow(undefined));
    void getRecruitmentOnboarding(applicant.applicantId).then(({ data }) => { if (data.success && data.methodResult) setOnboarding(data.methodResult); }).catch(() => setOnboarding(undefined));
  }, [open, applicant.applicantId, applicant.vacancyId]);
  const changeDate = (field: "startsAtUtc" | "endsAtUtc", value: Dayjs | null) => setInterview((current) => { const next = value?.format("YYYY-MM-DDTHH:mm") ?? ""; if (field === "startsAtUtc" && next && current.endsAtUtc && new Date(current.endsAtUtc).getTime() <= new Date(next).getTime()) return { ...current, startsAtUtc: next, endsAtUtc: "" }; return { ...current, [field]: next }; });
  const saveResponse = (response: { data: { success: boolean; message?: string; errorCode?: string | null } }) => { if (!response.data.success) { const api = getApiMessage(response); throw Object.assign(new Error(api.text), { code: api.code }); } };
  const offerComponentTotal = Number(offer.salary || 0) + Object.values(offer.compensationComponents).reduce((total, value) => total + (Number(value) || 0), 0);
  const requireOfferApprovalRef = (enterpriseConfig?.offerApproval ?? false) && ["Approved", "Sent"].includes(offer.status);
  const offerValidation = offer.startDateUtc && new Date(offer.startDateUtc).getTime() < new Date(new Date().toDateString()).getTime() ? "Offer start date cannot be in the past." : !offer.salary || !Number.isFinite(Number(offer.salary)) || Number(offer.salary) <= 0 ? "Enter a salary greater than zero." : !/^[A-Z]{3}$/.test(offer.currency.trim().toUpperCase()) ? "Currency must be a 3-letter code such as INR or USD." : requireOfferApprovalRef && !offer.approvalReference.trim() ? "Approval reference is required by your company's offer approval policy." : null;
  const interviewValidation = !interview.title.trim() ? "Interview title is required." : !interview.startsAtUtc || !interview.endsAtUtc ? "Select both start and end times." : new Date(interview.startsAtUtc).getTime() <= Date.now() ? "Start time must be in the future." : new Date(interview.endsAtUtc).getTime() <= new Date(interview.startsAtUtc).getTime() ? "End time must be after the start time." : !interview.panelistUserIds.trim() ? "Select at least one interviewer." : null;
  const loadOfferVersions = async () => { const offerId = negotiation.offerId.trim(); if (!offerId) throw new Error("Enter an offer ID before loading revisions."); setVersionsBusy(true); try { const { data } = await getRecruitmentOfferVersions(offerId); if (!data.success) throw new Error(data.message || "Unable to load offer revisions."); setOfferVersions(data.methodResult ?? []); } finally { setVersionsBusy(false); } }; const loadCounterRequests = async () => { const offerId = negotiation.offerId.trim(); if (!offerId) throw new Error("Enter an offer ID before loading counter requests."); setVersionsBusy(true); try { const { data } = await getRecruitmentOfferCounters(offerId); if (!data.success) throw new Error(data.message || "Unable to load counter requests."); setCounterRequests(data.methodResult ?? []); } finally { setVersionsBusy(false); } };
  const submit = async () => {
    let successMessage = "Saved successfully.";
    setBusy(true); setFeedback(undefined);
    try {
      if (mode === "resume") { const extractedFields = Object.fromEntries(resumeReview.fieldsText.split("\n").map(line => line.split(":")).filter(parts => parts[0]?.trim()).map(parts => [parts[0].trim(), parts.slice(1).join(":").trim()])); if (!Object.keys(extractedFields).length) throw new Error("Enter at least one extracted field."); saveResponse(await reviewRecruitmentResumeExtraction({ applicantId: applicant.applicantId, vacancyId: applicant.vacancyId, decision: resumeReview.decision, extractedFields, notes: resumeReview.notes.trim() || null, idempotencyKey: createIdempotencyKey() } as RecruitmentResumeExtractionReviewCommand)); }
      else if (mode === "negotiation") { const offerId = negotiation.offerId.trim(); const salary = Number(negotiation.salary); if (!offerId || !Number.isFinite(salary) || salary <= 0) throw new Error("Offer ID and a valid salary are required."); if (negotiation.action === "Version") saveResponse(await createRecruitmentOfferVersion({ offerId, salary, currency: negotiation.currency.trim().toUpperCase(), status: "PendingApproval", compensationComponents: Object.fromEntries(Object.entries(negotiation.compensationComponents).filter(([, value]) => value !== "").map(([key, value]) => [key, Number(value)])), versionReason: negotiation.message.trim() || "Recruiter revision", idempotencyKey: createIdempotencyKey() } as RecruitmentOfferVersionCommand)); else saveResponse(await requestRecruitmentOfferCounter({ offerId, requestedSalary: salary, requestedCurrency: negotiation.currency.trim().toUpperCase(), message: negotiation.message.trim() || null, idempotencyKey: createIdempotencyKey() } as RecruitmentOfferCounterCommand)); }
      else if (mode === "privacy") { if (privacy.action === "Anonymize" && !privacy.reason.trim()) throw new Error("A reason is required before anonymization."); saveResponse(await applyRecruitmentCandidatePrivacy({ applicantId: applicant.applicantId, action: privacy.action, retentionDays: privacy.action === "Grant" && privacy.retentionDays !== "" ? Number(privacy.retentionDays) : undefined, reason: privacy.reason.trim() || null, idempotencyKey: createIdempotencyKey() })); }
      else if (mode === "decision") { if (["Hold", "Reject"].includes(decision.decision) && !decision.notes.trim()) throw new Error("Decision notes are required for Hold or Reject outcomes."); saveResponse(await upsertRecruitmentHiringDecision({ applicantId: applicant.applicantId, vacancyId: applicant.vacancyId, decision: decision.decision, notes: decision.notes.trim() || null, idempotencyKey: createIdempotencyKey() })); }
      else if (mode === "onboarding") { if (!onboarding) throw new Error("Onboarding case is not available. Complete preboarding handoff first."); const nextTasks = onboarding.tasks.map(task => ({ code: task.code, status: task.status })); const response = await updateRecruitmentOnboarding({ caseId: onboarding.caseId, status: onboarding.status, tasks: nextTasks, expectedVersion: onboarding.version, idempotencyKey: createIdempotencyKey() }); saveResponse(response); successMessage = response.data.message ?? successMessage; }
      else if (mode === "interview") { if (!interview.startsAtUtc || !interview.endsAtUtc) throw new Error("Start and end time are required."); if (!interview.panelistUserIds.trim()) throw new Error("Select at least one interviewer before scheduling."); if (new Date(interview.startsAtUtc).getTime() <= Date.now()) throw new Error("Scheduled interviews must start in the future."); saveResponse(await upsertRecruitmentInterview({ applicantId: applicant.applicantId, vacancyId: applicant.vacancyId, title: interview.title.trim(), roundNumber: interview.roundNumber, roundType: interview.roundType.trim() || null, startsAtUtc: new Date(interview.startsAtUtc).toISOString(), endsAtUtc: new Date(interview.endsAtUtc).toISOString(), location: interview.location.trim() || null, panelistUserIds: interview.panelistUserIds.split(",").map((id) => id.trim()).filter(Boolean), idempotencyKey: createIdempotencyKey(), status: "Scheduled" } as RecruitmentInterviewCommand)); }
      else if (mode === "offer") { const salary = Number(offer.salary); if (offerValidation) throw new Error(offerValidation); const offerResponse = await upsertRecruitmentOffer({ offerId: offer.offerId.trim() || undefined, applicantId: applicant.applicantId, vacancyId: applicant.vacancyId, salary, currency: offer.currency.trim().toUpperCase(), startDateUtc: offer.startDateUtc ? new Date(offer.startDateUtc).toISOString() : null, compensationComponents: Object.fromEntries(Object.entries(offer.compensationComponents).filter(([, value]) => value !== "").map(([key, value]) => [key, Number(value)])), approvalReference: offer.approvalReference.trim() || null, expiresAtUtc: offer.expiresAtUtc ? new Date(offer.expiresAtUtc).toISOString() : null, status: offer.status, idempotencyKey: createIdempotencyKey() }); saveResponse(offerResponse); const returnedOfferId = (offerResponse.data as any).methodResult; if (typeof returnedOfferId === "string" && returnedOfferId.trim()) { setOffer(current => ({ ...current, offerId: returnedOfferId.trim() })); setNegotiation(current => ({ ...current, offerId: returnedOfferId.trim() })); } }
      else if (mode === "handoff") {
        if (!handoff.employeeId.trim()) throw new Error("Employee ID is required.");
        if (preboardingCaseId) {
          await updateRecruitmentPreboarding({
            caseId: preboardingCaseId,
            status: preboardingTasks.every(t => t.status === "Completed" || t.status === "Skipped") ? "ReadyForHire" : "InProgress",
            tasks: preboardingTasks.map(t => ({ code: t.code, status: t.status })),
            idempotencyKey: createIdempotencyKey(),
          }).catch(() => undefined);
        }
        saveResponse(await handoffCandidateToPreboarding({
          applicantId: applicant.applicantId,
          idempotencyKey: createIdempotencyKey(),
          firstName: handoff.firstName.trim(),
          lastName: handoff.lastName.trim(),
          email: handoff.email.trim(),
          employeeId: handoff.employeeId.trim(),
          autoCompletePreboarding: handoff.autoCompletePreboarding,
        } as CandidateHandoffRequest));
      }
      else if (mode === "screening") { const score = Number(screening.score); if (!Number.isFinite(score) || score < 0 || score > 100) throw new Error("Enter a screening score from 0 to 100."); if (screening.decision === "Reject" && !screening.rejectionReason.trim()) throw new Error("A rejection reason is required."); saveResponse(await upsertRecruitmentScreening({ applicantId: applicant.applicantId, vacancyId: applicant.vacancyId, reviewerUserId, score, decision: screening.decision, rejectionReason: screening.rejectionReason.trim() || null, evidence: screening.evidence.trim() || null, criteria: screening.criteria, idempotencyKey: createIdempotencyKey() })); const nextStage = screening.decision === "Pass" ? "Shortlisted" : screening.decision === "Hold" ? "OnHold" : screening.decision === "Reject" ? "Rejected" : null; if (nextStage) await upsertRecruitmentApplicationStage({ applicantId: applicant.applicantId, vacancyId: applicant.vacancyId, stage: nextStage, reason: screening.rejectionReason.trim() || screening.evidence.trim() || null, idempotencyKey: createIdempotencyKey() } as RecruitmentApplicationStageCommand).catch(() => undefined); }
      else if (mode === "scorecard") {
        if (!scorecard.interviewId.trim()) throw new Error("Load a saved interview round before submitting its scorecard.");
        if (!scorecard.recommendation.trim()) throw new Error("Select an interviewer recommendation.");
        const effectiveReviewer = scorecard.reviewerUserId?.trim() || selectedInterviewerIds[0] || reviewerUserId;
        const scRes = await upsertRecruitmentScorecard({ scorecardId: scorecard.scorecardId || undefined, applicantId: applicant.applicantId, vacancyId: applicant.vacancyId, interviewId: scorecard.interviewId.trim(), reviewerUserId: effectiveReviewer, roundNumber: scorecard.roundNumber, recommendation: scorecard.recommendation.trim(), criteria: scorecard.criteria, status: scorecard.status, idempotencyKey: createIdempotencyKey() });
        saveResponse(scRes);
        const savedId = (scRes.data as any)?.methodResult;
        if (typeof savedId === "string" && savedId.trim()) setScorecard((current) => ({ ...current, scorecardId: savedId.trim() }));
        const refreshedCards = await getRecruitmentScorecards(applicant.applicantId, applicant.vacancyId).catch(() => undefined);
        if (refreshedCards?.data?.success && refreshedCards.data.methodResult) setSavedScorecards(refreshedCards.data.methodResult);
      }
      else if (mode === "talentpool") { if (!talentPool.poolName.trim()) throw new Error("Pool name is required."); saveResponse(await upsertRecruitmentTalentPool({ applicantId: applicant.applicantId, poolName: talentPool.poolName.trim(), tags: talentPool.tags.split(",").map((tag) => tag.trim()).filter(Boolean), notes: talentPool.notes.trim() || null, status: talentPool.status, idempotencyKey: createIdempotencyKey() })); }
      else { if (!merge.targetApplicantId.trim()) throw new Error("Target applicant ID is required."); if (merge.targetApplicantId.trim() === applicant.applicantId) throw new Error("Source and target applicants must be different."); saveResponse(await mergeRecruitmentApplicants({ sourceApplicantId: applicant.applicantId, targetApplicantId: merge.targetApplicantId.trim(), reason: merge.reason.trim() || null, idempotencyKey: createIdempotencyKey() } as RecruitmentApplicantMergeCommand)); }
      setFeedback({ severity: "success", text: successMessage }); onSaved?.();
    } catch (error) { const typed = error as Error & { code?: string }; const message = typed.message || "Unable to save."; if (mode === "decision" && stage === ApplicationStatus.Selected) setMode("offer"); else if (mode === "decision" && typed.code === "REC_INVALID_TRANSITION") { const lower = message.toLowerCase(); if (lower.includes("scorecard") || lower.includes("debrief")) setMode("scorecard"); else if (lower.includes("interview") || lower.includes("round")) setMode("interview"); } setFeedback({ severity: "error", text: message, code: typed.code }); } finally { setBusy(false); }
  };
  const selectedInterviewerIds = interview.panelistUserIds.split(",").map((id) => id.trim()).filter(Boolean);
  const visibleInterviewers = interviewers.filter((employee) => { const text = (employee.fullName + " " + (employee.employeeId ?? "") + " " + (employee.userId ?? "") + " " + (employee.email ?? "") + " " + Object.values(employee.jobRole ?? {}).join(" ")).toLowerCase(); const department = Object.values(employee.department ?? {}).join(" ").toLowerCase(); return (!interviewerQuery.trim() || text.includes(interviewerQuery.trim().toLowerCase())) && (!interviewerDepartment || department.includes(interviewerDepartment.toLowerCase())); }).slice(0, 12);
  const toggleInterviewer = (userId: string) => setInterview((current) => { const ids = current.panelistUserIds.split(",").map((id) => id.trim()).filter(Boolean); const next = ids.includes(userId) ? ids.filter((id) => id !== userId) : [...ids, userId]; return { ...current, panelistUserIds: next.join(", ") }; });
  const addScorecardCriterion = () => setScorecard(current => current.criteria.length >= 20 ? current : ({ ...current, criteria: [...current.criteria, { name: "", rating: 3, notes: "" }] }));
  const prepareNextRound = () => { const currentRound = interviewRounds.find((round) => round.roundNumber === interview.roundNumber); if (!currentRound || currentRound.status !== "Completed" || currentRound.debriefStatus !== "Complete") { setFeedback({ severity: "error", text: `Complete and debrief round ${interview.roundNumber} before preparing the next round.` }); return; } setInterview((current) => ({ ...current, roundNumber: Math.min(50, Math.max(1, current.roundNumber + 1)), startsAtUtc: "", endsAtUtc: "" })); setScorecard((current) => ({ ...current, interviewId: "" })); };
  const searchInterviewRounds = async () => { setInterviewSearchBusy(true); setFeedback(undefined); try { const response = await getRecruitmentInterviewRounds(applicant.applicantId, applicant.vacancyId); if (!response.data.success) throw new Error(response.data.message ?? "Unable to load interview rounds."); const rows = response.data.methodResult ?? []; setInterviewRounds(rows); const scorecardResponse = await getRecruitmentScorecards(applicant.applicantId, applicant.vacancyId); if (scorecardResponse.data.success) setSavedScorecards(scorecardResponse.data.methodResult ?? []); const latest = rows[0]; if (latest) { const latestPanelists: string[] = latest.panelistUserIds ?? []; const defaultReviewer = latestPanelists.includes(reviewerUserId) ? reviewerUserId : (latestPanelists[0] || reviewerUserId); setInterview((current) => ({ ...current, title: latest.title ?? current.title, roundNumber: latest.roundNumber ?? current.roundNumber, roundType: latest.roundType ?? current.roundType, startsAtUtc: latest.startsAtUtc ? dayjs(latest.startsAtUtc).format("YYYY-MM-DDTHH:mm") : current.startsAtUtc, endsAtUtc: latest.endsAtUtc ? dayjs(latest.endsAtUtc).format("YYYY-MM-DDTHH:mm") : current.endsAtUtc, location: latest.meetingUrl || latest.location || current.location, panelistUserIds: latestPanelists.join(", ") })); setScorecard((current) => ({ ...current, interviewId: latest.interviewId ?? current.interviewId, roundNumber: latest.roundNumber ?? current.roundNumber, reviewerUserId: defaultReviewer })); } setFeedback({ severity: "success", text: rows.length ? "Existing interview rounds loaded. The latest round is ready to review." : "No interview rounds found for this candidate." }); } catch (error) { setFeedback({ severity: "error", text: (error as Error).message }); } finally { setInterviewSearchBusy(false); } };
  const retryOnboardingActivation = async () => { if (!onboarding?.caseId) return; setBusy(true); setFeedback(undefined); try { const response = await retryRecruitmentOnboardingActivation(onboarding.caseId); saveResponse(response); setFeedback({ severity: "success", text: response.data.message ?? "Onboarding activation retry completed." }); const refreshed = await getRecruitmentOnboarding(applicant.applicantId); if (refreshed.data.success && refreshed.data.methodResult) setOnboarding(refreshed.data.methodResult); } catch (error) { const typed = error as Error & { code?: string }; setFeedback({ severity: "error", text: typed.message || "Unable to retry onboarding activation.", code: typed.code }); } finally { setBusy(false); } };  const retryCalendar = async () => { if (!scorecard.interviewId.trim()) return; setBusy(true); setFeedback(undefined); try { const response = await retryRecruitmentInterviewCalendar(scorecard.interviewId.trim()); saveResponse(response); setFeedback({ severity: "success", text: response.data.message ?? "Calendar retry completed." }); } catch (error) { const typed = error as Error & { code?: string }; setFeedback({ severity: "error", text: typed.message || "Unable to retry calendar sync.", code: typed.code }); } finally { setBusy(false); } };
  const completeInterview = async () => { if (!scorecard.interviewId.trim()) { setFeedback({ severity: "error", text: "Load a saved interview round before marking it complete." }); return; } setBusy(true); setFeedback(undefined); try { saveResponse(await upsertRecruitmentInterview({ interviewId: scorecard.interviewId.trim(), applicantId: applicant.applicantId, vacancyId: applicant.vacancyId, title: interview.title.trim(), roundNumber: interview.roundNumber, roundType: interview.roundType.trim() || null, startsAtUtc: new Date(interview.startsAtUtc).toISOString(), endsAtUtc: new Date(interview.endsAtUtc).toISOString(), location: interview.location.trim() || null, panelistUserIds: interview.panelistUserIds.split(",").map((id) => id.trim()).filter(Boolean), idempotencyKey: createIdempotencyKey(), status: "Completed" } as RecruitmentInterviewCommand)); setFeedback({ severity: "success", text: "Interview marked completed. Submit the scorecard next." }); onSaved?.(); } catch (error) { const typed = error as Error & { code?: string }; setFeedback({ severity: "error", text: typed.message || "Unable to complete interview.", code: typed.code }); } finally { setBusy(false); } };
  const completeDebrief = async () => { if (!scorecard.interviewId.trim()) { setFeedback({ severity: "error", text: "Interview ID is required to complete a debrief." }); return; } setBusy(true); setFeedback(undefined); try { saveResponse(await completeRecruitmentInterviewDebrief({ interviewId: scorecard.interviewId.trim(), decision: scorecard.debriefDecision, notes: scorecard.criteria[0].notes || null, idempotencyKey: createIdempotencyKey() } as RecruitmentInterviewDebriefCommand)); const refreshedRounds = await getRecruitmentInterviewRounds(applicant.applicantId, applicant.vacancyId).catch(() => undefined); if (refreshedRounds?.data?.success && refreshedRounds.data.methodResult) setInterviewRounds(refreshedRounds.data.methodResult); setFeedback({ severity: "success", text: "Interview debrief completed." }); onSaved?.(); } catch (error) { const typed = error as Error & { code?: string }; setFeedback({ severity: "error", text: typed.message || "Unable to complete debrief.", code: typed.code }); } finally { setBusy(false); } };
  const [showResumePreview, setShowResumePreview] = useState(false);
  const theme = useTheme();
  const isDesktopSplit = useMediaQuery(theme.breakpoints.up("md"));
  const showSplitResumePane = showResumePreview && isDesktopSplit && Boolean(applicant.resumeUrl);
  const fieldSx = { "& .MuiOutlinedInput-root": { borderRadius: 2, bgcolor: "background.paper" } };
  const initials = ((applicant.firstName?.[0] ?? "") + (applicant.lastName?.[0] ?? "")).toUpperCase() || "CA";
  return <>
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      aria-labelledby="recruitment-lifecycle-title"
      PaperProps={{
        sx: {
          width: {
            xs: "100vw",
            sm: 540,
            md: showSplitResumePane ? 980 : 580,
            lg: showSplitResumePane ? 1140 : 620,
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
        {/* Candidate Header Bar using shared CustomIconButton and StyleStatus */}
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
            <Avatar sx={{ width: 42, height: 42, fontWeight: 800, bgcolor: "primary.main", color: "primary.contrastText" }}>{initials}</Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography id="recruitment-lifecycle-title" variant="subtitle1" fontWeight={850} noWrap>{applicant.firstName} {applicant.lastName}</Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">{applicant.vacancyName || "Candidate Application"} · {applicant.email}</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
            {applicant.resumeUrl && (
              <CustomIconButton
                icon={showResumePreview ? <Close /> : <Visibility />}
                tooltip={showResumePreview ? "Hide CV" : "View CV"}
                ariaLabel={showResumePreview ? "Hide CV" : "View CV"}
                handleClick={() => setShowResumePreview((v) => !v)}
                toolbar
              />
            )}
            <StyleStatus
              label={applicationStatusMapper[stage]}
              className={clsx({
                info: stage === ApplicationStatus.New,
                warning: [
                  ApplicationStatus.InProgress,
                  ApplicationStatus.OnHold,
                  ApplicationStatus.Shortlisted,
                ].includes(stage),
                success: stage === ApplicationStatus.Selected,
                danger: stage === ApplicationStatus.Rejected,
              })}
            />
          </Stack>
        </Stack>

        {/* Responsive Workspace Grid: Side-by-side Split on Desktop (md+), Single Column on Mobile */}
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
          {/* Left Column (Desktop Split View): Dedicated Scrollable CV Container (Zero Stepper Overlap) */}
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
                <CustomisedButton
                  size="small"
                  variant="outlined"
                  label="Hide CV"
                  handleClick={() => setShowResumePreview(false)}
                />
              </Stack>
              <Box
                sx={{
                  flex: "1 1 auto",
                  minHeight: 0,
                  overflow: "auto",
                  borderRadius: 1.5,
                  bgcolor: "background.paper",
                  "& .react-pdf__Document": { display: "flex", justifyContent: "center" },
                  "& .react-pdf__Page": { maxWidth: "100% !important", overflow: "hidden" },
                  "& .react-pdf__Page__canvas": { maxWidth: "100% !important", height: "auto !important" },
                }}
              >
                <PdfViewer pdfUrl={applicant.resumeUrl ?? ""} />
              </Box>
            </Stack>
          )}

          {/* Right Column: Stepper + Tools + Scrollable Form + Shared Action Buttons */}
          <Stack spacing={{ xs: 1.25, sm: 1.5 }} sx={{ height: "100%", minHeight: 0, minWidth: 0, overflow: "hidden" }}>
            <Box sx={{ flex: "0 0 auto", p: { xs: 1, sm: 1.5 }, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover" }}><Stepper activeStep={activeStep} alternativeLabel sx={{ "& .MuiStepLabel-label": { fontSize: { xs: ".65rem", sm: ".75rem" }, mt: .5 }, "& .MuiStepConnector-line": { borderColor: "divider" } }}>{primarySteps.map((item, index) => { const enabled = isActionEnabled(item.id) && (index <= completedStep + 1 || index === activeStep); return <Step key={item.id} completed={index <= completedStep}><StepLabel error={!enabled && index === completedStep + 1} onClick={() => enabled && (setMode(item.id), setFeedback(undefined))} sx={{ cursor: enabled ? "pointer" : "not-allowed" }}>{item.label}<Typography component="span" variant="caption" sx={{ display: { xs: "none", sm: "block" }, color: "text.secondary" }}>{item.helper}</Typography></StepLabel></Step>; })}</Stepper><Stack direction="row" justifyContent="space-between" sx={{ mt: 1, gap: 1 }}><Chip size="small" label={"Current: " + (ApplicationStatus[stage] ?? "Unknown")} color="primary" variant="outlined" /><Typography variant="caption" color="text.secondary" sx={{ alignSelf: "center" }}>Complete the active step to unlock the next one.</Typography></Stack></Box><Divider /><Box sx={{ flex: "0 0 auto" }}><Typography variant="overline" color="text.secondary" sx={{ letterSpacing: ".08em" }}>Additional tools</Typography><Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", sm: "repeat(3, minmax(0, 1fr))" }, gap: .75, mt: .5 }}>{utilityModes.map((item) => <AppButton key={item.id} size="small" variant={mode === item.id ? "contained" : "outlined"} disabled={!isActionEnabled(item.id)} onClick={() => { setMode(item.id); setFeedback(undefined); }} sx={{ minWidth: 0, minHeight: 36, px: .75, borderRadius: 1.5, whiteSpace: "normal", lineHeight: 1.15, fontSize: { xs: ".68rem", sm: ".75rem" }, "&.Mui-disabled": { color: "text.secondary", borderColor: "divider", opacity: .75 } }}>{item.label}</AppButton>)}</Box></Box>
            <Box sx={{ flex: "1 1 auto", minHeight: 0, overflowY: "auto", overflowX: "hidden", pr: { xs: .25, sm: .75 } }}><Stack spacing={1.5} sx={{ minWidth: 0 }}>
              {mode === "screening" && <Stack spacing={1.5}><Typography variant="body2" color="text.secondary">Record a consistent first-pass review against explicit evidence before scheduling interviews.</Typography><AppTextField sx={fieldSx} label="Screening score (0–100)" type="number" value={screening.score} onChange={(event) => setScreening({ ...screening, score: Number(event.target.value) })} inputProps={{ min: 0, max: 100, step: 1 }} /><AppTextField sx={fieldSx} select label="Decision" value={screening.decision} onChange={(event) => setScreening({ ...screening, decision: event.target.value as RecruitmentScreeningReviewCommand["decision"] })}>{["Pending", "Pass", "Hold", "Reject"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField>{screening.criteria.map((criterion, index) => <Box key={`${criterion.name}-${index}`} sx={{ p: 1.25, border: 1, borderColor: "divider", borderRadius: 1.5 }}><Typography variant="caption" color="text.secondary">Criterion {index + 1}</Typography><Typography fontWeight={700}>{criterion.name}</Typography><Stack direction="row" alignItems="center" justifyContent="space-between"><Typography variant="body2">Evidence passed</Typography><AppSwitch checked={criterion.passed} onChange={(event) => setScreening(current => ({ ...current, criteria: current.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, passed: event.target.checked } : item) }))} /></Stack><AppTextField sx={{ ...fieldSx, mt: 1 }} label="Notes" value={criterion.notes ?? ""} onChange={(event) => setScreening(current => ({ ...current, criteria: current.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, notes: event.target.value } : item) }))} /></Box>)}<AppTextField sx={fieldSx} multiline minRows={2} label="Evidence" value={screening.evidence} onChange={(event) => setScreening({ ...screening, evidence: event.target.value })} /><AppTextField sx={fieldSx} multiline minRows={2} label="Rejection reason" value={screening.rejectionReason} onChange={(event) => setScreening({ ...screening, rejectionReason: event.target.value })} required={screening.decision === "Reject"} /></Stack>}
              {mode === "interview" && <Stack spacing={1.5}><Alert severity={interviewValidation ? "warning" : "info"}>{interviewValidation ?? "Choose a future slot; calendar sync and interviewer invitations happen after saving."}</Alert><AppTextField sx={fieldSx} label="Title" value={interview.title} onChange={(event) => setInterview({ ...interview, title: event.target.value })} /><Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch"><AppTextField sx={{ ...fieldSx, flex: 1 }} label="Interview ID (for debrief / calendar retry)" value={scorecard.interviewId} onChange={(event) => setScorecard({ ...scorecard, interviewId: event.target.value })} placeholder="Paste the scheduled interview ID" /><Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flex: { sm: 1 } }}><AppButton variant="outlined" onClick={() => void searchInterviewRounds()} disabled={busy || interviewSearchBusy} sx={{ flex: 1, alignSelf: { xs: "stretch", sm: "center" } }}>{interviewSearchBusy ? "Searching…" : "Search rounds"}</AppButton><AppButton variant="outlined" onClick={() => void retryCalendar()} disabled={busy || !scorecard.interviewId.trim()} sx={{ flex: 1, alignSelf: { xs: "stretch", sm: "center" } }}>Retry calendar</AppButton></Stack></Stack><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><AppTextField sx={{ ...fieldSx, flex: 1 }} label="Round" type="number" value={interview.roundNumber} onChange={(event) => setInterview({ ...interview, roundNumber: Math.max(1, Number(event.target.value) || 1) })} inputProps={{ min: 1, max: 20 }} /><AppTextField sx={{ ...fieldSx, flex: 2 }} label="Round type" value={interview.roundType} onChange={(event) => setInterview({ ...interview, roundType: event.target.value })} placeholder="Technical, HR, panel" /></Stack><CustomisedDateTimePicker label="Starts" value={interview.startsAtUtc ? dayjs(interview.startsAtUtc) : null} minDateTime={dayjs()} onChange={(value) => changeDate("startsAtUtc", value)} slotProps={{ textField: { fullWidth: true, sx: fieldSx, size: "small" } }} /><CustomisedDateTimePicker label="Ends" value={interview.endsAtUtc ? dayjs(interview.endsAtUtc) : null} disabled={!interview.startsAtUtc} minDateTime={interview.startsAtUtc ? dayjs(interview.startsAtUtc).add(1, "minute") : dayjs()} onChange={(value) => changeDate("endsAtUtc", value)} slotProps={{ textField: { fullWidth: true, sx: fieldSx, size: "small", helperText: interview.startsAtUtc ? "Must be after the start time." : "Select a start time first." } }} /><AppTextField sx={fieldSx} label="Location or meeting URL" value={interview.location} onChange={(event) => setInterview({ ...interview, location: event.target.value })} />{interviewRounds.length > 0 && <Typography variant="caption" color="text.secondary">Loaded rounds: {interviewRounds.map((round) => "Round " + round.roundNumber + " · " + round.status).join("  |  ")}</Typography>}<Stack spacing={1} sx={{ p: 1.25, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover" }}><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><AppTextField sx={{ ...fieldSx, flex: 2 }} label="Search interviewer" placeholder="Name, employee ID, user ID or email" value={interviewerQuery} onChange={(event) => setInterviewerQuery(event.target.value)} /><AppTextField sx={{ ...fieldSx, flex: 1 }} select label="Department" value={interviewerDepartment} onChange={(event) => setInterviewerDepartment(event.target.value)}><MenuItem value="">All departments</MenuItem>{departments.map((department) => <MenuItem key={department.departmentId} value={Object.values(department.titles ?? {})[0] ?? department.departmentId}>{Object.values(department.titles ?? {})[0] ?? department.departmentId}</MenuItem>)}</AppTextField></Stack><Typography variant="caption" color="text.secondary">Search results show active employees only. Selected: {selectedInterviewerIds.length}</Typography><Stack spacing={.5} sx={{ maxHeight: 180, overflowY: "auto" }}>{visibleInterviewers.map((employee) => { const selected = selectedInterviewerIds.includes(employee.userId); return <AppButton key={employee.userId} size="small" variant={selected ? "contained" : "outlined"} onClick={() => toggleInterviewer(employee.userId)} sx={{ justifyContent: "flex-start", textAlign: "left", minHeight: 38 }}>{employee.fullName || employee.email || employee.userId} · {employee.employeeId || employee.userId}{employee.department ? " · " + Object.values(employee.department).join(" ") : ""}</AppButton>; })}{!visibleInterviewers.length && <Typography variant="caption" color="text.secondary">No active employees match this search.</Typography>}</Stack></Stack></Stack>}
              {mode === "offer" && <><AppTextField sx={fieldSx} label="Offer ID" value={offer.offerId} onChange={(event) => setOffer({ ...offer, offerId: event.target.value })} helperText="Automatically populated after the first save; keep it for revisions." /><Alert severity="info">Create the candidate offer after selection. Draft offers can be prepared now; Approved or Sent offers require an approval reference unless Offer Approval Gate is disabled in Settings.</Alert><Alert severity="success">Estimated total CTC: {offer.currency.trim().toUpperCase() || "—"} {offerComponentTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}</Alert><AppTextField sx={fieldSx} label="Salary" type="number" value={offer.salary} onChange={(event) => setOffer({ ...offer, salary: event.target.value })} inputProps={{ min: 0, step: "any" }} /><AppTextField sx={fieldSx} label="Currency" value={offer.currency} onChange={(event) => setOffer({ ...offer, currency: event.target.value.toUpperCase() })} /><Typography variant="subtitle2" fontWeight={800}>Compensation components</Typography>{Object.entries(offer.compensationComponents).map(([name, value]) => <AppTextField key={name} sx={fieldSx} label={name} type="number" value={value} onChange={(event) => setOffer(current => ({ ...current, compensationComponents: { ...current.compensationComponents, [name]: event.target.value } }))} inputProps={{ min: 0, step: "any" }} />)}<CustomisedDatePicker label="Start date (planned joining)" value={offer.startDateUtc ? dayjs(offer.startDateUtc) : null} minDate={dayjs().startOf("day")} setValue={(value) => setOffer({ ...offer, startDateUtc: value?.format("YYYY-MM-DD") ?? "" })} sx={fieldSx} /><CustomisedDateTimePicker label="Offer expiry" value={offer.expiresAtUtc ? dayjs(offer.expiresAtUtc) : null} minDateTime={dayjs()} onChange={(value) => setOffer({ ...offer, expiresAtUtc: value?.format("YYYY-MM-DDTHH:mm") ?? "" })} slotProps={{ textField: { fullWidth: true, sx: fieldSx, size: "small", helperText: "Candidate response links expire after this time." } }} /> <AppTextField sx={fieldSx} label="Approval reference" helperText={["Approved", "Sent", "Accepted"].includes(offer.status) ? "Required before approving or sending (in Standard/Enterprise mode)." : "Optional in Startup mode."} value={offer.approvalReference} onChange={(event) => setOffer({ ...offer, approvalReference: event.target.value })} /><AppTextField sx={fieldSx} select label="Status" value={offer.status} onChange={(event) => setOffer({ ...offer, status: event.target.value as RecruitmentOfferCommand["status"] })}>{["Draft", "PendingApproval", "Approved", "Sent", "Accepted", "Declined"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField></>}
              {mode === "resume" && <Stack spacing={1.5}><Typography variant="body2" color="text.secondary">Review advisory extraction only. Nothing is applied to the candidate automatically.</Typography><AppTextField sx={fieldSx} select label="Review decision" value={resumeReview.decision} onChange={(event) => setResumeReview({ ...resumeReview, decision: event.target.value as RecruitmentResumeExtractionReviewCommand["decision"] })}>{["Pending", "Approved", "Rejected"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField><AppTextField sx={fieldSx} multiline minRows={5} label="Extracted fields" helperText="One field per line, for example: skills: C#, React" value={resumeReview.fieldsText} onChange={(event) => setResumeReview({ ...resumeReview, fieldsText: event.target.value })} /><AppTextField sx={fieldSx} multiline minRows={2} label="Reviewer notes" value={resumeReview.notes} onChange={(event) => setResumeReview({ ...resumeReview, notes: event.target.value })} /></Stack>}
              {mode === "negotiation" && <Stack spacing={1.5}><Typography variant="body2" color="text.secondary">Create a versioned offer revision or submit a candidate counter request.</Typography><AppButton variant="outlined" onClick={() => void loadOfferVersions()} disabled={versionsBusy}>{versionsBusy ? "Loading revisions…" : "Load revision history"}</AppButton>{<AppButton variant="outlined" onClick={() => void loadCounterRequests()} disabled={versionsBusy}>{versionsBusy ? "Loading counters…" : "Load counter requests"}</AppButton>}{counterRequests.length > 0 && <Stack spacing={.75} sx={{ p: 1, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover", maxHeight: 180, overflowY: "auto" }}><Typography variant="caption" fontWeight={700}>Counter-offer history</Typography>{counterRequests.map((counter) => <Stack key={counter.counterRequestId} direction="row" justifyContent="space-between" gap={1}><Typography variant="caption">Round {counter.negotiationRound} · {counter.status}</Typography><Typography variant="caption" color="text.secondary">{counter.requestedCurrency} {counter.requestedSalary}</Typography></Stack>)}</Stack>}{offerVersions.length > 0 && <Stack spacing={.75} sx={{ p: 1, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover", maxHeight: 180, overflowY: "auto" }}><Typography variant="caption" fontWeight={700}>Offer revision history</Typography>{offerVersions.map((version) => <Stack key={version.offerVersionId} direction="row" justifyContent="space-between" gap={1}><Typography variant="caption">v{version.versionNumber} · {version.status}</Typography><Typography variant="caption" color="text.secondary">{version.currency} {version.totalCtc ?? version.salary}</Typography></Stack>)}</Stack>}<AppTextField sx={fieldSx} label="Offer ID" value={negotiation.offerId} onChange={(event) => setNegotiation({ ...negotiation, offerId: event.target.value })} required /><AppTextField sx={fieldSx} select label="Negotiation action" value={negotiation.action} onChange={(event) => setNegotiation({ ...negotiation, action: event.target.value as typeof negotiation.action })}><MenuItem value="Version">Create offer version</MenuItem><MenuItem value="Counter">Request candidate counter</MenuItem></AppTextField><AppTextField sx={fieldSx} label="Salary" type="number" value={negotiation.salary} onChange={(event) => setNegotiation({ ...negotiation, salary: event.target.value })} inputProps={{ min: 0, step: "any" }} required /><AppTextField sx={fieldSx} label="Currency" value={negotiation.currency} onChange={(event) => setNegotiation({ ...negotiation, currency: event.target.value.toUpperCase() })} />{negotiation.action === "Version" && <>{Object.entries(negotiation.compensationComponents).map(([name, value]) => <AppTextField key={name} sx={fieldSx} label={name} type="number" value={value} onChange={(event) => setNegotiation(current => ({ ...current, compensationComponents: { ...current.compensationComponents, [name]: event.target.value } }))} inputProps={{ min: 0, step: "any" }} />)}</>}<AppTextField sx={fieldSx} multiline minRows={2} label="Message / version reason" value={negotiation.message} onChange={(event) => setNegotiation({ ...negotiation, message: event.target.value })} /></Stack>}
              {mode === "privacy" && <Stack spacing={1.5}><Typography variant="body2" color="text.secondary">Record consent or anonymize candidate personal data while preserving the audit trail.</Typography><AppTextField sx={fieldSx} select label="Privacy action" value={privacy.action} onChange={(event) => setPrivacy({ ...privacy, action: event.target.value as RecruitmentCandidatePrivacyCommand["action"] })}>{["Grant", "Revoke", "Anonymize"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField><AppTextField sx={fieldSx} label="Retention override (days)" type="number" value={privacy.retentionDays} onChange={(event) => setPrivacy({ ...privacy, retentionDays: event.target.value === "" ? "" : Math.max(30, Math.min(3650, Number(event.target.value) || 30)) })} disabled={privacy.action !== "Grant"} inputProps={{ min: 30, max: 3650, step: 1 }} helperText="Leave blank to use the company privacy policy." /><AppTextField sx={fieldSx} multiline minRows={3} label="Reason" value={privacy.reason} onChange={(event) => setPrivacy({ ...privacy, reason: event.target.value })} required={privacy.action === "Anonymize"} /></Stack>}
              {mode === "decision" && <Stack spacing={1.5}><Alert severity="info">Approval becomes available only after every scheduled interview is marked completed and has a submitted scorecard plus debrief (unless disabled in Startup mode).</Alert><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><AppButton variant="outlined" onClick={() => setMode("interview")} sx={{ flex: 1 }}>Review interviews</AppButton><AppButton variant="outlined" onClick={() => setMode("scorecard")} sx={{ flex: 1 }}>Open scorecards</AppButton></Stack><Typography variant="body2" color="text.secondary">Record the final hiring decision after interview review or resume screening.</Typography><AppTextField sx={fieldSx} select label="Decision" value={decision.decision} onChange={(event) => setDecision({ ...decision, decision: event.target.value as RecruitmentHiringDecisionCommand["decision"] })}>{["Approve", "Hold", "Reject"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField><AppTextField sx={fieldSx} multiline minRows={3} label="Decision notes" value={decision.notes} onChange={(event) => setDecision({ ...decision, notes: event.target.value })} /></Stack>}
              {mode === "onboarding" && <Stack spacing={1.5}><Typography variant="body2" color="text.secondary">Track the employee activation work created by the preboarding handoff.</Typography>{onboarding ? <><Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch"><Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>Completed onboarding activates the linked employee. If the downstream employee update was unavailable, retry it here.</Typography><AppButton variant="outlined" onClick={() => void retryOnboardingActivation()} disabled={busy || onboarding.status !== "Completed"} sx={{ alignSelf: { xs: "stretch", sm: "center" } }}>Retry activation</AppButton></Stack><AppTextField sx={fieldSx} select label="Case status" value={onboarding.status} onChange={(event) => setOnboarding({ ...onboarding, status: event.target.value as RecruitmentOnboardingCase["status"] })}>{["PendingActivation", "InProgress", "Completed"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField>{onboarding.tasks.map((task, index) => <Stack key={task.code} direction="row" spacing={1} alignItems="center"><Typography variant="body2" sx={{ flex: 1 }}>{task.title}</Typography><AppTextField sx={{ ...fieldSx, width: 160 }} select label="Task status" value={task.status} onChange={(event) => setOnboarding({ ...onboarding, tasks: onboarding.tasks.map((item, taskIndex) => taskIndex === index ? { ...item, status: event.target.value as typeof item.status } : item) })}>{["Pending", "InProgress", "Completed", "Skipped"].map(value => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField></Stack>)}</> : <Alert severity="info">No onboarding case exists yet. Complete the Preboarding handoff first.</Alert>}</Stack>}
              {mode === "handoff" && <Stack spacing={1.5}><Box sx={{ p: 1.5, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover" }}><Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}><Typography variant="subtitle2" fontWeight={700}>Preboarding readiness checklist</Typography><Stack direction="row" alignItems="center" spacing={1}><Typography variant="caption" color="text.secondary">Auto-verify on handoff</Typography><AppSwitch checked={handoff.autoCompletePreboarding} onChange={(event) => setHandoff({ ...handoff, autoCompletePreboarding: event.target.checked })} /></Stack></Stack>{preboardingTasks.map((task, index) => <Stack key={task.code} direction="row" spacing={1} alignItems="center" sx={{ mb: .75 }}><Typography variant="body2" sx={{ flex: 1 }}>{task.title}</Typography><AppTextField sx={{ ...fieldSx, width: 150 }} select label="Status" value={task.status} onChange={(event) => setPreboardingTasks((current) => current.map((item, idx) => idx === index ? { ...item, status: event.target.value as typeof item.status } : item))}>{["Pending", "InProgress", "Completed", "Skipped"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField></Stack>)}</Box><AppTextField sx={fieldSx} label="First name" value={handoff.firstName} onChange={(event) => setHandoff({ ...handoff, firstName: event.target.value })} required /><AppTextField sx={fieldSx} label="Last name" value={handoff.lastName} onChange={(event) => setHandoff({ ...handoff, lastName: event.target.value })} required /><AppTextField sx={fieldSx} label="Email" type="email" value={handoff.email} onChange={(event) => setHandoff({ ...handoff, email: event.target.value })} required /><AppTextField sx={fieldSx} label="Employee ID" value={handoff.employeeId} onChange={(event) => setHandoff({ ...handoff, employeeId: event.target.value })} required /></Stack>}
              {mode === "scorecard" && <><Typography variant="body2" color="text.secondary">Enter a manual score for each interview criterion. Scores are saved with the assigned interviewer and application history.</Typography>{interviewRounds.length > 0 && <Stack spacing={.75} sx={{ p: 1, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover" }}><Typography variant="caption" fontWeight={700}>Interview rounds requiring action</Typography>{interviewRounds.map((round) => { const pending = round.status !== "Completed" || round.debriefStatus !== "Complete"; const roundPanelists: string[] = round.panelistUserIds ?? []; const nextReviewer = roundPanelists.includes(reviewerUserId) ? reviewerUserId : (roundPanelists[0] || reviewerUserId); return <AppButton key={round.interviewId} size="small" variant={scorecard.interviewId === round.interviewId ? "contained" : "outlined"} color={pending ? "warning" : "success"} onClick={() => { setScorecard((current) => ({ ...current, scorecardId: "", interviewId: round.interviewId, roundNumber: round.roundNumber, reviewerUserId: nextReviewer })); setInterview((current) => ({ ...current, title: round.title ?? current.title, roundNumber: round.roundNumber ?? current.roundNumber, roundType: round.roundType ?? current.roundType, startsAtUtc: round.startsAtUtc ? dayjs(round.startsAtUtc).format("YYYY-MM-DDTHH:mm") : current.startsAtUtc, endsAtUtc: round.endsAtUtc ? dayjs(round.endsAtUtc).format("YYYY-MM-DDTHH:mm") : current.endsAtUtc, panelistUserIds: roundPanelists.join(", ") })); }} sx={{ justifyContent: "space-between", textAlign: "left", minHeight: 38 }}>{"Round " + round.roundNumber + " · " + (round.title ?? "Interview") + (pending ? " · Needs completion/debrief" : " · Completed")}</AppButton>; })}</Stack>}{savedScorecards.length > 0 && <Stack spacing={.75} sx={{ p: 1, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "action.hover" }}><Typography variant="caption" fontWeight={700}>Saved scores by round (click to load/edit)</Typography>{savedScorecards.map((card) => <AppButton key={card.scorecardId} size="small" variant="outlined" onClick={() => setScorecard((current) => ({ ...current, scorecardId: card.scorecardId || "", interviewId: card.interviewId || current.interviewId, roundNumber: card.roundNumber || current.roundNumber, reviewerUserId: card.reviewerUserId || current.reviewerUserId, recommendation: card.recommendation || current.recommendation, status: (card.status as RecruitmentScorecardCommand["status"]) || current.status, criteria: Array.isArray(card.criteria) && card.criteria.length > 0 ? card.criteria : current.criteria }))} sx={{ justifyContent: "space-between", textAlign: "left", minHeight: 34 }}><span>Round {card.roundNumber} · {card.reviewerUserId}</span><span>{card.criteria?.map((criterion: any) => criterion.rating).join(" / ")} · {card.status}</span></AppButton>)}</Stack>}<Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch"><AppTextField sx={{ ...fieldSx, flex: 1 }} label="Interview ID (for debrief / calendar retry)" value={scorecard.interviewId} onChange={(event) => setScorecard({ ...scorecard, interviewId: event.target.value })} placeholder="Paste the scheduled interview ID" /><Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flex: { sm: 1 } }}><AppButton variant="outlined" onClick={() => void searchInterviewRounds()} disabled={busy || interviewSearchBusy} sx={{ flex: 1, alignSelf: { xs: "stretch", sm: "center" } }}>{interviewSearchBusy ? "Searching…" : "Search rounds"}</AppButton><AppButton variant="outlined" onClick={() => void retryCalendar()} disabled={busy || !scorecard.interviewId.trim()} sx={{ flex: 1, alignSelf: { xs: "stretch", sm: "center" } }}>Retry calendar</AppButton></Stack></Stack><AppTextField sx={fieldSx} select={selectedInterviewerIds.length > 0} label="Assigned interviewer / panelist" value={scorecard.reviewerUserId || selectedInterviewerIds[0] || reviewerUserId} onChange={(event) => setScorecard({ ...scorecard, scorecardId: "", reviewerUserId: event.target.value })} helperText="Select which assigned panelist's scorecard is being recorded.">{selectedInterviewerIds.map((id) => { const emp = interviewers.find((e) => e.userId === id); return <MenuItem key={id} value={id}>{emp ? `${emp.fullName || emp.email || id} (${id})` : id}</MenuItem>; })}</AppTextField><Stack direction={{ xs: "column", sm: "row" }} spacing={1}><AppTextField sx={{ ...fieldSx, flex: 1 }} label="Round" type="number" value={scorecard.roundNumber} onChange={(event) => setScorecard({ ...scorecard, roundNumber: Math.max(1, Number(event.target.value) || 1) })} inputProps={{ min: 1, max: 20 }} /><AppTextField sx={{ ...fieldSx, flex: 2 }} select label="Recommendation" value={scorecard.recommendation} onChange={(event) => { const nextRec = event.target.value; const nextDebrief = nextRec === "No Hire" ? "Reject" : nextRec === "Hold" ? "Hold" : "Advance"; setScorecard({ ...scorecard, recommendation: nextRec, debriefDecision: nextDebrief as RecruitmentInterviewDebriefCommand["decision"] }); }}>{["Strong Hire", "Hire", "Hold", "No Hire"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField></Stack>{scorecard.criteria.map((criterion, index) => <Stack key={`${index}-${criterion.name}`} spacing={1}><AppTextField sx={fieldSx} label={`Criterion ${index + 1}`} value={criterion.name} onChange={(event) => setScorecard(current => ({ ...current, criteria: current.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item) }))} required /><AppTextField sx={fieldSx} label="Manual score (1–5)" type="number" value={criterion.rating} onChange={(event) => setScorecard(current => ({ ...current, criteria: current.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, rating: Math.max(1, Math.min(5, Number(event.target.value) || 0)) } : item) }))} inputProps={{ min: 1, max: 5, step: 1 }} helperText="Enter a whole number from 1 to 5." /><AppTextField sx={fieldSx} multiline minRows={2} label="Notes / evidence" value={criterion.notes ?? ""} onChange={(event) => setScorecard(current => ({ ...current, criteria: current.criteria.map((item, itemIndex) => itemIndex === index ? { ...item, notes: event.target.value } : item) }))} /></Stack>)}<AppButton variant="outlined" onClick={addScorecardCriterion} disabled={scorecard.criteria.length >= 20}>Add criterion</AppButton><AppTextField sx={fieldSx} select label="Debrief decision" value={scorecard.debriefDecision} onChange={(event) => setScorecard({ ...scorecard, debriefDecision: event.target.value as RecruitmentInterviewDebriefCommand["decision"] })}><MenuItem value="Advance">Advance</MenuItem><MenuItem value="Hold">Hold</MenuItem><MenuItem value="Reject">Reject</MenuItem></AppTextField><AppTextField sx={fieldSx} select label="Review status" value={scorecard.status} onChange={(event) => setScorecard({ ...scorecard, status: event.target.value as RecruitmentScorecardCommand["status"] })}>{["Draft", "Submitted", "Locked"].map((value) => <MenuItem key={value} value={value}>{value}</MenuItem>)}</AppTextField></>}
              {mode === "talentpool" && <><AppTextField sx={fieldSx} label="Pool name" value={talentPool.poolName} onChange={(event) => setTalentPool({ ...talentPool, poolName: event.target.value })} /><AppTextField sx={fieldSx} label="Tags" placeholder="senior, frontend, future-hire" helperText="Separate tags with commas" value={talentPool.tags} onChange={(event) => setTalentPool({ ...talentPool, tags: event.target.value })} /><AppTextField sx={fieldSx} multiline minRows={3} label="Notes" value={talentPool.notes} onChange={(event) => setTalentPool({ ...talentPool, notes: event.target.value })} /><AppTextField sx={fieldSx} select label="Status" value={talentPool.status} onChange={(event) => setTalentPool({ ...talentPool, status: event.target.value as RecruitmentTalentPoolCommand["status"] })}><MenuItem value="Active">Active</MenuItem><MenuItem value="Archived">Archived</MenuItem></AppTextField></>}
              {mode === "merge" && <><Alert severity="warning">The source applicant stays in audit history after merge. Confirm the target applicant carefully.</Alert><AppTextField sx={fieldSx} label="Target applicant ID" placeholder="Paste the existing applicant ID" value={merge.targetApplicantId} onChange={(event) => setMerge({ ...merge, targetApplicantId: event.target.value })} /><AppTextField sx={fieldSx} multiline minRows={3} label="Reason" value={merge.reason} onChange={(event) => setMerge({ ...merge, reason: event.target.value })} /></>}
              {feedback && <Alert severity={feedback.severity}>{feedback.code ? `${feedback.code}: ` : ""}{feedback.text}</Alert>}
            </Stack></Box>
            <Stack direction={{ xs: "column-reverse", sm: "row" }} spacing={1} justifyContent="flex-end" sx={{ flex: "0 0 auto", pt: 1, borderTop: 1, borderColor: "divider" }}>
              {mode === "interview" && (
                <>
                  <CustomisedButton variant="outlined" label={interviewSearchBusy ? "Loading rounds…" : "Load saved rounds"} handleClick={() => void searchInterviewRounds()} disabled={busy || interviewSearchBusy} sx={{ width: { xs: "100%", sm: "auto" } }} />
                  <CustomisedButton variant="outlined" label="Next round" handleClick={prepareNextRound} disabled={busy} sx={{ width: { xs: "100%", sm: "auto" } }} />
                  <CustomisedButton variant="outlined" label="Mark completed" handleClick={() => void completeInterview()} disabled={busy || !scorecard.interviewId.trim() || Boolean(interviewValidation)} sx={{ width: { xs: "100%", sm: "auto" } }} />
                </>
              )}
              {mode === "scorecard" && (
                <CustomisedButton variant="outlined" label="Complete debrief" handleClick={completeDebrief} disabled={busy || !scorecard.interviewId.trim()} sx={{ width: { xs: "100%", sm: "auto" } }} />
              )}
              <CustomisedButton variant="outlined" label="Close" handleClick={onClose} disabled={busy} sx={{ width: { xs: "100%", sm: "auto" } }} />
              <CustomisedButton variant="contained" label={busy ? "Saving…" : "Save"} loading={busy} handleClick={submit} disabled={busy || (mode === "interview" && Boolean(interviewValidation)) || (mode === "offer" && Boolean(offerValidation))} sx={{ width: { xs: "100%", sm: "auto" } }} />
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </Drawer>
    {showResumePreview && !isDesktopSplit && (
      <ApplicationPreview
        open={showResumePreview}
        handleClose={() => setShowResumePreview(false)}
        applicantData={applicant}
      />
    )}
  </>;
};
























