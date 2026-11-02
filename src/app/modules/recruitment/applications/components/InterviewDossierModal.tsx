import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Rating,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from "@mui/material";
import CheckCircle from "@mui/icons-material/CheckCircle";
import Close from "@mui/icons-material/Close";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import Launch from "@mui/icons-material/Launch";
import PictureAsPdf from "@mui/icons-material/PictureAsPdf";
import Videocam from "@mui/icons-material/Videocam";
import WorkOutline from "@mui/icons-material/WorkOutline";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import Edit from "@mui/icons-material/Edit";
import { getAllEmployees } from "../../../employees/employeeServices";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { parseInterviewCalendarItem } from "../../utils/interviewCalendarUtils";
import {
  getApplicantById,
  getRecruitmentScorecards,
  upsertRecruitmentScorecard,
} from "../../services";
import { Applicant, RecruitmentScorecardCommand } from "../../models";
import { useAppSelector } from "../../../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../../../utils/enums";
import { AppTextField } from "../../../../shared/components/ui";

interface Props {
  open: boolean;
  onClose: () => void;
  occasion: {
    id?: string;
    name?: string;
    date?: any;
    startTimeUtc?: string;
    endTimeUtc?: string;
    description?: string;
  } | null;
  onScorecardSubmitted?: () => void;
}

const defaultCriteria = [
  { id: "crit-dossier-1", name: "Technical Competence", rating: 4, notes: "" },
  { id: "crit-dossier-2", name: "Problem Solving & Architecture", rating: 4, notes: "" },
  { id: "crit-dossier-3", name: "Communication & Articulation", rating: 4, notes: "" },
  { id: "crit-dossier-4", name: "Cultural & Value Alignment", rating: 4, notes: "" },
];

