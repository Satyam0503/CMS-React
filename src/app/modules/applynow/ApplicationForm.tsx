import {
  Typography,
  Grid,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Container,
  Box,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Close, CloudUploadOutlined } from "@mui/icons-material";
import CustomisedButton from "../../shared/components/CustomisedButton";

type Props = {
  className: string;
};

export default function ApplicationForm() {
  const intl = useIntl();

  return (
    <>
      <form>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h5">
              {intl.formatMessage({ id: "JOB.APPLICATION" })}
            </Typography>
            <Typography variant="body2">
              {intl.formatMessage({ id: "MESSAGE.PLEASE_FILL_FORM" })}
            </Typography>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "FORM.FIRST_NAME" })}
            </Typography>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.LAST_NAME" })}
            </Typography>
            <TextField fullWidth type="text" />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "FORM.PHONE" })}
            </Typography>
            <TextField fullWidth type="number" />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
            </Typography>
            <TextField
              fullWidth
              type="email"
              onWheel={(e: any) => e.target.blur()}
              onKeyDown={(e) => {
                if (e.key === "-" || e.key === "+") e.preventDefault();
              }}
            />
          </Grid>

          <Grid item xs={12} lg={6}>
            <FormControl fullWidth>
              <Typography variant="body1">
                {intl.formatMessage({ id: "JOB.POSITION" })}
              </Typography>
              <Select labelId="demo-simple-select-label">
                <MenuItem>.Net Developer</MenuItem>
                <MenuItem>Designer</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} lg={6}>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.EXPERIENCE" })}
            </Typography>
            <FormControl fullWidth>
              <Select labelId="demo-simple-select-label">
                <MenuItem>0-1</MenuItem>
                <MenuItem>1-2</MenuItem>
                <MenuItem>2-3</MenuItem>
                <MenuItem>3-4</MenuItem>
                <MenuItem>4-5</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Box
              sx={{
                border: "1px dashed grey",
                borderRadius: 1,
                cursor: "pointer",
                width: "100%",
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
                  <CloudUploadOutlined
                    fontSize="large"
                    sx={{ margin: "auto" }}
                  />
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
                    {intl.formatMessage({
                      id: "FILE.UPLOAD_INSTRUCTION",
                    })}
                  </Typography>
                </Grid>
              </Container>
            </Box>
          </Grid>

          <Grid item xs={12}>
            {/* <ReCAPTCHA
                            sitekey={String(CAPTCHA_SITE_KEY)}
                            onChange={handleRecaptchaChange}
                          />
                          {formErrors.captcha && (
                            <Typography className="error-validation">
                              {formErrors.captcha}
                            </Typography>
                          )} */}
          </Grid>
          <Grid item xs={12} display={"flex"} alignItems={"center"} gap={1}>
            <CustomisedButton
              variant="contained"
              label="Submit"
              size="large"
            />
            <CustomisedButton
              variant="outlined"
              Icon={<Close />}
              label="Close"
              size="large"
            />
            <Typography variant="body2">
              On clicking submit button, you are accepting all terms and
              conditions.
            </Typography>
          </Grid>
        </Grid>
      </form>
    </>
  );
}
