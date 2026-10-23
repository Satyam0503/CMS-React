import React, { useEffect, useState } from "react";
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
  Typography,
} from "@mui/material";
import {
  CheckCircle,
  Close,
  FactCheckOutlined,
  Launch,
  PictureAsPdf,
  Videocam,
  WorkOutline,
} from "@mui/icons-material";
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
import { ModulesName, Permission } from "../../../../../utils/enums";
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
  { name: "Technical Competence", rating: 4, notes: "" },
  { name: "Problem Solving & Architecture", rating: 4, notes: "" },
  { name: "Communication & Articulation", rating: 4, notes: "" },
  { name: "Cultural & Value Alignment", rating: 4, notes: "" },
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
  const canAccessAts = hasModuleFeaturePermission(ModulesName.Applications, Permission.View, modulePermission);

  const [tabIndex, setTabIndex] = useState<0 | 1>(0); // 0 = Candidate Dossier & Meeting, 1 = Scorecard Evaluation
  const [loading, setLoading] = useState(false);
  const [applicant, setApplicant] = useState<Applicant | null>(null);
  const [savedScorecards, setSavedScorecards] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<{ severity: "success" | "error" | "info"; text: string } | undefined>(undefined);
  const [submittingScorecard, setSubmittingScorecard] = useState(false);

  // Scorecard state
  const [scorecard, setScorecard] = useState({
    recommendation: "Hire" as RecruitmentScorecardCommand["recommendation"],
    notes: "",
    criteria: defaultCriteria,
  });

  const parsed = occasion ? parseInterviewCalendarItem(occasion) : null;

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
      window.open(applicant.resumeUrl, "_blank", "noopener,noreferrer");
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
                              Reviewer: {sc.reviewerUserId} (Round {sc.roundNumber})
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

                {/* Scorecard Form */}
                <Box sx={{ p: 2, borderRadius: 2.5, border: 1, borderColor: "divider", bgcolor: "background.paper" }}>
                  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5 }}>
                    Your Evaluation Scorecard
                  </Typography>

                  <Stack spacing={1.5}>
                    {scorecard.criteria.map((criterion, index) => (
                      <Box key={criterion.name} sx={{ p: 1.25, border: 1, borderColor: "divider", borderRadius: 2, bgcolor: "background.default" }}>
                        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} spacing={1}>
                          <Typography variant="body2" fontWeight={700}>
                            {criterion.name}
                          </Typography>
                          <Rating
                            value={criterion.rating}
                            onChange={(_, val) =>
                              setScorecard((sc) => ({
                                ...sc,
                                criteria: sc.criteria.map((c, i) => (i === index ? { ...c, rating: val || 3 } : c)),
                              }))
                            }
                          />
                        </Stack>
                        <AppTextField
                          fullWidth
                          size="small"
                          placeholder="Evaluator feedback or observed candidate evidence..."
                          value={criterion.notes}
                          onChange={(e) =>
                            setScorecard((sc) => ({
                              ...sc,
                              criteria: sc.criteria.map((c, i) => (i === index ? { ...c, notes: e.target.value } : c)),
                            }))
                          }
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    ))}

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
