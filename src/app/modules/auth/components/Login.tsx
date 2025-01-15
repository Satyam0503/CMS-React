import { useState } from "react";
import * as Yup from "yup";
import clsx from "clsx";
import { Link } from "react-router-dom";
import { useFormik } from "formik";
import { getUserByToken, login } from "../core/_requests";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { useAuth } from "../core/Auth";
import { log } from "node:console";
import { Box, Grid, Stack, Typography } from "@mui/material";
import { colors } from "../../theme/MuiTheme";
import { useIntl } from "react-intl";

const loginSchema = Yup.object().shape({
  email: Yup.string()
    .email("Wrong email format")
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Email is required"),
  password: Yup.string()
    .min(3, "Minimum 3 symbols")
    .max(50, "Maximum 50 symbols")
    .required("Password is required"),
});

const initialValues = {
  email: "admin@email.com",
  password: "Admin123",
};

/*
  Formik+YUP+Typescript:
  https://jaredpalmer.com/formik/docs/tutorial#getfieldprops
  https://medium.com/@maurice.de.beijer/yup-validation-and-typescript-and-formik-6c342578a20e
*/

export function Login() {
  const [loading, setLoading] = useState(false);
  const { saveAuth, setCurrentUser } = useAuth();
  const intl = useIntl();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        const { data: auth } = await login(values.email, values.password);
        saveAuth(auth);
        const { data: user } = await getUserByToken(auth.token);
        setCurrentUser(user);
      } catch (error) {
        console.error(error);
        saveAuth(undefined);
        setStatus("The login details are incorrect");
        setSubmitting(false);
        setLoading(false);
      }
    },
  });
  return (
    <form
      className="form w-100"
      onSubmit={formik.handleSubmit}
      noValidate
      id="kt_login_signin_form"
    >
      {/* begin::Heading */}
      <Grid container alignItems={"center"}>
        <h1 className="text-gray-900 fw-bolder mb-3">Sign In</h1>
        <Typography variant="body1" color={colors.alpha.primary[500]}>
          {intl.formatMessage({ id: "AUTH.REGISTER.CMS" })}
        </Typography>
      </Grid>
      {/* begin::Heading */}

      {/* begin::Separator */}
      <Stack>
        <Typography variant="body1">with email</Typography>
      </Stack>
      {/* end::Separator */}

      {formik.status ? (
        <Grid className="mb-lg-15 alert alert-danger">
          <Grid className="alert-text font-weight-bold">{formik.status}</Grid>
        </Grid>
      ) : (
        <Grid className="mb-10 bg-light-info p-8 rounded">
          <Grid className="text-info">
            Use account <strong>admin@demo.com</strong> and password{" "}
            <strong>demo</strong> to continue.
          </Grid>
        </Grid>
      )}

      {/* begin::Form group */}
      <Grid className="fv-row mb-8">
        <label className="form-label fs-6 fw-bolder text-gray-900">Email</label>
        <input
          placeholder="Email"
          {...formik.getFieldProps("email")}
          className={clsx(
            "form-control bg-transparent",
            { "is-invalid": formik.touched.email && formik.errors.email },
            {
              "is-valid": formik.touched.email && !formik.errors.email,
            }
          )}
          type="email"
          name="email"
          autoComplete="off"
        />
        {formik.touched.email && formik.errors.email && (
          <Grid className="fv-plugins-message-container">
            <span role="alert">{formik.errors.email}</span>
          </Grid>
        )}
      </Grid>
      {/* end::Form group */}

      {/* begin::Form group */}
      <Grid className="fv-row mb-3">
        <label className="form-label fw-bolder text-gray-900 fs-6 mb-0">
          Password
        </label>
        <input
          type="password"
          autoComplete="off"
          {...formik.getFieldProps("password")}
          className={clsx(
            "form-control bg-transparent",
            {
              "is-invalid": formik.touched.password && formik.errors.password,
            },
            {
              "is-valid": formik.touched.password && !formik.errors.password,
            }
          )}
        />
        {formik.touched.password && formik.errors.password && (
          <Grid className="fv-plugins-message-container">
            <Grid className="fv-help-block">
              <span role="alert">{formik.errors.password}</span>
            </Grid>
          </Grid>
        )}
      </Grid>
      {/* end::Form group */}

      {/* begin::Wrapper */}
      <Grid className="d-flex flex-stack flex-wrap gap-3 fs-base fw-semibold mb-8">
        <Grid />

        {/* begin::Link */}
        <Link to="/auth/forgot-password" className="link-primary">
          Forgot Password ?
        </Link>
        {/* end::Link */}
      </Grid>
      {/* end::Wrapper */}

      {/* begin::Action */}
      <Grid className="d-grid mb-10">
        <button
          type="submit"
          id="kt_sign_in_submit"
          className="btn btn-primary"
          disabled={formik.isSubmitting || !formik.isValid}
        >
          {!loading && <span className="indicator-label">Continue</span>}
          {loading && (
            <span className="indicator-progress" style={{ display: "block" }}>
              Please wait...
              <span className="spinner-border spinner-border-sm align-middle ms-2"></span>
            </span>
          )}
        </button>
      </Grid>
      {/* end::Action */}

      <Grid className="text-gray-500 text-center fw-semibold fs-6">
        Not a Member yet?{" "}
        <Link to="/auth/registration" className="link-primary">
          Sign up
        </Link>
      </Grid>
    </form>
  );
}
