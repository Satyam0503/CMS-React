import {
  Card,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Download, Edit } from "@mui/icons-material";
import { CustomIconButton } from "../../components/CustomIconButton";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  addComment,
  editApplicant,
  getApplicantById,
  getApplicantComments,
} from "../services";
import { Applicant, CommentModel } from "../../../../utils/common_types";
import {
  applicantStatusDecoder,
  commentActionEncoderForApplicationStatus,
  dateFormatter,
  getApplicantStatusClass,
} from "../../../../utils/common";
import {
  ApplicationEvaluationStatus,
  CommentTableColumnList,
} from "../../../../utils/constant/Constant";
import { CircularLoader } from "../../components/CircularLoader";
import { CustomisedTable } from "../../components/CustomisedTable";
import { AddComment } from "./AddComment";
import { StyleStatus } from "../../components/StyledStatus";
import { useAppSelector } from "../../../Redux/hooks";
import { toast } from "react-toastify";
import { ApplicantStatus, ApplicationStatus } from "../../../../utils/enums";

interface StateType {
  applicantId: string;
}

const ApplicantStatusMapper: {
  [index: number]: ApplicantStatus;
} = {
  [ApplicationStatus.New]: ApplicantStatus.New,
  [ApplicationStatus.InProgress]: ApplicantStatus.Active,
  [ApplicationStatus.OnHold]: ApplicantStatus.Active,
  [ApplicationStatus.Shortlisted]: ApplicantStatus.Active,
  [ApplicationStatus.Selected]: ApplicantStatus.Active,
  [ApplicationStatus.Rejected]: ApplicantStatus.InActive,
};

export const ApplicantDetails = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const userData = useAppSelector((state) => state.user.userData)!;
  const [loading, setLoading] = useState(true);
  const [applicant, setApplicant] = useState<Applicant>({} as Applicant);
  const [commentList, setCommentList] = useState<CommentModel[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [activityType, setActivityType] = useState<number>(0);
  const [refresh, setRefresh] = useState(false);
  const [comment, setComment] = useState("");
  const param = useParams();

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      getApplicantById(applicantId)
        .then(({ data }) => {
          if (!(data.success && data.statusCode === 200)) {
            throw new Error(data.message);
          }
          setApplicant(data.methodResult);
          setActivityType(data.methodResult.activityType);
        })
        .catch((error) => {
          console.error(error);
          navigate("/error", { replace: true });
        })
        .finally(() => setLoading(false));
    }, 1500);
  }, [refresh]);

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        const response = await getApplicantComments(applicantId);
        const { methodResults, success, statusCode, message } = response.data;
        if (!(success && statusCode === 200)) {
          throw new Error(message);
        }
        setCommentList(methodResults);
      } catch (error: any) {
        console.error(error.message);
      }
    }, 1500);
    return () => clearTimeout(timeoutId);
  }, [refresh]);

  if (Object.keys(param).length === 0 || !param.applicantid) {
    navigate("/error", { replace: true });
  }

  const applicantId = param.applicantid!;

  if (loading) {
    return <CircularLoader />;
  }

  const experienceSuffix = applicant.experience > 1 ? "Years" : "Year";

  const handleAddComment = async () => {
    const payload = {
      applicantId: applicant.applicantId,
      companyId: userData.companyId,
      firstName: applicant.firstName,
      lastName: applicant.lastName,
      email: applicant.email,
      phone: applicant.phone,
      vacancyId: applicant.vacancyId,
      experience: applicant.experience,
      vacancyName: applicant.vacancyName,
      activityType: activityType,
      status: ApplicantStatusMapper[activityType],
    };
    try {
      const response = await editApplicant(payload);
      const { success, message } = response.data;
      if (!success) {
        throw new Error(message);
      }
      const commentPayload = {
        applicantId: applicant.applicantId,
        userId: userData.userId,
        description: comment,
        activityCategory:
          commentActionEncoderForApplicationStatus(activityType)!,
        userName: userData.firstName + " " + userData.lastName,
      };
      const commentResponse = await addComment(commentPayload);
      if (!commentResponse.data.success) {
        throw new Error(commentResponse.data.message);
      }
      toast.success(commentResponse.data.message);
      handleClose();
      setRefresh(!refresh);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleClose = () => {
    setActivityType(applicant.activityType);
    setModalOpen(false);
    setComment("");
  };

  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    if (typeof event.target.value === "number") {
      setActivityType(event.target.value);
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
      link.setAttribute("download",`${applicant.firstName}_Resume.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error(error);
    }
  };
  
  return (
    <>
      <Stack spacing={2}>
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
                icon={<Download />}
                tooltip="Download CV"
                handleClick={() => handleDownloadResume()}
              />
              <CustomIconButton icon={<Edit />} tooltip="Edit details" />
            </Stack>
          </Stack>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "AUTH.INPUT.FULLNAME" })} :
                </Typography>{" "}
                <Typography variant="body1">
                  {applicant?.firstName + " " + applicant?.lastName}
                </Typography>
              </Stack>
            </Grid>

            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })} :
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
                  {applicant?.experience + " " + experienceSuffix}
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
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600} flexWrap={"wrap"}>
                  {intl.formatMessage({ id: "APPLICATION.STATUS" })} :
                </Typography>

                <Select
                  name="applicantStatus"
                  value={activityType}
                  sx={{ width: "200px" }}
                  onChange={handleStatusChange}
                >
                  {ApplicationEvaluationStatus.map((status) => (
                    <MenuItem key={status.id} value={status.value}>
                      {status.label}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} lg={4}>
              <Stack direction={"row"} spacing={2}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "APPLICANT.STATUS" })} :
                </Typography>
                <StyleStatus
                  label={applicantStatusDecoder(applicant.status)}
                  className={getApplicantStatusClass(applicant.status)}
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
            </Stack>

            <CustomisedTable
              rows={commentList}
              columns={CommentTableColumnList}
              page={0}
              rowsPerPage={0}
            />
            {isModalOpen && (
              <AddComment
                open={isModalOpen}
                comment={comment}
                setComment={setComment}
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
