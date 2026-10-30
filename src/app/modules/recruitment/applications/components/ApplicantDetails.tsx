import {
  Box,
  Button,
  Chip,
  Card,
  Grid,
  Stack,
  Typography,
  Avatar,
  Tooltip,
  IconButton,
  SelectChangeEvent,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useIntl } from "react-intl";
import Add from "@mui/icons-material/Add";
import Close from "@mui/icons-material/Close";
import Edit from "@mui/icons-material/Edit";
import Visibility from "@mui/icons-material/Visibility";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import WorkOutline from "@mui/icons-material/WorkOutline";
import MailOutline from "@mui/icons-material/MailOutline";
import PhoneOutlined from "@mui/icons-material/PhoneOutlined";
import TimelapseOutlined from "@mui/icons-material/TimelapseOutlined";
import CalendarTodayOutlined from "@mui/icons-material/CalendarTodayOutlined";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Done from "@mui/icons-material/Done";
import ArrowForward from "@mui/icons-material/ArrowForward";
import AssessmentOutlined from "@mui/icons-material/AssessmentOutlined";
import AccountTreeOutlined from "@mui/icons-material/AccountTreeOutlined";
import clsx from "clsx";
import { StyleStatus } from "../../../../shared/components/StyledStatus";
import { CustomIconButton } from "../../../../shared/components/C_IconButton";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  addComment,
  editApplicant,
  getApplicantById,
  getApplicantComments,
  getFinalInterviewScore,
  getRecruitmentOfferByApplicant,
  upsertRecruitmentApplicationStage,
} from "../../services";

import {
  applicationStatusMapper,
  commentActionEncoderForApplicationStatus,
  dateFormatter,
  hasModuleFeaturePermission,
} from "../../../../../utils/common";
import {
  ApplicationEvaluationStatus,
  CommentTableColumnList,
} from "../../../../../utils/constant/Constant";

import { CustomisedTable } from "../../../../shared/components/C_Table";
import { AddComment } from "./AddComment";
import { useAppSelector } from "../../../../Redux/hooks";
import { toast } from "react-toastify";
import CustomisedButton from "../../../../shared/components/C_Button";
import { ApplicantStatus, ApplicationStatus, ModulesName, Permission, Roles } from "../../../../../utils/enums";
import { Applicant, CommentResponseModel, RecruitmentFinalScoreResult } from "../../models";
import { Pagination } from "../../../../shared/components/Pagination";
import { usePageData } from "../../../../Context/PageDataProvider";
import { PdfViewer } from "../../../../shared/components/PdfViewer";
import { RecruitmentLifecycleDrawer } from "./RecruitmentLifecycleDrawer";
import { AppSwitch } from "../../../../shared/components/ui";

