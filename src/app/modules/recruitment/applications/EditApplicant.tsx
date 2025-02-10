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
import { AttachFile, CloudUploadOutlined } from "@mui/icons-material";
import { useLocation, useNavigate } from "react-router-dom";

// interface StateType {
//   applicantId: string;
// }

export const EditApplicant = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  // const state = useLocation().state as StateType;
  // const applicantId = state.applicantId;
  // if (!applicantId) {
  //   navigate("/error", { replace: true });
  // }
  // console.log(state);

  // const handleDownloadResume = async () => {
  //   try {
  //     const response = await fetch("", {
  //       method: "GET",
  //       headers: {
  //         "Content-Type": "application/pdf",
  //       },
  //     });
  //     const fileObj = await response.blob();
  //     const urlObj = window.URL.createObjectURL(fileObj);
  //     const link = document.createElement("a");
  //     link.href = urlObj;
  //     // link.setAttribute("download",`${fullName}_Resume.pdf`);
  //     document.body.appendChild(link);
  //     link.click();
  //     document.body.removeChild(link);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  return (
    <Container component={Card} sx={{ p: 2.6, mt: 2 }}>
      <Grid container display={"flex"} direction={"column"} gap={1}>
        <Grid item xs={12} mb={2}>
          <Typography variant="h5">
            {intl.formatMessage({ id: "UPDATE.EMP.INFO" })}
          </Typography>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.FIRST_NAME" })}
            </Typography>
            <TextField fullWidth />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.LAST_NAME" })}
            </Typography>
            <TextField fullWidth />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.PHONE" })}
            </Typography>
            <TextField fullWidth />
          </Grid>

          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
            </Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "JOB.POSITION" })}
            </Typography>
            <TextField fullWidth />
          </Grid>
        </Grid>

        <Stack mt={2}>
          <Typography variant="h6" fontWeight={600}>
            {intl.formatMessage({ id: "CUSTOMISED.EXPERIENCE" })}
          </Typography>
        </Stack>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "Years" })}
            </Typography>
            <TextField fullWidth type="number" />
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "Month" })}
            </Typography>
            <Select fullWidth type="number">
              <MenuItem>0</MenuItem>
              <MenuItem>1</MenuItem>
              <MenuItem>2</MenuItem>
              <MenuItem>3</MenuItem>
              <MenuItem>4</MenuItem>
              <MenuItem>5</MenuItem>
              <MenuItem>6</MenuItem>
              <MenuItem>7</MenuItem>
              <MenuItem>8</MenuItem>
              <MenuItem>9</MenuItem>
              <MenuItem>10</MenuItem>
              <MenuItem>11</MenuItem>
              <MenuItem>12</MenuItem>
            </Select>
          </Grid>
          <Grid item xs={12} sm={3} md={2}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "PROFILE.STATUS" })}
            </Typography>
            <Select fullWidth type="number">
              <MenuItem>In Progess</MenuItem>
              <MenuItem>On Hold</MenuItem>
              <MenuItem>Shortlisted</MenuItem>
              <MenuItem>Selected</MenuItem>
              <MenuItem>Rejected</MenuItem>
            </Select>
          </Grid>
        </Grid>
      </Grid>
      <Box my={4}>
        <Stack direction={"column"} spacing={1}>
          <Box
            component="label"
            sx={{
              border: "1px dashed grey",

              cursor: "pointer",
            }}
          >
            <Container
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Grid item xs={6} textAlign={"center"} mr={2}>
                <CloudUploadOutlined fontSize="large" />
                <input
                  type="file"
                  accept=".jpg,.png,.webp"
                  //   onChange={handleFileChange}
                  hidden
                />
                <Typography variant="body1" flexWrap={"wrap"}>
                  {intl.formatMessage({ id: "FILE.SELECTED" })}:
                  {/* {seletedFile?.name} */}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" flexWrap={"wrap"}>
                  {intl.formatMessage({ id: "FILE.UPLOAD_INSTRUCTION" })}
                </Typography>
              </Grid>
            </Container>
          </Box>
        </Stack>
      </Box>

      <Grid
        item
        xs={12}
        display={"flex"}
        direction={{ xs: "column", sm: "row" }}
        justifyContent={"flex-end"}
        mt={1}
        gap={1}
      >
        <CustomisedButton
          label="Upload File"
          Icon={<AttachFile />}
          iconPosition="end"
          // disabled={!seletedFile}
          // handleClick={handleUpdateAvatar}
        />

        {/* {fileError && <Typography variant="body2">{fileError}</Typography>} */}
        <CustomisedButton variant="outlined" size="medium" label="Cancel" />
        <CustomisedButton variant="contained" size="medium" label="Update " />
      </Grid>
    </Container>
  );
};
