import {
  Box,
  Button,
  Chip,
  Card,
  FormControl,
  Grid,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Close, Edit, Visibility, CheckCircleOutline } from "@mui/icons-material";
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
import { ApplicantStatus, ApplicationStatus, ModulesName, Permission } from "../../../../../utils/enums";
import { Applicant, CommentResponseModel, RecruitmentFinalScoreResult } from "../../models";
import { Pagination } from "../../../../shared/components/Pagination";
import { usePageData } from "../../../../Context/PageDataProvider";
import { PdfViewer } from "../../../../shared/components/PdfViewer";
import { RecruitmentLifecycleDrawer } from "./RecruitmentLifecycleDrawer";

import { AppSelect, AppSwitch } from "../../../../shared/components/ui";
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

  const [status, setStatus] = useState({
    applicationStatus: 0,
    applicantStatus: 0,
  });

  const userPermissions = useAppSelector(state => state.user.userData?.modulePermission) ?? [];
  const canEditApplicant = hasModuleFeaturePermission(ModulesName.Applications, Permission.Edit, userPermissions);

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

  if (Object.keys(param).length === 0 || !param.applicantid) {
    navigate("/error", { replace: true });
  }



  const handleEditApplicant = async (applicantStatus: ApplicantStatus) => {
    const payload = {
      applicantId: applicant.applicantId,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      vacancyId: applicant.vacancyId,
      experience: applicant.experience,
      activityType: status.applicationStatus,
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
        const payload = {
          applicantId: applicant.applicantId,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email: applicant.email,
          phone: applicant.phone,
          vacancyId: applicant.vacancyId,
          experience: applicant.experience,
          activityType: status.applicationStatus,
          status: applicant.status,
          state: applicant.state,
        };
        const response = await editApplicant(payload);
        const { success } = response.data;
        if (!success) {
          throw new Error();
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
      console.error((error as Error).message);
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
    <Stack spacing={{ xs: 1.5, sm: 2.5 }} sx={{ flexGrow: 1, pb: { xs: 2, sm: 3 }, minWidth: 0 }}>
      <Card
        sx={{
          p: { xs: 1.5, sm: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          boxShadow: "0 12px 36px rgba(15,23,42,.07)",
          overflow: "hidden",
        }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} mb={{ xs: 2, sm: 3 }} gap={1.5} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }}>
          <Box>
            <Typography variant="h5" fontWeight={800}>
              {formatMessage({ id: "APPLICANT.APPLICANT_DETAILS" })}
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }} flexWrap="wrap">
              <Typography variant="body2" color="text.secondary">
                Review candidate information and manage this application.
              </Typography>
              {Boolean(applicant.finalInterviewScore && applicant.finalInterviewScore > 0) && (
                <Chip
                  size="small"
                  color="primary"
                  variant="outlined"
                  label={`Hiring Benchmark: ${applicant.finalInterviewScore}% (${applicant.finalInterviewRating || (Number(applicant.finalInterviewScore) / 20).toFixed(1)}/5 ⭐) • ${applicant.finalInterviewRecommendation || "Hire"}`}
                  sx={{ fontWeight: 800, fontSize: "0.72rem" }}
                />
              )}
            </Stack>
          </Box>

          <Stack direction="row" spacing={1} sx={{ alignSelf: { xs: "stretch", sm: "auto" }, justifyContent: "flex-end", flexWrap: "wrap", "& .ratio-1x1": { width: 40, height: 40, minWidth: 40, borderRadius: 1.75, bgcolor: "background.paper", border: "1px solid", borderColor: "divider" } }}>
            <CustomIconButton
              icon={CvPreviewMode ? <Close /> : <Visibility />}
              tooltip={formatMessage({ id: "TOOLTIP.VIEW_CV" })}
              handleClick={() => setCVPreviewMode(!CvPreviewMode)}
            />
            {canEditApplicant && <CustomisedButton label="Next step" handleClick={() => setLifecycleOpen(true)} fullWidth={false} sx={{ minHeight: 40, minWidth: { xs: 110, sm: 104 }, px: { xs: 1.5, sm: 2 }, flex: "0 0 auto" }} />}
            {
              canEditApplicant &&
              <CustomIconButton
                icon={<Edit />}
                tooltip={formatMessage({ id: "TOOLTIP.EDIT_APPLICANT" })}
                handleClick={() => {
                  navigate(
                    `/recruitment/applicant/edit/${applicant.applicantId}`
                  );
                }}
              />
            }
          </Stack>
        </Stack>
        {
          applicant.isHired ? (
            <Box
              sx={{
                mb: 2.5,
                p: 2.25,
                borderRadius: 2.5,
                bgcolor: "success.lighter",
                border: "1.5px solid",
                borderColor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleOutline color="success" sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="subtitle1" fontWeight={850} color="success.dark">
                    Employee Successfully Created!
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Employee ID: <strong>{applicant.employeeId || "Assigned"}</strong> · Official Email: <strong>{applicant.email}</strong>. Candidate has completed recruitment handoff.
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1}>
                {applicant.employeeUserId && (
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    onClick={() => navigate(`/employees/profile/${applicant.employeeUserId}`)}
                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, px: 2, py: 0.75 }}
                  >
                    View Employee Profile →
                  </Button>
                )}
                <Button
                  variant="outlined"
                  color="success"
                  size="small"
                  onClick={() => setLifecycleOpen(true)}
                  sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, px: 2, py: 0.75 }}
                >
                  View Workflow
                </Button>
              </Stack>
            </Box>
          ) : candidateOffer?.status === "Accepted" ? (
            <Box
              sx={{
                mb: 2.5,
                p: 2,
                borderRadius: 2.5,
                bgcolor: "success.lighter",
                border: "1px solid",
                borderColor: "success.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 1.5,
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CheckCircleOutline color="success" sx={{ fontSize: 28 }} />
                <Box>
                  <Typography variant="subtitle2" fontWeight={850} color="success.dark">
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
                  sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, px: 2, py: 0.75 }}
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
              mb: 2.5,
              p: 1.75,
              borderRadius: 2.5,
              bgcolor: "info.lighter",
              border: "1px solid",
              borderColor: "info.main",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
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
              sx={{ textTransform: "none", fontWeight: 750, borderRadius: 1.5 }}
            >
              View Offer Details
            </Button>
          </Box>
        )}
        {
          CvPreviewMode ?
            <PdfViewer pdfUrl={applicant.resumeUrl ?? ""} /> :
            <Grid
              container
              spacing={2}
              sx={{
                "& > .MuiGrid-root > .MuiStack-root": {
                  minHeight: { xs: 88, sm: 76 },
                  p: { xs: 1.5, sm: 2 },
                  borderRadius: 2.5,
                  bgcolor: "action.hover",
                  border: "1px solid",
                  borderColor: "divider",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  alignContent: "center",
                },
                "& > .MuiGrid-root > .MuiStack-root .fw-bold": {
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  width: "100%",
                  lineHeight: 1.2,
                },
              }}
            >
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack spacing={0.5}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "FORM.FULL_NAME" })}
                  </Typography>{" "}
                  <Typography variant="body1">
                    {applicant?.firstName + " " + applicant?.lastName}
                  </Typography>
                </Stack>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack spacing={0.5}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "FORM.EMAIL" })}
                  </Typography>

                  <Typography variant="body1">{applicant?.email}</Typography>
                </Stack>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack spacing={0.5}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "FORM.PHONE" })}
                  </Typography>

                  <Typography variant="body1">{applicant?.phone}</Typography>
                </Stack>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack spacing={0.5}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "JOB.POSITION" })}
                  </Typography>

                  <Typography variant="body1">{applicant?.vacancyName}</Typography>
                </Stack>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack spacing={0.5}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "FORM.EXPERIENCE" })}
                  </Typography>

                  <Typography variant="body1">
                    {applicant.experience != null ? (applicant.experience === 0 ? "Fresher (0 yr)" : applicant.experience >= 12 ? `${(applicant.experience / 12).toFixed(1)} ${applicant.experience >= 24 ? "years" : "year"}` : `${applicant.experience} months`) : "-"}
                  </Typography>
                </Stack>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack spacing={0.75} sx={{ alignItems: "flex-start" }}>
                  <Typography className="fw-bold">
                    INTERVIEW BENCHMARK
                  </Typography>
                  {applicant.finalInterviewScore && applicant.finalInterviewScore > 0 ? (
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip
                          size="small"
                          color={
                            applicant.finalInterviewScore >= 75
                              ? "success"
                              : applicant.finalInterviewScore >= 60
                              ? "warning"
                              : "error"
                          }
                          variant="filled"
                          label={`${applicant.finalInterviewScore}% (${applicant.finalInterviewRating || (Number(applicant.finalInterviewScore) / 20).toFixed(1)}/5.0 ⭐)`}
                          sx={{ fontWeight: 800, fontSize: "0.8rem", height: 26 }}
                        />
                        {applicant.finalInterviewRecommendation && (
                          <Chip
                            size="small"
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
                            sx={{ fontWeight: 700, fontSize: "0.72rem", height: 24 }}
                          />
                        )}
                      </Stack>
                      <Stack direction="row" spacing={0.5} alignItems="center">
                        <Typography variant="caption" color="text.secondary">
                          {applicant.evaluatedRoundsCount
                            ? `${applicant.evaluatedRoundsCount} technical round${applicant.evaluatedRoundsCount > 1 ? "s" : ""} evaluated`
                            : "Substantive rounds evaluated"}
                          {benchmarkDetails?.excludesHrRound ? " (excl. HR round)" : ""}
                        </Typography>
                        {canEditApplicant && (
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setLifecycleOpen(true)}
                            sx={{ textTransform: "none", fontSize: "0.72rem", p: 0, minHeight: "auto", minWidth: "auto", ml: 0.5, fontWeight: 700 }}
                          >
                            View →
                          </Button>
                        )}
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={0.5}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Chip
                          size="small"
                          variant="outlined"
                          label="Pending Evaluation"
                          sx={{ fontWeight: 700, fontSize: "0.75rem", height: 26, borderColor: "divider", color: "text.secondary" }}
                        />
                        {canEditApplicant && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setLifecycleOpen(true)}
                            sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25, px: 1, minHeight: 26, borderRadius: 1.5 }}
                          >
                            Evaluate →
                          </Button>
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {applicant.activityType === ApplicationStatus.New
                          ? "Awaiting interview scheduling & panel scorecards."
                          : applicant.activityType === ApplicationStatus.Shortlisted
                          ? "Interviews in progress • scorecards pending."
                          : "No technical evaluation completed yet."}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack spacing={0.5}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "APPLICATION.APPLIED_DATE" })}
                  </Typography>
                  <Typography variant="body1">
                    {dateFormatter(applicant?.applyDate, "DD MMM YYYY hh:mm A")}
                  </Typography>
                </Stack>
              </Grid>

              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack spacing={0.75} sx={{ alignItems: "flex-start" }}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "APPLICATION.STATUS_LABEL" })} :
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                    <StyleStatus
                      label={applicant.isHired ? "Hired / Onboarded" : getStatusLabel(applicant.activityType)}
                      className={clsx({
                        info: applicant.activityType === ApplicationStatus.New && !applicant.isHired,
                        warning: [ApplicationStatus.InProgress, ApplicationStatus.OnHold, ApplicationStatus.Shortlisted].includes(applicant.activityType) && !applicant.isHired,
                        success: applicant.activityType === ApplicationStatus.Selected || applicant.isHired,
                        danger: applicant.activityType === ApplicationStatus.Rejected && !applicant.isHired,
                      })}
                    />
                    {canEditApplicant && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setLifecycleOpen(true)}
                        sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.25, px: 1, minHeight: 28, borderRadius: 1.5 }}
                      >
                        Manage Stage →
                      </Button>
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {applicant.isHired ? `Employee record active (ID: ${applicant.employeeId || "Assigned"}).` : "Stage is managed via the recruitment workflow lifecycle."}
                  </Typography>
                </Stack>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack spacing={0.75} sx={{
                  alignItems: "flex-start"
                }}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "APPLICANT.STATUS_LABEL" })}:
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
                    inputProps={{ "aria-label": "controlled" }}
                  />
                </Stack>
              </Grid>
            </Grid>
        }
      </Card>
      {
        !CvPreviewMode &&
        <Card
          sx={{
            p: { xs: 1.5, sm: 2.5, md: 3 },
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 12px 36px rgba(15,23,42,.07)",
            backgroundImage: "none",
            overflow: "hidden",
          }}
        >
          <Stack direction={{ xs: "column", sm: "row" }} gap={1.5} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} mb={{ xs: 2, sm: 2.5 }}>
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

          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2.5, overflowX: "auto", "&::-webkit-scrollbar": { height: 7 }, "&::-webkit-scrollbar-thumb": { bgcolor: "action.selected", borderRadius: 8 } }}>
            <CustomisedTable
              keyName="id"
              rows={commentList}
              columns={CommentTableColumnList}
              page={0}
              rowsPerPage={0}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
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

