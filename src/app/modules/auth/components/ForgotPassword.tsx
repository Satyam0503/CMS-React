import {
  useEffect,
  useRef } from "react";
import * as Yup from "yup";
import { useLocation,
  useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Stack,
  Typography,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Regex } from "../../../../utils/constant/Constant";
import { resetPassword } from "../core/_requests";
import { toast } from "react-toastify";
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";
import { getStatusCodeString } from "../../../../utils/common";
import { AxiosError } from "axios";
import { ApiResponse } from "../../../../utils/common_types";

import { AppTextField } from "../../../shared/components/ui";
const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL")
    .required("VALIDATION_ERR.EMAIL_REQ"),
});

export function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const autoSubmitStarted = useRef(false);
  const { formatMessage: i } = useIntl();
  const navigationState = location.state as { email?: string; autoSubmit?: boolean } | null;
  const emailFromLogin = navigationState?.email?.trim() ?? "";
  const formik = useFormik({
    initialValues: { email: emailFromLogin },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data } = await resetPassword(values.email);
        // Older API instances return the login-specific status code 2 when the
        // address is not found. A password-reset screen must not disclose account
        // existence or describe this as invalid credentials.
        if (data.success || data.statusCode === 2) {
          toast.success("If an active account exists for this email, a password reset link has been sent.");
          formik.resetForm();
        }
        else {
          toast.error(data.message || i({
            id: getStatusCodeString(data.statusCode),
            defaultMessage: "The reset email could not be sent. Please try again.",
          }));
        }
      } catch (error) {
        const response = (error as AxiosError<ApiResponse>).response?.data;
        toast.error(response?.message || "Unable to request a password reset. Please try again.");
      }
      finally {
        setSubmitting(false);
      }
    },
  });

  useEffect(() => {
    if (
      navigationState?.autoSubmit &&
      emailFromLogin &&
      forgotPasswordSchema.isValidSync({ email: emailFromLogin }) &&
      !autoSubmitStarted.current
    ) {
      autoSubmitStarted.current = true;
      void formik.submitForm();
    }
  }, [emailFromLogin, navigationState?.autoSubmit]);

  return (
    <form
      id="login_password_reset_form"
      onSubmit={formik.handleSubmit}
    >
      <Stack className="text-center mb-10">
        <Typography variant="h1">{i({ id: "AUTH.FORGOT_PASSWORD" })}</Typography>
        <Typography variant="body1">{i({ id: "AUTH.FORGOT_PASSWORD.NOTE" })}</Typography>
      </Stack>

      <Stack sx={{ mb: 2 }}>
        <AppTextField
          fullWidth
          type="email"
          label={i({ id: "FORM.EMAIL" })}
          error={formik.touched.email && Boolean(formik.errors.email)}
          placeholder={i({ id: "FORM.EMAIL" })}
          autoComplete="email"
          {...formik.getFieldProps("email")}
        />
        {formik.touched.email && formik.errors.email && <ErrorLabel errorLabel={formik.errors.email} />}
      </Stack>
      <Stack className="gap-2 mt-6" >
        <CustomisedButton
          type="submit"
          label={i({ id: "BUTTON.SUBMIT" })}
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting || !formik.isValid}
        />
        <CustomisedButton
          variant="outlined"
          label={i({ id: "BUTTON.CANCEL" })}
          handleClick={() => navigate('/auth')}
        />
      </Stack>
    </form>
  );
}
