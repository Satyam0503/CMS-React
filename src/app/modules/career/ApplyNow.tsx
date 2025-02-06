import {
  Typography,
  Grid,
  Stack,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Container,
  Box,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CloudUploadOutlined } from "@mui/icons-material";
import { SingleBanner } from "./SingleBanner";
import CustomisedButton from "../components/CustomisedButton";
import { useState } from "react";
import { toAbsoluteUrl } from "../../../_themes/helpers";
import Footer from "./Footer";
import { colors } from "../theme/MuiTheme";

type Props = {
  className: string;
};

export default function ApplyNow() {
  const intl = useIntl();
  const [jobPositionsList, setJobPositionsList] = useState<any[]>([]);
  return (
    <>
      <Grid container display={"flex"} justifyContent={"space-between"}>
        <Grid item xs={12} textAlign={"center"}>
          <SingleBanner title="Apply " titleorange={"Now"} />

          <Typography variant="h5">We are hiring</Typography>
        </Grid>

        <Container>
          <Grid
            item
            xs={12}
            sm={8}
            p={{ xs: 2, md: 5 }}
            borderRadius={2}
            display={"flex"}
            flexDirection={"column"}
            gap={2}
            margin={"auto"}
            sx={{
              boxShadow: "4px 5px 28px -6px #b4a7c9",
              marginBottom: "20px",
            }}
          >
            <form>
              <Grid item xs={12}>
                <Stack mb={2} spacing={1}>
                  <Typography variant="h3" color={colors.alpha.secondary[500]}>
                    {intl.formatMessage({ id: "VACANCY.TEXT4" })}
                  </Typography>
                  <Typography variant="h5">
                    {intl.formatMessage({ id: "VACANCY.TEXT5" })}
                  </Typography>
                </Stack>

                <Stack spacing={2}>
                  <Stack
                    direction={"row"}
                    display={"flex"}
                    flexWrap={"wrap"}
                    gap={2}
                  >
                    <CustomisedButton
                      variant="outlined"
                      label=".Net Developer"
                    />
                    <CustomisedButton
                      variant="outlined"
                      label=".Net Developer"
                    />
                    <CustomisedButton
                      variant="outlined"
                      label=".Net Developer"
                    />
                    <CustomisedButton
                      variant="outlined"
                      label=".Net Developer"
                    />
                    <CustomisedButton
                      variant="outlined"
                      label=".Net Developer"
                    />
                    <CustomisedButton
                      variant="outlined"
                      label=".Net Developer"
                    />
                    <CustomisedButton
                      variant="outlined"
                      label=".Net Developer"
                    />
                    <CustomisedButton
                      variant="outlined"
                      label=".Net Developer"
                    />
                    <CustomisedButton
                      variant="outlined"
                      label=".Net Developer"
                    />
                  </Stack>
                  <Stack p={4}>
                    {/* <Typography>*Job description*</Typography> */}
                  </Stack>
                </Stack>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="h5">
                    {intl.formatMessage({ id: "JOB.APPLICATION" })}
                  </Typography>
                  <Typography variant="body2">
                    {intl.formatMessage({ id: "JOB.APPLICATION_CAPTION" })}
                  </Typography>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "USER.FIRST_NAME" })}
                  </Typography>
                  <TextField fullWidth />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "USER.LAST_NAME" })}
                  </Typography>
                  <TextField fullWidth type="text" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="body1">
                    {intl.formatMessage({ id: "USER.PHONE" })}
                  </Typography>
                  <TextField fullWidth type="number" />
                </Grid>
                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} md={6}>
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
                <Grid item xs={12} textAlign={"center"}>
                  <CustomisedButton
                    variant="contained"
                    label="Submit"
                    size="medium"
                  />
                </Grid>
              </Grid>
            </form>
          </Grid>
          <Grid
            item
            xs={12}
            sm={8}
            p={{ xs: 2, md: 5 }}
            borderRadius={2}
            display={"flex"}
            flexDirection={"column"}
            gap={2}
            margin={"auto"}
            sx={{
              boxShadow: "4px 5px 28px -6px #b4a7c9",
              marginBottom: "20px",
            }}
          >
            {jobPositionsList && jobPositionsList.length ? (
              <form></form>
            ) : (
              <Grid
                container
                display={"flex"}
                justifyContent={"center"}
                gap={1}
              >
                <Typography>
                  {intl.formatMessage({
                    id: "VACANCY.TEXT1",
                  })}
                </Typography>

                <img
                  src={toAbsoluteUrl("media/auth/workInProcess.jpg")}
                  width={"100%"}
                />
                <Typography variant="body1">
                  {intl.formatMessage({
                    id: "VACANCY.TEXT2",
                  })}
                </Typography>
                <Typography variant="body1">
                  {intl.formatMessage({
                    id: "VACANCY.TEXT3",
                  })}
                </Typography>
              </Grid>
            )}
          </Grid>
        </Container>

        <Grid item xs={12} width={"100%"}>
          <Footer />
        </Grid>
      </Grid>
    </>
  );
}