export const ApplicantDetails = () => {
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const { setPageTitle } = usePageData();
  const currentUser = useAppSelector((state) => state.user.userData)!;
  const [loading, setLoading] = useState(false);
  const [applicant, setApplicant] = useState<Applicant>({} as Applicant);
  const [commentList, setCommentList] = useState<CommentResponseModel[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [refreshComment, setRefreshComment] = useState(false);
  const [comment, setComment] = useState("");
  const param = useParams();
  const applicantId = param.applicantid ?? "";
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    pageSize: 10,
  });
  const [CvPreviewMode, setCVPreviewMode] = useState(false);
  const [lifecycleOpen, setLifecycleOpen] = useState(false);
  const [candidateOffer, setCandidateOffer] = useState<{ offerId?: string; status?: string; salary?: number; currency?: string } | null>(null);
  const [benchmarkDetails, setBenchmarkDetails] = useState<RecruitmentFinalScoreResult | null>(null);
  const [emailCopied, setEmailCopied] = useState(false);

  const [status, setStatus] = useState({
    applicationStatus: 0,
    applicantStatus: 0,
  });

  const userPermissions = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
  const canEditApplicant = currentUser?.roleType === Roles.Administrator || hasModuleFeaturePermission(ModulesName.Applications, Permission.Edit, userPermissions);

  useEffect(() => {
    getApplicantById(applicantId)
      .then(({ data }) => {
        if (data.success && data.statusCode === 200) {
          setApplicant(data.methodResult);
          setStatus({
            ...status,
            applicantStatus: data.methodResult.status,
            applicationStatus: data.methodResult.activityType,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        navigate("/error", { replace: true });
      });
    getRecruitmentOfferByApplicant(applicantId)
      .then(({ data }) => {
        if (data.success && data.methodResult) {
          setCandidateOffer(data.methodResult);
        } else {
          setCandidateOffer(null);
        }
      })
      .catch(() => setCandidateOffer(null));

    getFinalInterviewScore(applicantId)
      .then(({ data }) => {
        if (data.success && data.methodResult && data.methodResult.finalInterviewScore > 0) {
          setBenchmarkDetails(data.methodResult);
          setApplicant(prev => ({
            ...prev,
            finalInterviewScore: data.methodResult.finalInterviewScore,
            finalInterviewRating: data.methodResult.finalInterviewRating,
            finalInterviewRecommendation: data.methodResult.finalInterviewRecommendation,
            evaluatedRoundsCount: data.methodResult.evaluatedRoundsCount,
          }));
        } else {
          setBenchmarkDetails(null);
        }
      })
      .catch(() => setBenchmarkDetails(null));
  }, [refresh, applicantId]);

  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.APPLICANT" }));
    const payload = {
      pageNo: paginationValues.pageNo + 1,
      pageSize: paginationValues.pageSize,
      applicantId: applicantId,
    };
    const getAllComments = async () => {
      try {
        const response = await getApplicantComments(payload);
        const { methodResults, success, totalRecords } = response.data;
        if (success) {
          setCommentList(methodResults);
          setTotalRecords(totalRecords);
        }
      } catch (error) {
        console.error((error as Error).message);
      }
    };
    getAllComments();
  }, [refreshComment, paginationValues]);

  const handleCommentChange = useCallback((comment: string) => {
    setComment(comment);
  }, []);

  useEffect(() => {
    if (param && !param.applicantid) {
      navigate("/error", { replace: true });
    }
  }, [param, navigate]);

  const handleEditApplicant = async (applicantStatus: ApplicantStatus) => {
    const payload = {
      applicantId: applicant.applicantId,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      vacancyId: applicant.vacancyId,
      experience: applicant.experience,
      activityType: applicant.activityType,
      status: applicantStatus,
      state: applicant.state,
    };
    const response = await editApplicant(payload);
    const { success } = response.data;
    if (success) {
      setRefresh(!refresh);
    }
  };

  const handleAddComment = async () => {
    setLoading(true);
    try {
      const hasStatusChange = status.applicationStatus !== applicant.activityType;
      if (hasStatusChange) {
        const stageMap: Record<number, "New" | "InProgress" | "OnHold" | "Shortlisted" | "Selected" | "Rejected" | "ReApply"> = {
          [ApplicationStatus.New]: "New",
          [ApplicationStatus.InProgress]: "InProgress",
          [ApplicationStatus.OnHold]: "OnHold",
          [ApplicationStatus.Shortlisted]: "Shortlisted",
          [ApplicationStatus.Selected]: "Selected",
          [ApplicationStatus.Rejected]: "Rejected",
          [ApplicationStatus.ReApply]: "ReApply",
        };
        const targetStage = stageMap[status.applicationStatus] || "New";
        const stageResponse = await upsertRecruitmentApplicationStage({
          applicantId: applicant.applicantId,
          vacancyId: applicant.vacancyId,
          stage: targetStage,
          reason: comment.trim() || ("Stage changed to " + targetStage),
          idempotencyKey: ("stage-change-" + applicant.applicantId + "-" + Date.now()),
        });
        if (!stageResponse.data.success) {
          toast.error(stageResponse.data.message || "Failed to update recruitment stage.");
          return;
        }
      }
      if (comment.trim()) {
        const commentPayload = {
          applicantId: applicant.applicantId,
          userId: currentUser.userId,
          description: comment.trim(),
          activityCategory: commentActionEncoderForApplicationStatus(
            status.applicationStatus
          ),
          jobTitle: applicant.vacancyName,
        };
        const commentResponse = await addComment(commentPayload);
        if (!commentResponse.data.success) {
          throw new Error();
        }
      }
      toast.success(formatMessage({ id: hasStatusChange ? "TOAST.SUCCESS.APPLICANT_UPDATE" : "TOAST.SUCCESS.ADD_COMMENT" }));
      handleClose();
      if (hasStatusChange) {
        setRefresh(!refresh);
      }
      setRefreshComment(!refreshComment);
    } catch (error) {
      toast.error((error as Error)?.message || "Failed to update applicant");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStatus({ ...status, applicationStatus: applicant.activityType });
    setModalOpen(false);
    setComment("");
  };

  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    if (typeof event.target.value === "number") {
      setStatus({ ...status, applicationStatus: event.target.value });
      setModalOpen(true);
    }
  };

  const getStatusLabel = (activityType: number) => {
    const configuredStatus = ApplicationEvaluationStatus.find(item => item.value === activityType);
    if (configuredStatus) return formatMessage({ id: configuredStatus.label });
    if (applicationStatusMapper[activityType]) return formatMessage({ id: applicationStatusMapper[activityType] });
    return "New";
  };

  const isStatusChangePending = status.applicationStatus !== applicant.activityType;
  const isTerminalStatus = [
    ApplicationStatus.Selected,
    ApplicationStatus.Rejected,
    ApplicationStatus.ReApply,
  ].includes(applicant.activityType);

  const getExperienceDisplay = (exp?: number | null) => {
    if (exp == null) return "-";
    if (exp === 0) return "Fresher (0 yr)";
    if (exp >= 12) {
      const yrs = (exp / 12).toFixed(1);
      return `${yrs} ${exp >= 24 ? "years" : "year"}`;
    }
    return `${exp} ${exp === 1 ? "month" : "months"}`;
  };

  const candidateInitials =
    applicant?.firstName || applicant?.lastName
      ? `${applicant?.firstName?.[0] || ""}${applicant?.lastName?.[0] || ""}`.toUpperCase()
      : "NS";

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (applicant?.email) {
      void navigator.clipboard.writeText(applicant.email);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  const handlePageChange = (page: number) => {
    setPaginationValues({
      ...paginationValues,
      pageNo: page,
    });
  };

  const handleRowPerPageChange = (rowPerPage: number) => {
    setPaginationValues({
      ...paginationValues,
      pageSize: rowPerPage,
      pageNo: 0,
    });
  };

  return (
    <Stack spacing={{ xs: 2.5, sm: 3.5 }} sx={{ flexGrow: 1, pb: { xs: 2.5, sm: 4 }, minWidth: 0 }}>
      <Card
        sx={{
          p: { xs: 2.25, sm: 3, md: 3.5 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: (t) =>
            t.palette.mode === "dark"
              ? "0 16px 40px rgba(0,0,0,.35)"
              : "0 12px 36px rgba(15,23,42,.07)",
          background: (t) =>
            t.palette.mode === "dark"
              ? "linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)"
              : "linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 100%)",
          overflow: "hidden",
        }}
      >
        {/* Candidate Hero Header */}
        <Box sx={{ mb: 2.5 }}>
          <Stack
            direction={{ xs: "column", lg: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", lg: "center" }}
            spacing={{ xs: 2.5, lg: 3 }}
          >
            {/* Candidate Identity */}
            <Stack direction="row" spacing={2.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              <Avatar
                sx={{
                  width: { xs: 58, sm: 68 },
                  height: { xs: 58, sm: 68 },
                  fontSize: { xs: "1.35rem", sm: "1.55rem" },
                  fontWeight: 850,
                  color: "#FFFFFF",
                  background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
                  boxShadow: "0 8px 20px rgba(37,99,235,0.35)",
                  border: "2px solid",
                  borderColor: (t) => alpha(t.palette.common.white, 0.8),
                  flexShrink: 0,
                }}
              >
                {candidateInitials}
              </Avatar>

              <Box sx={{ minWidth: 0, flex: 1 }}>
                {/* Line 1: Name + Stage Pill */}
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                  <Typography
                    variant="h5"
                    fontWeight={850}
                    color="text.primary"
                    sx={{ letterSpacing: "-0.02em", whiteSpace: "nowrap", fontSize: { xs: "1.3rem", sm: "1.55rem" } }}
                  >
                    {applicant?.firstName ? `${applicant.firstName} ${applicant.lastName || ""}` : "Candidate"}
                  </Typography>
                  <StyleStatus
                    label={applicant.isHired ? "Hired / Onboarded" : getStatusLabel(applicant.activityType)}
                    className={clsx({
                      info: applicant.activityType === ApplicationStatus.New && !applicant.isHired,
                      warning:
                        [ApplicationStatus.InProgress, ApplicationStatus.OnHold, ApplicationStatus.Shortlisted].includes(
                          applicant.activityType
                        ) && !applicant.isHired,
                      success: applicant.activityType === ApplicationStatus.Selected || applicant.isHired,
                      danger: applicant.activityType === ApplicationStatus.Rejected && !applicant.isHired,
                    })}
                  />
                </Stack>

                {/* Line 2: Role + Interview Benchmark + ID */}
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }} flexWrap="wrap" useFlexGap gap={1}>
                  <Chip
                    icon={<WorkOutline sx={{ fontSize: 16 }} />}
                    label={applicant?.vacancyName || "Role Unspecified"}
                    size="small"
                    variant="outlined"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.76rem",
                      height: 26,
                      borderRadius: 2,
                      borderColor: (t) => alpha(t.palette.text.primary, 0.15),
                      bgcolor: (t) => alpha(t.palette.text.primary, 0.02),
                      whiteSpace: "nowrap",
                    }}
                  />
                  {applicant.finalInterviewScore != null && applicant.finalInterviewScore > 0 && (
                    <Chip
                      size="small"
                      color={
                        applicant.finalInterviewScore >= 75
                          ? "success"
                          : applicant.finalInterviewScore >= 60
                          ? "warning"
                          : "error"
                      }
                      label={`${applicant.finalInterviewScore}% (${applicant.finalInterviewRating || (Number(applicant.finalInterviewScore) / 20).toFixed(1)}/5.0 ⭐) · ${applicant.finalInterviewRecommendation || "Hire"}`}
                      sx={{ fontWeight: 800, fontSize: "0.75rem", height: 26, borderRadius: 2, whiteSpace: "nowrap" }}
                    />
                  )}
                  <Chip
                    label={`Candidate ID: ${applicant?.applicantId ? applicant.applicantId.slice(0, 8) : "—"}`}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.74rem",
                      height: 26,
                      borderRadius: 2,
                      bgcolor: (t) => alpha(t.palette.text.primary, 0.05),
                      color: "text.secondary",
                      whiteSpace: "nowrap",
                    }}
                  />
                </Stack>
              </Box>
            </Stack>

            {/* Quick Actions & Status Switch */}
            <Stack
              direction="row"
              spacing={1.25}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
              gap={1.25}
              sx={{
                alignSelf: { xs: "stretch", lg: "center" },
                justifyContent: { xs: "space-between", sm: "flex-end" },
                pt: { xs: 2, lg: 0 },
                borderTop: { xs: "1px solid", lg: "none" },
                borderColor: "divider",
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: 2.5,
                  bgcolor: (t) => alpha(t.palette.text.primary, 0.04),
                  border: "1px solid",
                  borderColor: "divider",
                  whiteSpace: "nowrap",
                }}
              >
                <Typography variant="caption" fontWeight={750} color="text.secondary">
                  {status.applicantStatus === ApplicantStatus.Active ? "Active" : "Inactive"}
                </Typography>
                <AppSwitch
                  checked={status.applicantStatus === ApplicantStatus.Active}
                  onChange={(event) => {
                    handleEditApplicant(
                      event.target.checked
                        ? ApplicantStatus.Active
                        : ApplicantStatus.InActive
                    );
                  }}
                  inputProps={{ "aria-label": "Applicant Active Status" }}
                />
              </Stack>

              <Button
                variant="outlined"
                size="small"
                startIcon={CvPreviewMode ? <Close /> : <Visibility />}
                onClick={() => setCVPreviewMode(!CvPreviewMode)}
                sx={{
                  textTransform: "none",
                  fontWeight: 750,
                  fontSize: "0.82rem",
                  borderRadius: 2.5,
                  px: 1.75,
                  py: 0.85,
                  whiteSpace: "nowrap",
                }}
              >
                {CvPreviewMode ? "Close CV" : "Preview CV"}
              </Button>

              {canEditApplicant && (
                <Tooltip title={formatMessage({ id: "TOOLTIP.EDIT_APPLICANT" })}>
                  <IconButton
                    size="small"
                    onClick={() => navigate(`/recruitment/applicant/edit/${applicant.applicantId}`)}
                    sx={{
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 2.5,
                      p: 0.95,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {canEditApplicant && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                  onClick={() => setLifecycleOpen(true)}
                  sx={{
                    textTransform: "none",
                    fontWeight: 800,
                    fontSize: "0.84rem",
                    borderRadius: 2.5,
                    px: 2.25,
                    py: 0.9,
                    whiteSpace: "nowrap",
                    boxShadow: "0 4px 14px rgba(37,99,235,0.25)",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      transform: "translateY(-1px)",
                      boxShadow: "0 6px 18px rgba(37,99,235,0.4)",
                    },
                  }}
                >
                  {applicant.activityType === ApplicationStatus.Rejected
                    ? "View Workflow"
                    : applicant.isHired
                    ? "View Details"
                    : "Manage Stage"}
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Quick Contact & Details Bento Grid (Spacious Micro-Cards) */}
          <Grid container spacing={2} sx={{ mt: { xs: 2.5, sm: 3 } }}>
            {/* Email Micro-Card */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  p: { xs: 1.75, sm: 2 },
                  borderRadius: 3,
                  bgcolor: (t) => t.palette.mode === "dark" ? alpha(t.palette.background.paper, 0.45) : "#F8FAFC",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.75,
                  height: "100%",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: (t) => t.palette.mode === "dark" ? alpha(t.palette.background.paper, 0.65) : "#F1F5F9",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <MailOutline sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.25 }}>
                    {formatMessage({ id: "FORM.EMAIL" })}
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={700}
                    color="text.primary"
                    title={applicant?.email}
                    sx={{ fontSize: "0.85rem", wordBreak: "break-all" }}
                  >
                    <a href={`mailto:${applicant?.email}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {applicant?.email || "—"}
                    </a>
                  </Typography>
                </Box>
                {applicant?.email && (
                  <Tooltip title={emailCopied ? "Copied!" : "Copy Email"}>
                    <IconButton size="small" onClick={handleCopyEmail} sx={{ p: 0.65, flexShrink: 0, ml: 0.5 }}>
                      {emailCopied ? <Done sx={{ fontSize: 16 }} color="success" /> : <ContentCopy sx={{ fontSize: 16 }} />}
                    </IconButton>
                  </Tooltip>
                )}
              </Card>
            </Grid>

            {/* Phone Micro-Card */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  p: { xs: 1.75, sm: 2 },
                  borderRadius: 3,
                  bgcolor: (t) => t.palette.mode === "dark" ? alpha(t.palette.background.paper, 0.45) : "#F8FAFC",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.75,
                  height: "100%",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: (t) => t.palette.mode === "dark" ? alpha(t.palette.background.paper, 0.65) : "#F1F5F9",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <PhoneOutlined sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.25 }}>
                    {formatMessage({ id: "FORM.PHONE" })}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    <a href={`tel:${applicant?.phone}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {applicant?.phone || "—"}
                    </a>
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Experience Micro-Card */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  p: { xs: 1.75, sm: 2 },
                  borderRadius: 3,
                  bgcolor: (t) => t.palette.mode === "dark" ? alpha(t.palette.background.paper, 0.45) : "#F8FAFC",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.75,
                  height: "100%",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: (t) => t.palette.mode === "dark" ? alpha(t.palette.background.paper, 0.65) : "#F1F5F9",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <TimelapseOutlined sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.25 }}>
                    {formatMessage({ id: "FORM.EXPERIENCE" })}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {getExperienceDisplay(applicant?.experience)}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            {/* Applied Date Micro-Card */}
            <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  p: { xs: 1.75, sm: 2 },
                  borderRadius: 3,
                  bgcolor: (t) => t.palette.mode === "dark" ? alpha(t.palette.background.paper, 0.45) : "#F8FAFC",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.75,
                  height: "100%",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    bgcolor: (t) => t.palette.mode === "dark" ? alpha(t.palette.background.paper, 0.65) : "#F1F5F9",
                    transform: "translateY(-1px)",
                    boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                  },
                }}
              >
                <Box
                  sx={{
                    width: 42,
                    height: 42,
                    borderRadius: 2.5,
                    bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
                    color: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <CalendarTodayOutlined sx={{ fontSize: 20 }} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={750} display="block" sx={{ fontSize: "0.68rem", letterSpacing: "0.06em", textTransform: "uppercase", mb: 0.25 }}>
                    {formatMessage({ id: "APPLICATION.APPLIED_DATE" })}
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: "0.85rem", whiteSpace: "nowrap" }}>
                    {dateFormatter(applicant?.applyDate, "DD MMM YYYY hh:mm A")}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {
          applicant.isHired ? (
            <Box
              sx={{
                mb: 3,
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                bgcolor: "success.lighter",
                border: "1.5px solid",
                borderColor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <CheckCircleOutline color="success" sx={{ fontSize: 36 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={850} color="success.dark">
                    Employee Successfully Created!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employee ID: <strong>{applicant.employeeId || "Assigned"}</strong> · Official Email: <strong>{applicant.email}</strong>. Candidate has completed recruitment handoff.
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5}>
                {applicant.employeeUserId && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => {
                      const targetId = applicant.employeeUserId || applicant.employeeId;
                      if (targetId) {
                        navigate(`/employees/${targetId}`);
                      } else {
                        navigate("/employees");
                      }
                    }}
                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2.5, px: 2.25, py: 0.85 }}
                  >
                    View Employee Profile →
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  onClick={() => setLifecycleOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2.5, px: 2.25, py: 0.85 }}
                >
                  View Workflow
                </Button>
              </Stack>
            </Box>
          ) : candidateOffer?.status === "Accepted" ? (
            <Box
              sx={{
                mb: 3,
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                bgcolor: "success.lighter",
                border: "1px solid",
                borderColor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <CheckCircleOutline color="success" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={850} color="success.dark">
                    Offer Accepted by Candidate!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Accepted Compensation: <strong>{candidateOffer.currency} {candidateOffer.salary?.toLocaleString()}</strong>. Candidate is ready for preboarding and employee onboarding.
                  </Typography>
                </Box>
              </Stack>
              {canEditApplicant && (
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => setLifecycleOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2.5, px: 2.25, py: 0.85 }}
                >
                  Convert to Employee →
                </Button>
              )}
            </Box>
          ) : null
        }
        {candidateOffer?.status === "Sent" && (
          <Box
            sx={{
              mb: 3,
              p: 2,
              borderRadius: 3,
              bgcolor: "info.lighter",
              border: "1px solid",
              borderColor: "info.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="body2" color="info.dark" fontWeight={650}>
              Offer Sent to Candidate ({candidateOffer.currency} {candidateOffer.salary?.toLocaleString()}) · Awaiting candidate response
            </Typography>
            <Button
              size="small"
              variant="outlined"
              color="info"
              onClick={() => setLifecycleOpen(true)}
              sx={{ textTransform: "none", fontWeight: 750, borderRadius: 2, px: 2 }}
            >
              View Offer Details
            </Button>
          </Box>
        )}
        {
          CvPreviewMode ?
            <PdfViewer pdfUrl={applicant.resumeUrl ?? ""} /> :
            <Grid container spacing={{ xs: 2.5, sm: 3 }}>
              {/* Bento Card 1: Interview Benchmark & Scorecard Card */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    height: "100%",
                    borderRadius: 3.5,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    bgcolor: (t) => alpha(t.palette.background.paper, 0.75),
                    borderColor: "divider",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (t) =>
                        t.palette.mode === "dark"
                          ? "0 10px 28px rgba(0,0,0,0.3)"
                          : "0 10px 28px rgba(15,23,42,0.06)",
                    },
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={1.75} alignItems="center" sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2.5,
                          bgcolor: (t) => alpha(t.palette.primary.main, 0.12),
                          color: "primary.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <AssessmentOutlined sx={{ fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={850} color="text.primary">
                          Interview & Technical Benchmark
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Consolidated panel scorecards and substantive round benchmarks
                        </Typography>
                      </Box>
                    </Stack>

                    {applicant.finalInterviewScore != null && applicant.finalInterviewScore > 0 ? (
                      <Stack spacing={2} sx={{ mt: 1 }}>
                        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" sx={{ gap: 1 }}>
                          <Chip
                            color={
                              applicant.finalInterviewScore >= 75
                                ? "success"
                                : applicant.finalInterviewScore >= 60
                                ? "warning"
                                : "error"
                            }
                            variant="filled"
                            label={`${applicant.finalInterviewScore}% · ${applicant.finalInterviewRating || (Number(applicant.finalInterviewScore) / 20).toFixed(1)}/5.0 ⭐`}
                            sx={{ fontWeight: 850, fontSize: "0.85rem", height: 32, borderRadius: 2 }}
                          />
                          {applicant.finalInterviewRecommendation && (
                            <Chip
                              variant="outlined"
                              color={
                                applicant.finalInterviewRecommendation.includes("Hire") &&
                                !applicant.finalInterviewRecommendation.includes("No")
                                  ? "success"
                                  : applicant.finalInterviewRecommendation.includes("Hold")
                                  ? "warning"
                                  : "error"
                              }
                              label={applicant.finalInterviewRecommendation}
                              sx={{ fontWeight: 800, fontSize: "0.78rem", height: 30, borderRadius: 2 }}
                            />
                          )}
                        </Stack>

                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {applicant.evaluatedRoundsCount
                            ? `${applicant.evaluatedRoundsCount} substantive technical round${applicant.evaluatedRoundsCount > 1 ? "s" : ""} evaluated with panel consensus.`
                            : "Substantive technical rounds recorded with panel consensus."}
                          {benchmarkDetails?.excludesHrRound ? " Non-technical HR screening is excluded from aggregate score." : ""}
                        </Typography>
                      </Stack>
                    ) : (
                      <Stack spacing={1.5} sx={{ mt: 1 }}>
                        <Chip
                          size="small"
                          variant="outlined"
                          label={applicant.activityType === ApplicationStatus.Rejected ? "Concluded / Closed" : "Pending Evaluation"}
                          color={applicant.activityType === ApplicationStatus.Rejected ? "error" : "default"}
                          sx={{ alignSelf: "flex-start", fontWeight: 750, borderRadius: 2, height: 28 }}
                        />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {applicant.activityType === ApplicationStatus.Rejected
                            ? "Candidate application was concluded. Evaluation archive retained in lifecycle logs."
                            : applicant.activityType === ApplicationStatus.New
                            ? "Awaiting round scheduling, panel assignment, and scorecard generation."
                            : "Interviews currently underway. Panel scorecards pending submission."}
                        </Typography>
                      </Stack>
                    )}
                  </Box>

                  <Box sx={{ pt: 2.25, mt: 3, borderTop: 1, borderColor: "divider" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Typography variant="caption" color="text.secondary" fontWeight={650}>
                        {applicant.finalInterviewScore ? "Consensus reached" : "Awaiting scorecards"}
                      </Typography>
                      {canEditApplicant && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                          onClick={() => setLifecycleOpen(true)}
                          sx={{ textTransform: "none", fontWeight: 800, fontSize: "0.8rem", borderRadius: 2, px: 2 }}
                        >
                          View Scorecards & Debrief
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Card>
              </Grid>

              {/* Bento Card 2: Recruitment Pipeline & Stage Transition */}
              <Grid size={{ xs: 12, lg: 6 }}>
                <Card
                  variant="outlined"
                  sx={{
                    p: { xs: 2.5, sm: 3 },
                    height: "100%",
                    borderRadius: 3.5,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    bgcolor: (t) => alpha(t.palette.background.paper, 0.75),
                    borderColor: "divider",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: (t) =>
                        t.palette.mode === "dark"
                          ? "0 10px 28px rgba(0,0,0,0.3)"
                          : "0 10px 28px rgba(15,23,42,0.06)",
                    },
                  }}
                >
                  <Box>
                    <Stack direction="row" spacing={1.75} alignItems="center" sx={{ mb: 2 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2.5,
                          bgcolor: (t) => alpha(t.palette.info.main, 0.12),
                          color: "info.main",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <AccountTreeOutlined sx={{ fontSize: 22 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={850} color="text.primary">
                          Hiring Lifecycle & Offer Pipeline
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recruitment workflow progression, stage gates, and compensation offers
                        </Typography>
                      </Box>
                    </Stack>

                    <Stack spacing={2} sx={{ mt: 1 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Typography variant="body2" color="text.secondary" fontWeight={650}>
                          Current Stage:
                        </Typography>
                        <StyleStatus
                          label={applicant.isHired ? "Hired / Onboarded" : getStatusLabel(applicant.activityType)}
                          className={clsx({
                            info: applicant.activityType === ApplicationStatus.New && !applicant.isHired,
                            warning:
                              [ApplicationStatus.InProgress, ApplicationStatus.OnHold, ApplicationStatus.Shortlisted].includes(
                                applicant.activityType
                              ) && !applicant.isHired,
                            success: applicant.activityType === ApplicationStatus.Selected || applicant.isHired,
                            danger: applicant.activityType === ApplicationStatus.Rejected && !applicant.isHired,
                          })}
                        />
                      </Stack>

                      {applicant.isHired ? (
                        <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: (t) => alpha(t.palette.success.main, 0.08), border: "1px solid", borderColor: (t) => alpha(t.palette.success.main, 0.25) }}>
                          <Typography variant="body2" fontWeight={750} color="success.dark">
                            Active Employee #{applicant.employeeId || "Assigned"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Recruitment handoff completed. Official employee profile active.
                          </Typography>
                        </Box>
                      ) : candidateOffer ? (
                        <Box sx={{ p: 1.75, borderRadius: 2.5, bgcolor: (t) => alpha(t.palette.info.main, 0.08), border: "1px solid", borderColor: (t) => alpha(t.palette.info.main, 0.25) }}>
                          <Typography variant="body2" fontWeight={750} color="info.dark">
                            Offer {candidateOffer.status}: {candidateOffer.currency} {candidateOffer.salary?.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {candidateOffer.status === "Accepted"
                              ? "Candidate accepted offer! Proceed to preboarding & hire."
                              : "Offer terms delivered to candidate. Awaiting candidate signature/response."}
                          </Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                          {applicant.activityType === ApplicationStatus.Selected
                            ? "Candidate selected! Next step: create and dispatch employment offer."
                            : applicant.activityType === ApplicationStatus.Shortlisted
                            ? "Candidate shortlisted for technical interviews."
                            : "Candidate in initial screening stage."}
                        </Typography>
                      )}
                    </Stack>
                  </Box>

                  <Box sx={{ pt: 2.25, mt: 3, borderTop: 1, borderColor: "divider" }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1}>
                      <Typography variant="caption" color="text.secondary" fontWeight={650}>
                        Lifecycle Workflow
                      </Typography>
                      {canEditApplicant && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          endIcon={<ArrowForward sx={{ fontSize: 16 }} />}
                          onClick={() => setLifecycleOpen(true)}
                          sx={{ textTransform: "none", fontWeight: 800, fontSize: "0.8rem", borderRadius: 2, px: 2 }}
                        >
                          {applicant.isHired ? "View Onboarding" : "Manage Stage"}
                        </Button>
                      )}
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            </Grid>
        }
      </Card>
      {
        !CvPreviewMode &&
        <Card
          sx={{
            p: { xs: 2.25, sm: 3.25 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: (t) =>
              t.palette.mode === "dark"
                ? "0 16px 40px rgba(0,0,0,.35)"
                : "0 12px 36px rgba(15,23,42,.07)",
            background: (t) =>
              t.palette.mode === "dark"
                ? "linear-gradient(180deg, rgba(30,41,59,0.7) 0%, rgba(15,23,42,0.9) 100%)"
                : "linear-gradient(180deg, #FFFFFF 0%, #FAFAFC 100%)",
            overflow: "hidden",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} gap={2} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} mb={{ xs: 2.5, sm: 3 }}>
            <Box>
              <Typography variant="h5" fontWeight={800}>
                {formatMessage({ id: "COMMENT.COMMENT_HISTORY" })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                A chronological record of updates and hiring decisions.
              </Typography>
            </Box>
            <CustomisedButton
              label={formatMessage({ id: "COMMENT.ADD_COMMENT" })}
              Icon={<Add />}
              handleClick={() => {
                setModalOpen(true);
              }}
              fullWidth={false}
              sx={{ minHeight: 42, alignSelf: { xs: "stretch", sm: "auto" } }}
            />
          </Stack>

          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3, overflowX: "auto", "&::-webkit-scrollbar": { height: 7 }, "&::-webkit-scrollbar-thumb": { bgcolor: "action.selected", borderRadius: 8 } }}>
            <CustomisedTable
              keyName="id"
              rows={commentList}
              columns={CommentTableColumnList}
              page={0}
              rowsPerPage={0}
            />
          </Box>
          <Box sx={{ mt: 2.5 }}>
            <Pagination
              page={paginationValues.pageNo}
              rowsPerPage={paginationValues.pageSize}
              setPage={handlePageChange}
              setRowPerPage={handleRowPerPageChange}
              totalRecords={totalRecords}
            />
          </Box>
          {isModalOpen && (
            <AddComment
              loading={loading}
              open={isModalOpen}
              comment={comment}
              handleCommentChange={handleCommentChange}
              handleClose={handleClose}
              handleAddComment={handleAddComment}
              statusChange={isStatusChangePending ? {
                from: getStatusLabel(applicant.activityType),
                to: getStatusLabel(status.applicationStatus),
              } : undefined}
            />
          )}
        </Card>
      }
      {canEditApplicant && <RecruitmentLifecycleDrawer open={lifecycleOpen} applicant={applicant} onClose={() => setLifecycleOpen(false)} onSaved={() => setRefresh(!refresh)} />}
    </Stack >
  );
};
