import React from "react";
import { PolicyVersionModel } from "../models";
import { Formik, FormikProps } from "formik";
import { policyVersionSchema } from "../../../../utils/Schema/policySchema";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { useIntl } from "react-intl";
import { Grid, Stack } from "@mui/system";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { CloudUpload } from "@mui/icons-material";
import {
  FormControlLabel,
  FormLabel,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { getCustomStatusCodesErrorMessage } from "../../../../utils/common";
import {
  createPolicyVersion,
  editPolicyVersion,
} from "../policyServices";
import { VisuallyHiddenInput } from "../../../shared/components/form-component/VisuallyHiddenInput";
import { ErrorLabel } from "../../../shared/components/form-component/ErrorLabel";

type Props = {
  open: boolean;
  handleClose: () => void;
  initialValues: PolicyVersionModel;
  isEdit: boolean;
  handleRefresh: () => void;
};

export default function PolilcyVersionForm(props: Props) {
  const { formatMessage: i } = useIntl();
  const param = useParams();
  const policyid = param.policyId;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikProps<PolicyVersionModel>["setFieldValue"],
    setFieldTouched: FormikProps<PolicyVersionModel>["setFieldTouched"]
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFieldTouched("policyDoc", true, true);
      setFieldValue("policyDoc", selectedFile, true);
    }
  };

  const handleSubmit = async (values: PolicyVersionModel, setSubmitting: (isSubmitting: boolean) => void) => {
    const formData = new FormData();
    formData.append("policyId", policyid!);
    formData.append("VersionName", values.versionName);
    formData.append("IsCurrent", String(values.isCurrent));
    if (values.policyDoc) {
      formData.append("PolicyDoc", values.policyDoc);
    }
    if (props.isEdit) formData.append("id", values.id!);
    try {
      if (!props.isEdit) {
        const { data } = await createPolicyVersion(formData);
        if (data.success) {
          toast.success(i({ id: "TOAST.SUCCESS.CREATED" }));
          props.handleClose();
          props.handleRefresh();
        } else {
          toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode) }));
        }
      } else {
        const { data } = await editPolicyVersion(formData);
        if (data.success) {
          toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
          props.handleClose();
          props.handleRefresh();
        } else {
          toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode) }));
        }
      }
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomisedModal
      open={props.open}
      handleClose={props.handleClose}
      title={i({ id: "POLICIES.VERSION.ADD_VERSION" })}
    >
      <Formik
        initialValues={props.initialValues}
        validationSchema={policyVersionSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleSubmit(values, setSubmitting);
        }}
      >
        {({ values, setFieldValue, setFieldTouched, ...formik }) => {
          return (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={1}>
                <Grid size={12}>
                  <TextInput
                    required={true}
                    label={i({ id: "POLICIES.VERSION.VERSION_NAME" })}
                    type="text"
                    name="versionName"
                    placeholder={i({ id: "POLICIES.VERSION.VERSION_NAME" })}
                  />
                </Grid>
                <Grid size={12}>
                  <FormLabel sx={{ fontSize: 12, color: "text.secondary" }}>
                    {i({ id: "POLICIES.POLICY_DOCUMENT" })}
                  </FormLabel>
                  <Stack className="p-6  align-items-center gap-1 rounded" sx={{ border: "1px dashed grey" }} >
                    <IconButton
                      component="label"
                      tabIndex={-1}
                      sx={{ border: 0, p: 0 }}
                    >
                      <CloudUpload sx={{ fontSize: 52 }} />
                      <VisuallyHiddenInput
                        name="policyDoc"
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          setFieldTouched("policyDoc", true);
                          handleFileChange(e, setFieldValue, setFieldTouched);
                        }}
                      />
                    </IconButton>

                    <Typography variant="caption">
                      {i({ id: "POLICIES.SELECTED_DOCUMENT" }, { document: values.policyDoc?.name ?? "" })}
                    </Typography>
                    <Typography variant="body2" className="text-center ">
                      {i({ id: "VALIDATION_ERR.DOCUMENT_FORMAT", })}
                    </Typography>
                  </Stack>
                  {formik.touched.policyDoc && formik.errors.policyDoc && (
                    <ErrorLabel errorLabel={formik.errors.policyDoc} />
                  )}
                </Grid>
                <Grid size={12}>
                  <FormControlLabel
                    labelPlacement="start"
                    control={
                      <Switch
                        onChange={(e, checked) => {
                          setFieldValue("isCurrent", checked);
                        }}
                        name="isCurrent"
                        checked={Boolean(values.isCurrent)}
                      />
                    }
                    label={i({ id: "ACTIVE" })}
                    sx={{
                      margin: "0",
                      gap: "10px",
                    }}
                  />
                </Grid>
              </Grid>
              <Stack className="flex-row justify-content-end gap-2 mt-4">
                <CustomisedButton
                  variant="outlined"
                  label={i({ id: "BUTTON.CANCEL" })}
                  handleClick={props.handleClose}
                />
                <CustomisedButton
                  type="submit"
                  disabled={!formik.isValid || formik.isSubmitting}
                  variant="contained"
                  label={i({ id: props.isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD" })}
                />
              </Stack>
            </form>
          );
        }}
      </Formik>
    </CustomisedModal>
  );
}
