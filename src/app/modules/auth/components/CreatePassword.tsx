import { useEffect, useState } from "react";

import { Grid, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import * as Yup from "yup";
import { toAbsoluteUrl } from "../../../../_themes/helpers";
import { Formik } from "formik";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createPassword } from "../core/_requests";
import { AxiosError } from "axios";
import { toast } from "react-toastify";
import { Regex } from "../../../../utils/constant/Constant";

const validationSchema = Yup.object().shape({
  newPassword: Yup.string()
    .matches(
      Regex.Password,
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
  newPassword: "",
  confirmPassword: "",
};

export function CreatePassword() {
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [queryParam] = useSearchParams();

  const statusNumber = queryParam.get("statusNumber") || "";

  async function handlePasswordChange(
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
    setStatus: (status?: any) => void
  ) {
    const payload = {
      newPassword: values.newPassword,
      statusNumber,
    };
    try {
      const response = await createPassword(payload);
      const { success, message } = response.data;
      if (!success) {
        throw new AxiosError("Failed To Create New Password");
      }
      toast.success(message);
      setStatus("");
      navigate("/auth/login");
    } catch (error) {
      setStatus((error as AxiosError).message);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  }

  useEffect(() => {
    if (!(queryParam.size && queryParam.has("statusNumber"))) {
      navigate("/error/404", { replace: true });
    }
  }, []);

  return (
    <Stack spacing={{ xs: 4 }}>
      <Stack
        direction={"row"}
        display={"flex"}
        justifyContent={"space-between"}
      >
        <Stack spacing={1}>
          <Typography variant="h1" sx={{ color: 'primary.main' }}>
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
            {formik.status && (
              <Grid className="mb-lg-15 alert alert-danger">
                <Grid className="alert-text font-weight-bold">
                  {formik.status}
                </Grid>
              </Grid>
            )}
            <Stack spacing={2}>
              <TextInput
                type="password"
                name="newPassword"
                label={intl.formatMessage({ id: "FORM.NEW_PASSWORD" })}
                placeholder={intl.formatMessage({ id: "FORM.NEW_PASSWORD" })}
              />
              <TextInput
                type="password"
                name="confirmPassword"
                label={intl.formatMessage({ id: "FORM.CONFIRM_PASSWORD" })}
                placeholder={intl.formatMessage({ id: "FORM.CONFIRM_PASSWORD" })}
              />
            </Stack>
            <Stack sx={{ marginBlockStart: "3rem" }}>
              <CustomisedButton
                type="submit"
                label={intl.formatMessage({ id: "BUTTON.CREATE_PASS" })}
                size="large"
                loading={loading}
                disabled={
                  formik.isSubmitting || !(formik.isValid && formik.dirty)
                }
              />
            </Stack>
          </form>
        )}
      </Formik>
    </Stack>
  );
}
