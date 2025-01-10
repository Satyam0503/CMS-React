import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { getUserByToken, register } from "../core/_requests";
import { Link } from "react-router-dom";
import { PasswordMeterComponent } from "../../../../_themes/assets/ts/components";
import { useAuth } from "../core/Auth";
import {
  Box,
  Checkbox,
  Container,
  FormControl,
  Grid,
  Input,
  InputAdornment,
  InputLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";
import { colors } from "../../theme/MuiTheme";
import { AccountCircle, Check } from "@mui/icons-material";
import { registrationSchema } from "../../../../utils/Schema/registrationSchema";

const initialValues = {
  firstname: "",
  lastname: "",
  companyname: "",
  email: "",
  password: "",
  changepassword: "",
  acceptTerms: false,
};



export function Registration() {
  
  const [loading, setLoading] = useState(false);
  const { saveAuth, setCurrentUser } = useAuth();
  const intl = useIntl();
  const formik = useFormik({
    initialValues,
    validationSchema: registrationSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        const { data: auth } = await register(
          values.email,
          values.firstname,
          values.lastname,
          values.password,
          values.changepassword
        );
        saveAuth(auth);
        const { data: user } = await getUserByToken(auth.api_token);
        setCurrentUser(user.methodResult);
      } catch (error) {
        console.error(error);
        saveAuth(undefined);
        setStatus("The registration details is incorrect");
        setSubmitting(false);
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    PasswordMeterComponent.bootstrap();
  }, []);

  return (
    <Container>
      <form onSubmit={formik.handleSubmit}>
        <Stack alignItems={"center"} mb={4}>
          <Typography variant="h3">
            {intl.formatMessage({ id: "AUTH.REGISTER.TITLE" })}
          </Typography>
          <Typography variant="body1" color={colors.alpha.primary[500]}>
            {intl.formatMessage({ id: "AUTH.REGISTER.CMS" })}
          </Typography>
        </Stack>
        <Stack spacing={1}>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.FIRST_NAME" })}
            </Typography>
            <TextField
              sx={{ my: 0.5 }}
              placeholder="First name"
              type="text"
              autoComplete="off"
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              {...formik.getFieldProps("firstname")}
              // className={clsx(
              //   "form-control bg-transparent",
              //   {
              //     "is-invalid":
              //       formik.touched.firstname && formik.errors.firstname,
              //   },
              //   {
              //     "is-valid":
              //       formik.touched.firstname && !formik.errors.firstname,
              //   }
              // )}
            />
            {formik.touched.firstname && formik.errors.firstname && (
              <Box
                component="span"
                role="alert"
                color={colors.alpha.danger[500]}
              >
                {formik.errors.firstname}
              </Box>
            )}
          </Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "USER.LAST_NAME" })}
            </Typography>
            <TextField
              sx={{ my: 0.5 }}
              placeholder="Last name"
              type="text"
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              {...formik.getFieldProps("lastname")}
              // className={clsx(
              //   "form-control bg-transparent",
              //   {
              //     "is-invalid":
              //       formik.touched.lastname && formik.errors.lastname,
              //   },
              //   {
              //     "is-valid":
              //       formik.touched.lastname && !formik.errors.lastname,
              //   }
              // )}
            />
            {formik.touched.lastname && formik.errors.lastname && (
              <Box
                component="span"
                role="alert"
                color={colors.alpha.danger[500]}
              >
                {formik.errors.lastname}
              </Box>
            )}
          </Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "COMPANY.NAME" })}
            </Typography>

            <TextField
              sx={{ my: 1, bgcolor: "transparent" }}
              placeholder="Company name"
              type="text"
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              {...formik.getFieldProps("companyname")}
              // className={clsx(
              //   "form-control ",
              //   {
              //     "is-invalid":
              //       formik.touched.companyname && formik.errors.companyname,
              //   },
              //   {
              //     "is-valid":
              //       formik.touched.companyname && !formik.errors.companyname,
              //   }
              // )}
            />
            {formik.touched.companyname && formik.errors.companyname && (
              <Box
                component="span"
                role="alert"
                color={colors.alpha.danger[500]}
              >
                {formik.errors.companyname}
              </Box>
            )}
          </Stack>
          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
            </Typography>
            <TextField
              sx={{ my: 1 }}
              placeholder="Email Id"
              type="email"
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              fullWidth
              {...formik.getFieldProps("email")}
              // className={clsx(
              //   "form-control bg-transparent",
              //   {
              //     "is-invalid": formik.touched.email && formik.errors.email,
              //   },
              //   {
              //     "is-valid": formik.touched.email && !formik.errors.email,
              //   }
              // )}
            />
            {formik.touched.email && formik.errors.email && (
              <Box
                component="span"
                role="alert"
                color={colors.alpha.danger[500]}
              >
                {formik.errors.email}
              </Box>
            )}
          </Stack>

          <Stack>
            <Stack data-kt-password-meter="true">
              <Typography variant="body1">
                {intl.formatMessage({ id: "AUTH.INPUT.PASSWORD" })}
              </Typography>
              <Stack>
                <TextField
                  sx={{ my: 1 }}
                  fullWidth
                  type="password"
                  placeholder="Password"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Check />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  autoComplete="off"
                  {...formik.getFieldProps("password")}
                  // className={clsx(
                  //   "form-control bg-transparent",
                  //   {
                  //     "is-invalid":
                  //       formik.touched.password && formik.errors.password,
                  //   },
                  //   {
                  //     "is-valid":
                  //       formik.touched.password && !formik.errors.password,
                  //   }
                  // )}
                />
                {formik.touched.password && formik.errors.password && (
                  <Stack>
                    <Box
                      component="span"
                      role="alert"
                      color={colors.alpha.danger[500]}
                    >
                      {formik.errors.password}
                    </Box>
                  </Stack>
                )}
              </Stack>

              <Grid
                container
                alignItems={"center"}
                my={1}
                data-kt-password-meter-control="highlight"
              >
                <Stack
                  flexGrow={1}
                  bgcolor={colors.alpha.secondary[500]}
                  className="bg-active-success"
                  sx={{
                    mr: 1,
                    height: "5px",
                    borderRadius: "8px",
                    "&:active": {
                      bgcolor: colors.alpha.success[500],
                    },
                  }}
                />
                <Stack
                  flexGrow={1}
                  bgcolor={colors.alpha.secondary[500]}
                  className="bg-active-success"
                  sx={{
                    mr: 1,
                    height: "5px",
                    borderRadius: "8px",
                    "&:active": {
                      bgcolor: colors.alpha.success[500],
                    },
                  }}
                />
                <Stack
                  flexGrow={1}
                  bgcolor={colors.alpha.secondary[500]}
                  className="bg-active-success"
                  sx={{
                    mr: 1,
                    height: "5px",
                    borderRadius: "8px",
                    "&:active": {
                      bgcolor: colors.alpha.success[500],
                    },
                  }}
                />
                <Stack
                  flexGrow={1}
                  bgcolor={colors.alpha.secondary[500]}
                  className="bg-active-success"
                  sx={{
                    mr: 1,
                    height: "5px",
                    borderRadius: "8px",
                    "&:active": {
                      bgcolor: colors.alpha.success[500],
                    },
                  }}
                />
              </Grid>
            </Stack>
            <Stack>
              <Typography variant="body2">
                {intl.formatMessage({ id: "PASSWORD.LENGTH" })}
              </Typography>
            </Stack>
          </Stack>

          <Stack>
            <Typography variant="body1">
              {intl.formatMessage({ id: "PASSWORD.CONFIRMATION" })}
            </Typography>
            <TextField
              sx={{ my: 1 }}
              fullWidth
              type="password"
              placeholder="Password confirmation"
              autoComplete="off"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Check />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              {...formik.getFieldProps("changepassword")}
              // className={clsx(
              //   "form-control bg-transparent",
              //   {
              //     "is-invalid":
              //       formik.touched.changepassword &&
              //       formik.errors.changepassword,
              //   },
              //   {
              //     "is-valid":
              //       formik.touched.changepassword &&
              //       !formik.errors.changepassword,
              //   }
              // )}
            />
            {formik.touched.changepassword && formik.errors.changepassword && (
              <Stack>
                <Box
                  component="span"
                  role="alert"
                  color={colors.alpha.danger[500]}
                >
                  {formik.errors.changepassword}
                </Box>
              </Stack>
            )}
          </Stack>

          <Stack>
            <Typography>
              <Checkbox {...formik.getFieldProps("acceptTerms")} />
              <Box component="span">
                I Accept the <a target="_blank">Terms</a>.
              </Box>
            </Typography>
            {formik.touched.acceptTerms && formik.errors.acceptTerms && (
              <Box component="span" role="alert">
                {formik.errors.acceptTerms}
              </Box>
            )}
          </Stack>

          <Stack spacing={1}>
            <Link to="/auth/login">
              <CustomisedButton
                variant="contained"
                label="Submit"
                style={{ width: "100%" }}
                size="large"
                type="submit"
              />
            </Link>
            <CustomisedButton
              variant="outlined"
              label="Cancel"
              style={{ width: "100%" }}
              size="large"
              type="button"
            />
          </Stack>
        </Stack>
      </form>
    </Container>
  );
}
