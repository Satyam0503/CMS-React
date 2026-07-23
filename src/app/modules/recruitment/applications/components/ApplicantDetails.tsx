import {
  Card,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Close, Edit, Visibility } from "@mui/icons-material";
import { CustomIconButton } from "../../../../shared/components/CustomIconButton";
import { useNavigate, useParams } from "react-router-dom";
import { useCallback, useEffect, useState } from "react";
import {
  addComment,
  editApplicant,
  getApplicantById,
  getApplicantComments,
} from "../../services";

import {
  commentActionEncoderForApplicationStatus,
  dateFormatter,
  hasModuleFeaturePermission,
} from "../../../../../utils/common";
import {
  ApplicationEvaluationStatus,
  CommentTableColumnList,
} from "../../../../../utils/constant/Constant";

import { CustomisedTable } from "../../../../shared/components/CustomisedTable";
import { AddComment } from "./AddComment";
import { useAppSelector } from "../../../../Redux/hooks";
import { toast } from "react-toastify";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { ApplicantStatus, ModulesName, Permission } from "../../../../../utils/enums";
import { Applicant, CommentResponseModel } from "../../models";
import { Pagination } from "../../../../shared/components/Pagination";
import { usePageData } from "../../../../Context/PageDataProvider";
import { PdfViewer } from "../../../../shared/components/PdfViewer";

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
  const [totalRecords, setTotalRecords] = useState(0);
  const [paginationValues, setPaginationValues] = useState({
    pageNo: 0,
    pageSize: 10,
  });
  const [CvPreviewMode, setCVPreviewMode] = useState(false);

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
  }, [refresh]);

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

  const applicantId = param.applicantid!;

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
      if (status.applicationStatus !== applicant.activityType) {
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
      const commentPayload = {
        applicantId: applicant.applicantId,
        userId: currentUser.userId,
        description: comment,
        activityCategory: commentActionEncoderForApplicationStatus(
          status.applicationStatus
        ),
        jobTitle: applicant.vacancyName,
      };
      const commentResponse = await addComment(commentPayload);
      if (!commentResponse.data.success) {
        throw new Error();
      }
      toast.success(formatMessage({ id: "TOAST.SUCCESS.ADD_COMMENT" }));
      handleClose();
      if (status.applicationStatus !== applicant.activityType) {
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
    <Stack spacing={2} sx={{ flexGrow: 1 }}>
      <Card className="p-6 h-auto">
        <Stack className="flex-row mb-4 gap-2 flex-wrap justify-content-between">
          <Typography variant="h5">
            {formatMessage({ id: "APPLICANT.APPLICANT_DETAILS" })}
          </Typography>

          <Stack direction="row" spacing={1}>
            <CustomIconButton
              icon={CvPreviewMode ? <Close /> : <Visibility />}
              tooltip={formatMessage({ id: "TOOLTIP.VIEW_CV" })}
              handleClick={() => setCVPreviewMode(!CvPreviewMode)}
            />
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
          CvPreviewMode ?
            <PdfViewer pdfUrl={applicant.resumeUrl ?? ""} /> :
            <Grid container spacing={2.5}>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack direction="row" spacing={2}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "FORM.FULL_NAME" })} :
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
                <Stack direction="row" spacing={2}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "FORM.EMAIL" })} :
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
                <Stack direction="row" spacing={2}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "FORM.PHONE" })} :
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
                <Stack direction="row" spacing={2}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "JOB.POSITION" })} :
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
                <Stack direction="row" spacing={2}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "FORM.EXPERIENCE" })} :
                  </Typography>

                  <Typography variant="body1">
                    {formatMessage({ id: "PLURAL.YEAR" }, { years: (applicant.experience / 12).toFixed(1) })}
                  </Typography>
                </Stack>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack direction="row" spacing={2}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "APPLICATION.APPLIED_DATE" })} :
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
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Typography className="fw-bold">
                    {formatMessage({ id: "APPLICATION.STATUS_LABEL" })} :
                  </Typography>
                  <FormControl>
                    <InputLabel id="demo-simple-select-label">
                      {formatMessage({ id: "APPLICATION.STATUS_LABEL" })} :
                    </InputLabel>
                    <AppSelect
                      name="applicantStatus"
                      value={status.applicationStatus}
                      sx={{ width: "150px" }}
                      onChange={handleStatusChange}
                      className="select"
                      label={formatMessage({ id: "APPLICATION.STATUS_LABEL" })}
                    >
                      {ApplicationEvaluationStatus.map((status) => (
                        <MenuItem key={status.id} value={status.value}>
                          {formatMessage({ id: status.label })}
                        </MenuItem>
                      ))}
                    </AppSelect>
                  </FormControl>
                </Stack>
              </Grid>
              <Grid
                size={{
                  xs: 12,
                  sm: 6,
                  lg: 4
                }}>
                <Stack direction="row" spacing={2} sx={{
                  alignItems: "center"
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
        <Card className="p-4 flex-grow-1 gap-4 d-flex flex-column">
          <Stack className="gap-4 flex-row justify-content-between align-items-center flex-wrap">
            <Typography variant="h5">
              {formatMessage({ id: "COMMENT.COMMENT_HISTORY" })}
            </Typography>
            <CustomisedButton
              label={formatMessage({ id: "COMMENT.ADD_COMMENT" })}
              Icon={<Add />}
              handleClick={() => {
                setModalOpen(true);
              }}
            />
          </Stack>

          <CustomisedTable
            keyName="id"
            rows={commentList}
            columns={CommentTableColumnList}
            page={0}
            rowsPerPage={0}
          />
          <Pagination
            page={paginationValues.pageNo}
            rowsPerPage={paginationValues.pageSize}
            setPage={handlePageChange}
            setRowPerPage={handleRowPerPageChange}
            totalRecords={totalRecords}
          />
          {isModalOpen && (
            <AddComment
              loading={loading}
              open={isModalOpen}
              comment={comment}
              handleCommentChange={handleCommentChange}
              handleClose={handleClose}
              handleAddComment={handleAddComment}
            />
          )}
        </Card>
      }
    </Stack >
  );
};