export const InterviewDossierModal: React.FC<Props> = ({
  open,
  onClose,
  occasion,
  onScorecardSubmitted,
}) => {
  const navigate = useNavigate();
  const currentUserId = useAppSelector((state) => state.user.userData?.userId) ?? "";
  const modulePermission = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const userRoleType = useAppSelector((state) => state.user.userData?.roleType);
  const canAccessAts = userRoleType === Roles.Administrator || hasModuleFeaturePermission(ModulesName.Applications, Permission.View, modulePermission);

  const [tabIndex, setTabIndex] = useState<0 | 1>(0); // 0 = Candidate Dossier & Meeting, 1 = Scorecard Evaluation
  const [loading, setLoading] = useState(false);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [savedScorecards, setSavedScorecards] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ severity: "success" | "error" | "info"; text: string } | undefined>(undefined);
  const [submittingScorecard, setSubmittingScorecard] = useState(false);
  const [isEditingScorecard, setIsEditingScorecard] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);

  const currentUser = useAppSelector((state) => state.user.userData);
  const currentUserName =
    currentUser?.fullName ||
    (currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName}`.trim() : "") ||
    "You";

  useEffect(() => {
    if (open) {
      void getAllEmployees({ name: "", pageNo: 1, records: 500, departmentId: [], gender: [], employmentStatus: "Active" })
        .then(({ data }) => setEmployees(((data as any).methodResults ?? (data as any).methodResult ?? []) as any[]))
        .catch(() => setEmployees([]));
    }
  }, [open]);

  const getReviewerDisplayName = (reviewerId: string) => {
    if (!reviewerId) return "Reviewer";
    if (reviewerId === currentUserId) return `${currentUserName} (You)`;
    const matched = employees.find((e) => e.userId === reviewerId);
    if (!matched) return reviewerId.length > 20 ? `Evaluator (${reviewerId.slice(0, 8)}...)` : reviewerId;
    if (matched.fullName && matched.fullName.trim()) return matched.fullName.trim();
    const combined = `${matched.firstName ?? ""} ${matched.lastName ?? ""}`.trim();
    if (combined) return combined;
    return matched.name || matched.email || reviewerId;
  };

  const parsed = occasion ? parseInterviewCalendarItem(occasion) : null;

  const mySubmittedScorecard = useMemo(() => {
    if (!savedScorecards?.length || !currentUserId) return null;
    const currentRound = parsed?.roundNumber || 1;
    return savedScorecards.find(
      (sc) => sc.reviewerUserId === currentUserId && Number(sc.roundNumber || 1) === Number(currentRound)
    );
  }, [savedScorecards, currentUserId, parsed?.roundNumber]);

  // Scorecard state
  const [scorecard, setScorecard] = useState({
    recommendation: "Hire" as RecruitmentScorecardCommand["recommendation"],
    notes: "",
    criteria: defaultCriteria,
  });

  useEffect(() => {
    if (!open || !parsed?.isInterview) return;
    setFeedback(undefined);
    setTabIndex(0);

    const appTargetId = parsed.applicantId;
    if (appTargetId) {
      setLoading(true);
      void getApplicantById(appTargetId)
        .then(({ data }) => {
          if (data?.success && data?.methodResult) {
            setApplicant(data.methodResult);
          }
        })
        .catch(() => undefined)
        .finally(() => setLoading(false));

      if (parsed.vacancyId) {
        void getRecruitmentScorecards(appTargetId, parsed.vacancyId)
          .then(({ data }) => {
            if (data?.success && data?.methodResult) {
              setSavedScorecards(data.methodResult);
            }
          })
          .catch(() => undefined);
      }
    }
  }, [open, occasion?.id, parsed?.applicantId]);

  if (!occasion || !parsed?.isInterview) return null;

  const candidateDisplayName =
    applicant ? `${applicant.firstName} ${applicant.lastName}`.trim() : parsed.candidateName || "Candidate";
  const roleTitle = applicant?.vacancyName || parsed.roleTitle || "Assigned Interview";
  const roundLabel = `Round ${parsed.roundNumber || 1}${parsed.roundType ? ` (${parsed.roundType})` : ""}`;
  const meetingLink = parsed.meetingUrl;

  const handleSubmitScorecard = async () => {
    if (!parsed.applicantId) {
      setFeedback({ severity: "error", text: "Applicant ID missing from interview record." });
      return;
    }
    setSubmittingScorecard(true);
    setFeedback(undefined);
    try {
      if (!scorecard.criteria || scorecard.criteria.length === 0) {
        setFeedback({ severity: "error", text: "At least one evaluation criterion is required." });
        setSubmittingScorecard(false);
        return;
      }
      for (const c of scorecard.criteria) {
        if (!c.name.trim()) {
          setFeedback({ severity: "error", text: "All criteria must have a name." });
          setSubmittingScorecard(false);
          return;
        }
      }
      const payload: RecruitmentScorecardCommand = {
        applicantId: parsed.applicantId,
        vacancyId: parsed.vacancyId || applicant?.vacancyId || "",
        interviewId: parsed.interviewId,
        roundNumber: parsed.roundNumber || 1,
        reviewerUserId: currentUserId,
        recommendation: scorecard.recommendation,
        criteria: scorecard.criteria.map((c) => ({
          name: c.name,
          rating: c.rating,
          notes: c.notes || undefined,
        })),
        status: "Submitted",
        idempotencyKey: `scorecard-${parsed.applicantId}-${currentUserId}-${Date.now()}`,
      };

      const res = await upsertRecruitmentScorecard(payload);
      if (res.data?.success) {
        setFeedback({ severity: "success", text: "Scorecard submitted successfully! Your evaluation is recorded." });
        onScorecardSubmitted?.();
        setIsEditingScorecard(false);
        // Refresh scorecards list
        if (parsed.vacancyId) {
          void getRecruitmentScorecards(parsed.applicantId, parsed.vacancyId).then(({ data }) => {
            if (data?.success && data?.methodResult) setSavedScorecards(data.methodResult);
          });
        }
      } else {
        throw new Error(res.data?.message || "Failed to submit scorecard.");
      }
    } catch (err) {
      setFeedback({ severity: "error", text: (err as Error).message || "An error occurred while saving scorecard." });
    } finally {
      setSubmittingScorecard(false);
    }
  };

  const handleOpenResume = () => {
    if (applicant?.resumeUrl) {
      const url = applicant.resumeUrl.startsWith("http") || applicant.resumeUrl.startsWith("/")
        ? applicant.resumeUrl
        : `/${applicant.resumeUrl}`;
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const initials =
    ((candidateDisplayName.split(" ")[0]?.[0] ?? "") + (candidateDisplayName.split(" ")[1]?.[0] ?? "")).toUpperCase() || "CA";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 0.5 } }}>
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", fontWeight: 700 }}>
              {initials}
            </Avatar>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                {candidateDisplayName}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.25 }}>
                <Chip size="small" label={roleTitle} color="primary" variant="outlined" sx={{ fontWeight: 700, height: 22 }} />
                <Chip size="small" label={roundLabel} color="secondary" sx={{ fontWeight: 700, height: 22 }} />
              </Stack>
            </Box>
          </Stack>
          <IconButton onClick={onClose} size="small" aria-label="close">
            <Close />
          </IconButton>
        </Stack>
      </DialogTitle>

      <Tabs
        value={tabIndex}
        onChange={(_, val) => setTabIndex(val)}
        sx={{ px: 3, borderBottom: 1, borderColor: "divider" }}
      >
        <Tab label="Candidate Dossier & Meeting" sx={{ textTransform: "none", fontWeight: 700 }} />
        <Tab
          label={`Panelist Scorecard & Rating ${savedScorecards.length > 0 ? `(${savedScorecards.length})` : ""}`}
          sx={{ textTransform: "none", fontWeight: 700 }}
        />
      </Tabs>

      <DialogContent sx={{ minHeight: 380, pt: 2.5 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", py: 8 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            {feedback && (
              <Alert severity={feedback.severity} onClose={() => setFeedback(undefined)} sx={{ mb: 2, borderRadius: 2 }}>
                {feedback.text}
              </Alert>
            )}

            {/* TAB 0: CANDIDATE DOSSIER & MEETING */}
            {tabIndex === 0 && (
              <Stack spacing={2.5}>
                {/* Meeting & Schedule Card */}
                <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: "primary.lighter", border: 1, borderColor: "primary.light" }}>
                  <Typography variant="subtitle2" fontWeight={800} color="primary.dark" sx={{ mb: 1 }}>
                    Interview Meeting Schedule
                  </Typography>
                  <Grid container spacing={1.5} alignItems="center">
                    <Grid size={{ xs: 12, sm: 7 }}>
                      <Typography variant="body2" color="text.secondary">
                        Date: <strong>{dayjs(occasion.date).format("dddd, MMMM D, YYYY")}</strong>
                      </Typography>
                      {occasion.startTimeUtc && occasion.endTimeUtc && (
                        <Typography variant="body2" color="text.secondary">
                          Time: <strong>{dayjs(occasion.startTimeUtc).format("hh:mm A")} – {dayjs(occasion.endTimeUtc).format("hh:mm A")} (UTC)</strong>
                        </Typography>
                      )}
                      {parsed.panelistIds && parsed.panelistIds.length > 0 && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                          Assigned Panelists: {parsed.panelistIds.join(", ")}
                        </Typography>
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <Stack direction="column" spacing={1} alignItems={{ xs: "flex-start", sm: "flex-end" }}>
                        {meetingLink ? (
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={<Videocam />}
                            href={meetingLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ textTransform: "none", fontWeight: 750, borderRadius: 2 }}
                          >
                            Join Video Call
                          </Button>
                        ) : (
                          <Chip label="In-Person / Phone" variant="outlined" size="small" />
                        )}
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setTabIndex(1)}
                          startIcon={<FactCheckOutlined />}
                          sx={{ textTransform: "none", fontWeight: 700 }}
                        >
                          Submit Scorecard
                        </Button>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>

                {/* Candidate Overview & CV Card */}
                <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={800}>
                      Candidate Profile & Resume
                    </Typography>
                    {applicant?.resumeUrl && (
                      <Button
                        size="small"
                        variant="contained"
                        color="success"
                        startIcon={<PictureAsPdf />}
                        onClick={handleOpenResume}
                        sx={{ textTransform: "none", fontWeight: 750, borderRadius: 2 }}
                      >
                        View Candidate CV / Resume
                      </Button>
                    )}
                  </Stack>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Candidate Email</Typography>
                      <Typography variant="body2" fontWeight={600}>{applicant?.email || "—"}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Contact Phone</Typography>
                      <Typography variant="body2" fontWeight={600}>{applicant?.phone || "—"}</Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Experience</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {applicant?.experience ? `${applicant.experience} Years` : "Specified on CV"}
                      </Typography>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Typography variant="caption" color="text.secondary">Current Status</Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {applicant?.activityType !== undefined ? String(applicant.activityType) : "In Process"}
                      </Typography>
                    </Grid>
                  </Grid>

                  {(applicant as any)?.skills && Array.isArray((applicant as any).skills) && (applicant as any).skills.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75 }}>
                        Key Skills & Attributes
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={0.75}>
                        {(applicant as any).skills.map((skill: string, sIdx: number) => (
                          <Chip key={sIdx} label={skill} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: "0.75rem" }} />
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {!applicant?.resumeUrl && (
                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                      No direct resume PDF attachment linked. Candidate profile information loaded from ATS.
                    </Alert>
                  )}
                </Box>
              </Stack>
            )}

            {/* TAB 1: PANELIST SCORECARD */}
            {tabIndex === 1 && (
              <Stack spacing={2.5}>
                {/* Existing Scorecards for this Candidate */}
                {savedScorecards.length > 0 && (
                  <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover", border: 1, borderColor: "divider" }}>
                    <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Submitted Scorecards for this Applicant ({savedScorecards.length}):
                    </Typography>
                    <Stack spacing={1}>
                      {savedScorecards.map((sc, scIdx) => (
                        <Box key={sc.scorecardId || scIdx} sx={{ p: 1.25, borderRadius: 1.5, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" fontWeight={700}>
                              Reviewer: {getReviewerDisplayName(sc.reviewerUserId)} (Round {sc.roundNumber || parsed?.roundNumber || 1})
                            </Typography>
                            <Chip
                              size="small"
                              label={sc.recommendation || "Completed"}
                              color={sc.recommendation === "Strong Hire" || sc.recommendation === "Hire" ? "success" : "default"}
                              variant="filled"
                              sx={{ fontWeight: 700, height: 22 }}
                            />
                          </Stack>
                          {sc.criteria && (
                            <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 0.75 }}>
                              {sc.criteria.map((cr: any, cIdx: number) => (
                                <Chip key={cIdx} size="small" variant="outlined" label={`${cr.name}: ${cr.rating}/5`} sx={{ height: 20, fontSize: "0.7rem" }} />
                              ))}
                            </Stack>
                          )}
                        </Box>
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Already Submitted View: Only show confirmation & edit option, never duplicate form! */}
                {mySubmittedScorecard && !isEditingScorecard ? (
                  <Box sx={{ p: 2.5, borderRadius: 2.5, border: 1, borderColor: "success.main", bgcolor: "success.lighter" }}>
                    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1.5}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <CheckCircle color="success" sx={{ fontSize: 32 }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={850} color="success.dark">
                            Your Scorecard is Recorded for Round {parsed?.roundNumber || 1}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Submitted by {currentUserName} • Status: {mySubmittedScorecard.status || "Submitted"}
                          </Typography>
                        </Box>
                      </Stack>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          label={mySubmittedScorecard.recommendation || "Completed"}
                          color={mySubmittedScorecard.recommendation?.toLowerCase().includes("hire") ? "success" : "default"}
                          sx={{ fontWeight: 800 }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Edit fontSize="small" />}
                          onClick={() => {
                            if (Array.isArray(mySubmittedScorecard.criteria) && mySubmittedScorecard.criteria.length > 0) {
                              setScorecard({
                                recommendation: mySubmittedScorecard.recommendation || "Hire",
                                notes: mySubmittedScorecard.notes || "",
                                criteria: mySubmittedScorecard.criteria.map((cr: any, idx: number) => ({
                                  id: cr.id || `crit-dossier-edit-${idx}`,
                                  name: cr.name,
                                  rating: cr.rating,
                                  notes: cr.notes || "",
                                })),
                              });
                            } else {
                              setScorecard((sc) => ({
                                ...sc,
                                recommendation: mySubmittedScorecard.recommendation || "Hire",
                                notes: mySubmittedScorecard.notes || "",
                              }));
                            }
                            setIsEditingScorecard(true);
                          }}
                          sx={{ textTransform: "none", fontWeight: 750, borderRadius: 2 }}
                        >
                          Edit My Scorecard
                        </Button>
                      </Stack>
                    </Stack>

                    {Array.isArray(mySubmittedScorecard.criteria) && mySubmittedScorecard.criteria.length > 0 && (
                      <Stack spacing={0.75} sx={{ mt: 2, pt: 1.5, borderTop: 1, borderColor: "divider" }}>
                        {mySubmittedScorecard.criteria.map((cr: any, cIdx: number) => (
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

                    {mySubmittedScorecard.notes && (
                      <Box sx={{ mt: 1.5, p: 1.25, borderRadius: 1.5, bgcolor: "background.paper", border: 1, borderColor: "divider" }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          Your Feedback & Notes:
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.25, fontStyle: "italic" }}>
                          "{mySubmittedScorecard.notes}"
                        </Typography>
                      </Box>
                    )}
                  </Box>
                ) : (
                  /* Scorecard Submission or Edit Form */
                  <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                      <Typography variant="subtitle2" fontWeight={800}>
                        {isEditingScorecard
                          ? `Update Your Evaluation Scorecard (Round ${parsed?.roundNumber || 1})`
                          : `Your Evaluation Scorecard (Round ${parsed?.roundNumber || 1})`}
                      </Typography>
                      {isEditingScorecard && (
                        <Button
                          size="small"
                          color="inherit"
                          onClick={() => setIsEditingScorecard(false)}
                          sx={{ textTransform: "none", fontSize: "0.75rem" }}
                        >
                          Cancel
                        </Button>
                      )}
                    </Stack>

                  <Stack spacing={1.5}>
                    {scorecard.criteria.length === 0 ? (
                      <Alert
                        severity="info"
                        sx={{ borderRadius: 2 }}
                        action={
                          <Button
                            color="inherit"
                            size="small"
                            onClick={() =>
                              setScorecard((sc) => ({
                                ...sc,
                                criteria: [
                                  {
                                    id: `crit-dossier-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                                    name: "Technical Competence",
                                    rating: 4,
                                    notes: "",
                                  },
                                ],
                              }))
                            }
                          >
                            Add Criterion
                          </Button>
                        }
                      >
                        No criteria configured. Click "Add Criterion" to add evaluation criteria.
                      </Alert>
                    ) : (
                      scorecard.criteria.map((criterion, index) => {
                        const critId = (criterion as any).id || `crit-dossier-fallback-${index}`;
                        return (
                          <Box key={critId} sx={{ p: 1.25, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.default" }}>
                            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                              <AppTextField
                                size="small"
                                label="Criterion Name *"
                                value={criterion.name}
                                onChange={(e) =>
                                  setScorecard((sc) => ({
                                    ...sc,
                                    criteria: sc.criteria.map((c, i) =>
                                      ((c as any).id ? (c as any).id === critId : i === index) ? { ...c, name: e.target.value } : c
                                    ),
                                  }))
                                }
                                sx={{ minWidth: 200, flex: 1 }}
                              />
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Rating
                                  value={criterion.rating}
                                  onChange={(_, val) =>
                                    setScorecard((sc) => ({
                                      ...sc,
                                      criteria: sc.criteria.map((c, i) =>
                                        ((c as any).id ? (c as any).id === critId : i === index) ? { ...c, rating: val || 3 } : c
                                      ),
                                    }))
                                  }
                                />
                                <Tooltip title="Delete criterion">
                                  <IconButton
                                    size="small"
                                    color="error"
                                    aria-label={`Delete ${criterion.name || "criterion"}`}
                                    onClick={() =>
                                      setScorecard((sc) => ({
                                        ...sc,
                                        criteria: sc.criteria.filter((c, i) =>
                                          (c as any).id ? (c as any).id !== critId : i !== index
                                        ),
                                      }))
                                    }
                                  >
                                    <DeleteOutlineRounded fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              </Stack>
                            </Stack>
                            <AppTextField
                              fullWidth
                              size="small"
                              placeholder="Evaluator feedback or observed candidate evidence..."
                              value={criterion.notes}
                              onChange={(e) =>
                                setScorecard((sc) => ({
                                  ...sc,
                                  criteria: sc.criteria.map((c, i) =>
                                    ((c as any).id ? (c as any).id === critId : i === index) ? { ...c, notes: e.target.value } : c
                                  ),
                                }))
                              }
                              sx={{ mt: 1 }}
                            />
                          </Box>
                        );
                      })
                    )}

                    <Button
                      size="small"
                      startIcon={<AddRounded />}
                      onClick={() =>
                        setScorecard((sc) => ({
                          ...sc,
                          criteria: [
                            ...sc.criteria,
                            {
                              id: `crit-dossier-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                              name: "",
                              rating: 4,
                              notes: "",
                            },
                          ],
                        }))
                      }
                      sx={{ alignSelf: "flex-start", textTransform: "none", fontWeight: 700 }}
                    >
                      Add Criterion
                    </Button>

                    <AppTextField
                      multiline
                      minRows={2}
                      label="Overall Summary & Notes"
                      placeholder="Comprehensive interview debrief summary..."
                      value={scorecard.notes}
                      onChange={(e) => setScorecard({ ...scorecard, notes: e.target.value })}
                    />

                    <Box>
                      <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                        Hiring Recommendation *
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {(["Strong Hire", "Hire", "Hold", "No Hire"] as const).map((rec) => (
                          <Chip
                            key={rec}
                            label={rec}
                            onClick={() => setScorecard({ ...scorecard, recommendation: rec })}
                            color={
                              scorecard.recommendation === rec
                                ? rec.includes("Hire")
                                  ? "success"
                                  : rec === "Hold"
                                  ? "warning"
                                  : "error"
                                : "default"
                            }
                            variant={scorecard.recommendation === rec ? "filled" : "outlined"}
                            sx={{ fontWeight: 750, cursor: "pointer", px: 1 }}
                          />
                        ))}
                      </Stack>
                    </Box>

                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleSubmitScorecard}
                      disabled={submittingScorecard}
                      startIcon={<CheckCircle />}
                      sx={{ py: 1.25, mt: 1, textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                    >
                      {submittingScorecard ? "Submitting..." : "Submit Panelist Scorecard"}
                    </Button>
                  </Stack>
                </Box>
              )}
            </Stack>
          )}
          </>
        )}
      </DialogContent>

      <Divider />

      <DialogActions sx={{ px: 3, py: 1.5, justifyContent: "space-between" }}>
        {canAccessAts && parsed.applicantId ? (
          <Button
            size="small"
            variant="text"
            startIcon={<WorkOutline />}
            onClick={() => {
              onClose();
              navigate(`/recruitment/applicant/${parsed.applicantId}`);
            }}
            sx={{ textTransform: "none", fontWeight: 700 }}
          >
            Open in Full Recruitment ATS Pipeline
          </Button>
        ) : (
          <Box />
        )}
        <Button variant="outlined" onClick={onClose} sx={{ textTransform: "none", fontWeight: 700 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
