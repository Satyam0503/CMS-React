import {
  Box,
  Card,
  Container,
  Grid,
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
import { Applicant } from "../../../../utils/common_types";

interface StateType {
  applicant: Applicant;
}

export const EditApplicant = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const state = useLocation().state as StateType;

  return (
    <Container component={Card} sx={{ p: "4rem" }}>
      <Grid container display={"flex"} direction={"column"} gap={1}>
        <Grid item xs={12}>
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
          <Grid item xs={12} sm={4}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "PROFILE.EXP" })}
            </Typography>
            <Select fullWidth>
              <MenuItem>0-1 Years</MenuItem>
              <MenuItem>1-2 Years</MenuItem>
              <MenuItem>3-4 Years</MenuItem>
              <MenuItem>5-6 Years</MenuItem>
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
              borderRadius: 1,
              cursor: "pointer",
            }}
          >
            <Container
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Grid item xs={6} md={6} textAlign={"center"}>
                <CloudUploadOutlined fontSize="large" sx={{ margin: "auto" }} />
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
              <Grid item xs={6} md={6}>
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
