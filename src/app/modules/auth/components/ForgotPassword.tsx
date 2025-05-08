import { useState } from "react";
import * as Yup from "yup";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Box, Grid, Stack, TextField, Typography } from "@mui/material";
import { colors } from "../../theme/MuiTheme";
import { useIntl } from "react-intl";

const initialValues = {
  email: "",
};

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .matches(
      /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be a valid email"
    )
    .required("Email is required"),
});

export function ForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [hasErrors, setHasErrors] = useState<boolean | undefined>(undefined);
  const intl = useIntl();
  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      setHasErrors(undefined);

    },
  });

  return (
    <form
      // className="form w-100 fv-plugins-bootstrap5 fv-plugins-framework"
      noValidate
      id="kt_login_password_reset_form"
      onSubmit={formik.handleSubmit}
    >
      <Stack className="text-center mb-10">
        <Typography variant="h3">Forgot Password ?</Typography>
        <Typography variant="body1" color={colors.primary[500]}>
          Enter your email to reset your password.
        </Typography>
      </Stack>

      {hasErrors === true && (
        <Stack color={'error.main'}>
          Sorry, looks like there are some errors detected, please try again.
        </Stack>
      )}

      {hasErrors === false && (
        <Stack color={'success.main'}>
          Sent password reset. Please check your email
        </Stack>
      )}

      <Grid item mb={2}>
        <Typography variant="body1">Email</Typography>

        <TextField
          type="email"
          placeholder=""
          autoComplete="off"
          {...formik.getFieldProps("email")}
          className={clsx(
            "form-control bg-transparent",
            { "is-invalid": formik.touched.email && formik.errors.email },
            {
              "is-valid": formik.touched.email && !formik.errors.email,
            }
          )}
        />
        {formik.touched.email && formik.errors.email && (
          <Box component={"span"} role="alert">
            {formik.errors.email}
          </Box>
        )}
      </Grid>

      <Grid item display={"flex"} justifyContent={"center"} gap={1}>
        <Link to="/auth/login">
          <CustomisedButton
            variant="contained"
            type="button"
            label={intl.formatMessage({ id: "BUTTON.SUBMIT" })}
            disabled={formik.isSubmitting || !formik.isValid}
          />
          {loading && (
            <Box component={"span"} role="alert">
              Please wait...
            </Box>
          )}
        </Link>

        <Link to="/auth/login">
          <CustomisedButton
            variant="outlined"
            type="button"
            label={intl.formatMessage({ id: "BUTTON.CANCEL" })}
            disabled={formik.isSubmitting || !formik.isValid}
          />
        </Link>
      </Grid>
    </form>
  );
}
