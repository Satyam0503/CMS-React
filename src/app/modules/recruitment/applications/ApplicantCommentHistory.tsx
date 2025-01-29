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
import { colors } from "../../theme/MuiTheme";

export const ApplicantCommentHistory = () => {
  const intl = useIntl();
  return (
    <>
      <Grid container display={"flex"} flexDirection={"column"} gap={4}>
        <Card sx={{ p: 4 }}>
          <Grid
            container
            display={"flex"}
            justifyContent={"space-between"}
            flexWrap={"wrap"}
            gap={2}
            mb={4}
          >
            <Grid item xs={12} md={6}>
              <Typography variant="h5">
                {intl.formatMessage({ id: "APPLICANT.DETAILS" })}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6} gap={1} display={"flex"}>
              <CustomIconButton icon={<Download />} tooltip="Download CV" />
              <CustomIconButton icon={<Edit />} tooltip="Edit details" />
              <CustomIconButton icon={<Close />} tooltip="Close" />
            </Grid>
          </Grid>
          <Grid container display={"flex"} direction={"column"} gap={1}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4} display={"flex"} gap={1}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "AUTH.INPUT.FULLNAME" })}
                </Typography>{" "}
                :
                <Typography variant="body1">
                  {intl.formatMessage({ id: "Fullname" })}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4} display={"flex"} gap={1}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                </Typography>
                :
                <Typography variant="body1">
                  {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4} display={"flex"} gap={1}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "USER.PHONE" })}
                </Typography>
                :
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.PHONE" })}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={4} display={"flex"} gap={1}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "JOB.POSITION" })}
                </Typography>
                :
                <Typography variant="body1">
                  {intl.formatMessage({ id: "JOB.POSITION" })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} display={"flex"} gap={1}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "USER.EXPERIENCE" })}
                </Typography>
                :
                <Typography variant="body1">
                  {intl.formatMessage({ id: "USER.EXPERIENCE" })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} display={"flex"} gap={1}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "APPLICATION.DATE" })}
                </Typography>{" "}
                :
                <Typography variant="body1">
                  {intl.formatMessage({ id: "APPLICATION.DATE" })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} display={"flex"} gap={1}>
                <Typography variant="body1" fontWeight={600}>
                  {intl.formatMessage({ id: "APPLICATION.SEEN_BY" })}
                </Typography>{" "}
                :
                <Typography variant="body1">
                  {intl.formatMessage({ id: "APPLICATION.SEEN_BY" })}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4} display={"flex"} gap={1}>
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
              </Grid>
            </Grid>
          </Grid>
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
