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
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";
import { getStatusCodeString } from "../../../../utils/common";

const initialValues = {
  email: "",
};

const forgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .matches(Regex.Email, "VALIDATION_ERR.WRONG_EMAIL")
    .required("VALIDATION_ERR.EMAIL_REQ"),
});

export function ForgotPassword() {
  const navigate = useNavigate();
  const { formatMessage: i } = useIntl();
  const formik = useFormik({
    initialValues,
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const { data } = await resetPassword(values.email);
        if (data.success) {
          toast.success(i({ id: getStatusCodeString(data.statusCode) }));
          formik.resetForm();
        }
        else {
          toast.error(i({ id: getStatusCodeString(data.statusCode) }));
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
        <Typography variant="h1">{i({ id: "AUTH.FORGOT_PASSWORD" })}</Typography>
        <Typography variant="body1">{i({ id: "AUTH.FORGOT_PASSWORD.NOTE" })}</Typography>
      </Stack>

      <Stack sx={{ mb: 2 }}>
        <TextField
          fullWidth
          type="email"
          label={i({ id: "FORM.EMAIL" })}
          error={formik.touched.email && Boolean(formik.errors.email)}
          placeholder={i({ id: "FORM.EMAIL" })}
          autoComplete="off"
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
