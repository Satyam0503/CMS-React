import { useState } from "react";
import * as Yup from "yup";
import clsx from "clsx";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { Box, Grid, Stack, TextField, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { Regex } from "../../../../utils/constant/Constant";
import { resetPassword } from "../core/_requests";
import { toast } from "react-toastify";

const initialValues = {
  email: "",
};

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .matches(Regex.Email, "Email must be a valid email")
    .required("Email is required"),
});

export function ForgotPassword() {
  const navigate = useNavigate();
  const { formatMessage } = useIntl();
  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const response = await resetPassword(values.email);
        if (response.data.success) {
          toast.success(response.data.message);
          formik.resetForm();
        }
        else {
          toast.error("Request Failed");
        }
      } catch (error) {
        console.log(error);
      }
      finally {
        setSubmitting(false);
      }
    },
  });

  return (
    <form
      id="login_password_reset_form"
      onSubmit={formik.handleSubmit}
    >
      <Stack className="text-center mb-10">
        <Typography variant="h1">{formatMessage({ id: "AUTH.INPUT.FORGOT_PASSWORD" })}</Typography>
        <Typography variant="body1">{formatMessage({ id: "AUTH.FORGOT_PASSWORD.NOTE" })}</Typography>
      </Stack>

      <Stack sx={{ mb: 2 }}>
        <TextField
          fullWidth
          type="email"
          helperText={formik.touched.email && formik.errors.email}
          label={formatMessage({ id: "FORM.EMAIL" })}
          error={formik.touched.email && Boolean(formik.errors.email)}
          placeholder={formatMessage({ id: "FORM.EMAIL" })}
          autoComplete="off"
          {...formik.getFieldProps("email")}
        />
      </Stack>
      <Stack direction={"row"} sx={{ justifyContent: "center", gap: 2 }}>
        <CustomisedButton
          variant="outlined"
          label={formatMessage({ id: "BUTTON.CANCEL" })}
          handleClick={() => navigate('/auth')}
        />
        <CustomisedButton
          type="submit"
          label={formatMessage({ id: "BUTTON.SUBMIT" })}
          loading={formik.isSubmitting}
          disabled={formik.isSubmitting || !formik.isValid}
        />
      </Stack>
    </form>
  );
}
