import { useEffect, useState } from "react";

import { Alert, Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import * as Yup from "yup";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { Formik } from "formik";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPassword } from "../core/_requests";
import { toast } from "react-toastify";
import { Regex } from "../../../../utils/constant/Constant";
import { getStatusCodeString } from "../../../../utils/common";
import { PasswordStrenghtMeter } from "../../../shared/components/form-component/PasswordStrengthMeter";

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .matches(
      Regex.Password,
      "VALIDATION_ERR.INVALID_PASSWORD"
    )
    .required("VALIDATION_ERR.PASSWORD_REQ"),
  confirmPassword: Yup.string()
    .required("VALIDATION_ERR.PASSWORD_REQ")
    .oneOf(
      [Yup.ref("newPassword")],
      "VALIDATION_ERR.PASSWORD_NOT_MATCHED"
    ),
});

const initialValues = {
  newPassword: "",
  confirmPassword: "",
};

export function CreatePassword() {
  const { formatMessage: i } = useIntl();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [queryParam] = useSearchParams();

  const token = queryParam.get("token") || "";

  async function handlePasswordChange(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) {
    const payload = {
      newPassword: values.newPassword,
      token,
    };
    setLoading(true);
    try {
      const response = await createPassword(payload);
      const { success, statusCode } = response.data;
      if (success) {
        toast.success(i({ id: getStatusCodeString(statusCode) }));
        setStatus("");
        navigate("/auth/login");
      } else {
        setStatus(i({ id: getStatusCodeString(statusCode) }));
      }
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!(queryParam.size && queryParam.has("token"))) {
      navigate("/error/404", { replace: true });
    }
  }, []);

  return (
    <Stack spacing={{ xs: 4 }}>
      <Stack className="flex-row justify-content-between" >
        <Stack spacing={1}>
          <Typography variant="h1" sx={{ color: 'primary.main' }}>
            {i({ id: "AUTH.CREATE" })}
          </Typography>
          <Typography variant="h3">
            {i({ id: "AUTH.CREATE_NEW_PASSWORD" })}
          </Typography>
        </Stack>
        <Stack sx={{
          display: { xs: "none", md: "block" }
        }}>
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
            {formik.status && (
              <Alert variant="standard" severity="error" className="mb-8">
                {formik.status}
              </Alert>
            )}
            <Stack spacing={2}>
              <Stack spacing={1}>
                <TextInput
                  type="password"
                  name="newPassword"
                  label={i({ id: "FORM.NEW_PASSWORD" })}
                  placeholder={i({ id: "FORM.NEW_PASSWORD" })}
                />
                <PasswordStrenghtMeter password={formik.values.newPassword} />
              </Stack>
              <TextInput
                type="password"
                name="confirmPassword"
                label={i({ id: "FORM.CONFIRM_PASSWORD" })}
                placeholder={i({ id: "FORM.CONFIRM_PASSWORD" })}
              />
            </Stack>
            <Stack className="gap-2 mt-8">
              <CustomisedButton
                type="submit"
                label={i({ id: "BUTTON.CREATE_PASS" })}
                size="large"
                loading={loading}
                disabled={
                  formik.isSubmitting || !(formik.isValid && formik.dirty)
                }
              />
              <CustomisedButton
                variant="outlined"
                label={i({ id: "BUTTON.CANCEL" })}
                size="large"
                handleClick={() => navigate("/auth")}
              />
            </Stack>
          </form>
        )}
      </Formik>
    </Stack>
  );
}
