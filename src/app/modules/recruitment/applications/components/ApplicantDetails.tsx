import {
  Button,
  Card,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Add, Download, Edit, Visibility } from "@mui/icons-material";
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
  convertMonthsToYear,
  dateFormatter,
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
import { ApplicantStatus } from "../../../../../utils/enums";
import { Applicant, CommentModel } from "../../models";

export const ApplicantDetails = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const currentUser = useAppSelector((state) => state.user.userData)!;
  const [loading, setLoading] = useState(false);
  const [applicant, setApplicant] = useState<Applicant>({} as Applicant);
  const [commentList, setCommentList] = useState<CommentModel[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [refreshComment, setRefreshComment] = useState(false);
  const [comment, setComment] = useState("");
  const param = useParams();

  const [status, setStatus] = useState({
    applicationStatus: 0,
    applicantStatus: 0,
  });

  useEffect(() => {
    // setLoading(true);
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
    const getAllComments = async () => {
      try {
        const response = await getApplicantComments(applicantId);
        const { methodResults, success, statusCode, message } = response.data;
        if (!(success && statusCode === 200)) {
          throw new Error(message);
        }
        setCommentList(methodResults.reverse());
      } catch (error: any) {
        console.error(error.message);
      }
    };
    getAllComments();
  }, [refreshComment]);

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
      companyId: currentUser.companyId,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      vacancyId: applicant.vacancyId,
      experience: applicant.experience,
      vacancyName: applicant.vacancyName,
      activityType: status.applicationStatus,
      status: applicantStatus,
      state: applicant.state,
    };
    const response = await editApplicant(payload);
    const { success } = response.data;
    if (success) {
      toast.success("Applicant status updated.");
      setRefresh(!refresh);
    }
  };

  const handleAddComment = async () => {
    setLoading(true);
    try {
      if (status.applicationStatus !== applicant.activityType) {
        const payload = {
          applicantId: applicant.applicantId,
          companyId: currentUser.companyId,
          firstName: applicant.firstName,
          lastName: applicant.lastName,
          email: applicant.email,
          phone: applicant.phone,
          vacancyId: applicant.vacancyId,
          experience: applicant.experience,
          vacancyName: applicant.vacancyName,
          activityType: status.applicationStatus,
          status: applicant.status,
          state: applicant.state,
        };
        const response = await editApplicant(payload);
        const { success, message } = response.data;
        if (!success) {
          throw new Error(message);
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
        throw new Error(commentResponse.data.message);
      }
      toast.success(commentResponse.data.message);
      handleClose();
      if (status.applicationStatus !== applicant.activityType) {
        setRefresh(!refresh);
      }
      setRefreshComment(!refreshComment);
    } catch (error: any) {
      toast.error(error.message);
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

  const handleDownloadResume = async () => {
    try {
      const response = await fetch(applicant.fullApplicantResumePath, {
        method: "GET",
        headers: {
          "Content-Type": "application/pdf",
        },
      });
      const fileObj = await response.blob();
      const urlObj = window.URL.createObjectURL(fileObj);
      const link = document.createElement("a");
      link.href = urlObj;
      // link.setAttribute("download", `${applicant.firstName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Stack spacing={2} mt={2}>
        <Card sx={{ p: 2 }}>
          <Stack
            direction={"row"}
            justifyContent={"space-between"}
            flexWrap={"wrap"}
            spacing={2}
            mb={2}
          >
            <Typography variant="h5">
              {intl.formatMessage({ id: "APPLICANT.DETAILS" })}
            </Typography>

            <Stack direction={"row"} spacing={1}>
              <CustomIconButton
                icon={<Visibility />}
                tooltip="View CV"
                handleClick={() => handleDownloadResume()}
              />
              <CustomIconButton
                icon={<Edit />}
                tooltip="Edit Applicant"
                handleClick={() => {
                  navigate("/recruitment/editapplicant", { state: applicant });
                }}
              />
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "FORM.FULL_NAME" })} :
                </Typography>{" "}
                <Typography variant="body1">
                  {applicant?.firstName + " " + applicant?.lastName}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "FORM.EMAIL" })} :
                </Typography>

                <Typography variant="body1">{applicant?.email}</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "USER.PHONE" })} :
                </Typography>

                <Typography variant="body1">{applicant?.phone}</Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "JOB.POSITION" })} :
                </Typography>

                <Typography variant="body1">
                  {applicant?.vacancyName}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "USER.EXPERIENCE" })} :
                </Typography>

                <Typography variant="body1">
                  {convertMonthsToYear(applicant.experience)}
                </Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "APPLICATION.DATE" })} :
                </Typography>
                <Typography variant="body1">
                  {dateFormatter(applicant?.applyDate, "DD MMM YYYY hh:mm A")}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Stack
                direction={"row"}
                spacing={2}
                sx={{ alignItems: "center" }}
              >
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "APPLICATION.STATUS" })} :
                </Typography>
                <FormControl>
                  <InputLabel id="demo-simple-select-label">
                    {intl.formatMessage({ id: "APPLICATION.STATUS" })} :
                  </InputLabel>
                  <Select
                    name="applicantStatus"
                    value={status.applicationStatus}
                    sx={{ width: "150px" }}
                    onChange={handleStatusChange}
                    className="select"
                    label="Application Status"
                  >
                    {ApplicationEvaluationStatus.map((status) => (
                      <MenuItem key={status.id} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2} alignItems={"center"}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "APPLICANT.STATUS" })}:
                </Typography>
                <Switch
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
        </Card>
        <Card sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction={"row"}
              spacing={1}
              justifyContent={"space-between"}
              alignItems={"center"}
            >
              <Typography variant="h5">
                {intl.formatMessage({ id: "APPLICANT.COMMENT" })}
              </Typography>
              <CustomisedButton
                label={intl.formatMessage({ id: "APPLICANT.ADD_COMMENT" })}
                Icon={<Add />}
                handleClick={() => {
                  setModalOpen(true);
                }}
              />
            </Stack>

            <CustomisedTable
              //keyName="commentId"
              rows={commentList}
              columns={CommentTableColumnList}
              page={0}
              rowsPerPage={0}
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
          </Stack>
        </Card>
      </Stack>
    </>
  );
};
