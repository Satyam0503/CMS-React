import {
  Box,
  Card,
  Container,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Select,
  Stack,
  TextField,
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
interface StateType {
  applicantId: string;
}

export const ApplicantDetails = () => {
  const state = useLocation().state as StateType;
  const navigate = useNavigate();
  const applicantId = state.applicantId;
  if(!applicantId){
    navigate("/error",{replace:true});
  }
  const intl = useIntl();
  return (
    <>
      <Grid container display={"flex"} flexDirection={"column"} gap={4}>
        <Card sx={{ p: 2 }}>
          <Stack spacing={2}>
            <Stack
              direction={"row"}
              justifyContent={"space-between"}
              flexWrap={"wrap"}
              spacing={2}
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
            <Grid container spacing={1}>
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction={"row"} spacing={2}>
                  <Typography variant="body1" fontWeight={600}>
                    {intl.formatMessage({ id: "AUTH.INPUT.FULLNAME" })} :
                  </Typography>{" "}
                  <Typography variant="body1">
                    FullName
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Stack direction={"row"} spacing={2}>
                  <Typography variant="body1" fontWeight={600}>
                    {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })} :
                  </Typography>

                  <Typography variant="body1">
                    {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Stack direction={"row"} spacing={2}>
                  <Typography variant="body1" fontWeight={600}>
                    {intl.formatMessage({ id: "USER.PHONE" })} :
                  </Typography>

                  <Typography variant="body1">
                    {intl.formatMessage({ id: "USER.PHONE" })}
                  </Typography>
                </Stack>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Stack direction={"row"} spacing={2}>
                  <Typography variant="body1" fontWeight={600}>
                    {intl.formatMessage({ id: "JOB.POSITION" })} :
                  </Typography>

                  <Typography variant="body1">
                    {intl.formatMessage({ id: "JOB.POSITION" })}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction={"row"} spacing={2}>
                  <Typography variant="body1" fontWeight={600}>
                    {intl.formatMessage({ id: "USER.EXPERIENCE" })} :
                  </Typography>

                  <Typography variant="body1">
                    {intl.formatMessage({ id: "USER.EXPERIENCE" })}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction={"row"} spacing={2}>
                  <Typography variant="body1" fontWeight={600}>
                    {intl.formatMessage({ id: "APPLICATION.DATE" })}
                  </Typography>{" "}
                  :
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "APPLICATION.DATE" })}
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <Stack direction={"row"} spacing={2}>
                  <Typography variant="body1" fontWeight={600}>
                    {intl.formatMessage({ id: "APPLICATION.SEEN_BY" })}
                  </Typography>{" "}
                  :
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "APPLICATION.SEEN_BY" })}
                  </Typography>
                </Stack>
              </Grid>
              {/* <Grid item xs={12} sm={4} display={"flex"} gap={1}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "APPLICATION.SEEN_DATE" })}
                </Typography>{" "}
                :
                <Typography variant="body1" flexWrap={"wrap"}>
                  {intl.formatMessage({ id: "APPLICATION.SEEN_DATE" })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} display={"flex"} gap={1}>
                <Typography variant="body1" fontWeight={600} flexWrap={"wrap"}>
                  {intl.formatMessage({ id: "APPLICATION.STATUS" })}
                </Typography>{" "}
                :
                <Typography variant="body1" flexWrap={"wrap"}>
                  {intl.formatMessage({ id: "Active" })}
                </Typography>
              </Grid> */}
            </Grid>
          </Stack>
        </Card>
        <Card sx={{ p: 2 }}>
          <Grid
            container
            display={"flex"}
            justifyContent={"space-between"}
            mb={2}
            gap={2}
            flexWrap={"wrap"}
          >
            <Typography variant="h5">
              {intl.formatMessage({ id: "APPLICANT.COMMENT" })}
            </Typography>

            <CustomisedButton
              Icon={<Comment />}
              iconPosition="start"
              label="Comment"
              variant="contained"
            />
          </Grid>
          <BasicTable />
        </Card>
      </Grid>
    </>
  );
};
