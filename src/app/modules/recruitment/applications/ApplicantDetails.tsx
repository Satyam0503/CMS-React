import {
  Box,
  Card,
  CircularProgress,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";
import {
  AttachFile,
  Close,
  CloudUploadOutlined,
  Comment,
  Download,
  Edit,
} from "@mui/icons-material";
import { CustomIconButton } from "../../components/CustomIconButton";
import BasicTable from "../../components/BasicTable";
import { useLocation, useNavigate } from "react-router-dom";
import { ChangeEvent, useEffect, useState } from "react";
import { getApplicantById } from "../services";
import { Applicant } from "../../../../utils/common_types";
import {
  applicationStatusDecoder,
  dateFormatter,
} from "../../../../utils/common";
import {
  ApplicationEvaluationStatus,
  CommentTableColumnList,
} from "../../../../utils/constant/Constant";
import { CircularLoader } from "../../components/CircularLoader";
import { CustomisedTable } from "../../components/CustomisedTable";
import { AddComment } from "./AddComment";
interface StateType {
  applicantId: string;
}
export const ApplicantDetails = () => {
  const intl = useIntl();
  const [loading, setLoading] = useState(true);
  const state = useLocation().state as StateType;
  const navigate = useNavigate();
  const [commentList, setCommentList] = useState<any[]>([]);
  const [applicant, setApplicant] = useState<Applicant>({} as Applicant);
  const [isModalOpen, setModalOpen] = useState(false);
  const [applicantStatus, setApplicantStatus] = useState<number>();
  const applicantId = state.applicantId;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      getApplicantById(applicantId)
        .then(({ data }) => {
          if (!data.success) {
            throw new Error(data.message);
          }
          setApplicant(data.methodResult);
          setApplicantStatus(data.methodResult.status);
        })
        .catch((error) => {
          console.error(error);
          navigate("/error");
        })
        .finally(() => setLoading(false));
    }, 2000);
  }, []);
  if (!applicantId) {
    navigate("/error", { replace: true });
  }
  if (loading) {
    return <CircularLoader />;
  }
  const experienceSuffix = applicant.experience > 1 ? "Years" : "Year";

  const handleAddComment = () => {};
  const handleClose = () => {
    setModalOpen(false);
  };

  const handleStatusChange = (event: SelectChangeEvent<number>) => {
    setModalOpen(true);
    setApplicantStatus(event.target.value as number);
  };

  console.log("render");

  return (
    <>
      <Grid container display={"flex"} flexDirection={"column"} gap={4}>
        <Card sx={{ p: 2 }}>
          {/* <Stack spacing={1}> */}
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
              <CustomIconButton icon={<Download />} tooltip="Download CV" />
              <CustomIconButton icon={<Edit />} tooltip="Edit details" />
              <CustomIconButton icon={<Close />} tooltip="Close" />
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
                </Typography>{" "}
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
                  value={applicantStatus}
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
          </Grid>
          {/* </Stack> */}
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
                Icon={<Comment />}
                label="Add Comment"
                handleClick={() => setModalOpen(true)}
              />
            </Stack>

            <CustomisedTable
              rows={commentList}
              columns={CommentTableColumnList}
              page={0}
              rowsPerPage={0}
            />

            <AddComment
              open={isModalOpen}
              handleClose={handleClose}
              handleAddComment={handleAddComment}
            />
          </Stack>
        </Card>
      </Grid>
    </>
  );
};
