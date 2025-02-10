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
import { Applicant, JobModal } from "../../../../utils/common_types";
import { useEffect, useState } from "react";
import { CircularLoader } from "../../components/CircularLoader";
import { Formik } from "formik";
import { applicantValidationSchema } from "../../../../utils/Schema/applicantValidationSchema";
import { TextInput } from "../../components/form_component/TextInput";
import { SelectInput } from "../../components/form_component/SelectInput";
import { experienceCategoryList } from "../../../../utils/common";

interface StateType {
  applicant: Applicant;
}

export const EditApplicant = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vacancyList, setVacancyList] = useState<JobModal[]>([]);
  const state = useLocation().state as Applicant;

  useEffect(() => {
    if (!state || Object.keys(state).length === 0) {
      navigate("/error", { replace: true });
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <CircularLoader />;
  }
  console.log(state);

  const initialValues = {
    ...state,
  };

  return (
    <Card sx={{ p: 2.6 }}>
      <Stack spacing={2}>
        <Typography variant="h5">
          {intl.formatMessage({ id: "UPDATE.EMP.INFO" })}
        </Typography>
        <Grid container display={"flex"} direction={"column"} gap={1}>
          <Formik
            initialValues={initialValues}
            validationSchema={applicantValidationSchema}
            onSubmit={(value) => {
              console.log(value);
            }}
          >
            {(formik) => (
              <form onSubmit={formik.handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.FIRST_NAME" })}
                      type="text"
                      name="firstName"
                      placeholder="FirstName"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.LAST_NAME" })}
                      type="text"
                      name="lastName"
                      placeholder="Last Name"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextInput
                      label={intl.formatMessage({ id: "USER.PHONE" })}
                      type="text"
                      name="phone"
                      placeholder="Phone Number"
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextInput
                      label={intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                      type="email"
                      name="email"
                      placeholder="Email"
                      disabled={true}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SelectInput
                      label={intl.formatMessage({ id: "JOB.POSITION" })}
                      name="vacancyId"
                    >
                      {vacancyList.map((vacancy) => (
                        <MenuItem value={vacancy.jobId} key={vacancy.jobId}>
                          {vacancy.title}
                        </MenuItem>
                      ))}
                    </SelectInput>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <SelectInput
                      label={intl.formatMessage({ id: "PROFILE.EXP" })}
                      name="experience"
                    >
                      {experienceCategoryList.map((experience) => (
                        <MenuItem value={experience.value} key={experience.id}>
                          {experience.label}
                        </MenuItem>
                      ))}
                    </SelectInput>
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
                  {/* {fileError && <Typography variant="body2">{fileError}</Typography>} */}
                  <CustomisedButton
                    variant="outlined"
                    size="medium"
                    label="Cancel"
                  />
                  <CustomisedButton
                    variant="contained"
                    size="medium"
                    label="Update" 
                    type="submit"
                    disabled={formik.isSubmitting || !formik.isValid}
                  />
                </Grid>
              </form>
            )}
          </Formik>
        </Grid>
      </Stack>
    </Card>
  );
};
