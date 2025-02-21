import { useState } from "react";

import { Box, Checkbox, Stack, TextField, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../components/CustomisedButton";
import * as Yup from "yup";
import { colors } from "../../theme/MuiTheme";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { Formik } from "formik";
import { TextInput } from "../../components/form_component/TextInput";
import { useNavigate, useSearchParams } from "react-router-dom";

const validationSchema = Yup.object().shape({
  email: Yup.string()
    .matches(
      /^[a-zA-Z]+[a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      "Email must be a valid email"
    )
    .required("Email is required"),
  newPassword: Yup.string()
    .matches(
      /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/,
      "Use 8 or more characters with a mix of letters, numbers & symbols"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .required("Password confirmation is required")
    .oneOf(
      [Yup.ref("newPassword")],
      "Password and Confirm Password didn't match"
    ),
});

const initialValues = {
  email: "",
  newPassword: "",
  confirmPassword: "",
};

export function CreatePassword() {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [queryParam] = useSearchParams();
  
  function handlePasswordChange(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    etStatus: (status?: any) => void
  ) {
    setLoading(true);
  }
  return (
    <Stack spacing={{ xs: 4 }}>
      <Stack
        direction={"row"}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Stack spacing={1}>
          <Typography variant="h1" color={colors.alpha.primary[500]}>
            {intl.formatMessage({ id: "PASSWORD.CREATE" })}
          </Typography>
          <Typography variant="h3">
            {intl.formatMessage({ id: "PASSWORD.CREATE_LOGIN" })}
          </Typography>
        </Stack>
        <Stack display={{ xs: "none", md: "block" }}>
          <img
            src={toAbsoluteUrl("media/auth/authentication.svg")}
            style={{ maxWidth: "250px" }}
          />
        </Stack>
      </Stack>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values, { setSubmitting, setStatus }) => {
          handlePasswordChange(values, setSubmitting, setStatus);
        }}
      >
        {(formik) => (
          <form onSubmit={formik.handleSubmit}>
            <Stack spacing={2}>
              <TextInput
                label={intl.formatMessage({ id: "AUTH.INPUT.EMAIL" })}
                name="email"
                placeholder="Email"
                type="email"
                disabled={true}
              />
              <TextInput
                type="password"
                name="newPassword"
                label={intl.formatMessage({ id: "PASSWORD.CREATE_NEW" })}
                placeholder="New Password"
              />
              <TextInput
                type="password"
                name="confirmPassword"
                label={intl.formatMessage({ id: "PASSWORD.CONFIRMATION" })}
                placeholder="Confirm Password"
              />

              <CustomisedButton
                type="submit"
                label="Create Password"
                size="large"
                loading={loading}
              />
            </Stack>
          </form>
        )}
      </Formik>
    </Stack>
  );
}
