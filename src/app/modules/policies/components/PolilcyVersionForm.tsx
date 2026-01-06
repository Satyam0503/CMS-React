import React from "react";
import { PolicyResponseStructure, PolicyVersionStructure } from "../models";
import { Formik, FormikProps } from "formik";
import { policyVersionSchema } from "../../../../utils/Schema/policySchema";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { useIntl } from "react-intl";
import { Box, Grid, Stack } from "@mui/system";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { CloudUploadOutlined } from "@mui/icons-material";
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
  updatePolicy,
} from "../policyServices";

type Props = {
  open: boolean;
  handleClose: () => void;
  initialValues: PolicyVersionStructure;
  isEdit: boolean;
  handleRefresh: () => void;
};

export default function PolilcyVersionForm(props: Props) {
  const { formatMessage: i } = useIntl();
  const param = useParams();
  const policyid = param.policyId;

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: FormikProps<PolicyVersionStructure>["setFieldValue"],
    setFieldTouched: FormikProps<PolicyVersionStructure>["setFieldTouched"]
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      setFieldTouched("policyDoc", true, true);
      setFieldValue("policyDoc", selectedFile, true);
    }
  };

  const handleSubmit = async (
    values: PolicyVersionStructure,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    // const payload = { ...values, policyId: policyid };

    const formData = new FormData();
    formData.append("policyId", policyid!);
    formData.append("VersionName", values.versionName);
    formData.append("IsCurrent", String(values.isCurrent));
    if (values.policyDoc) {
      formData.append("PolicyDoc", values.policyDoc);
    }
    if (props.isEdit) formData.append("id", values.id!);

    // console.log(formData.values);
    // console.log(payload);

    try {
      if (!props.isEdit) {
        const { data } = await createPolicyVersion(formData);
        console.log(data);

        if (data.success) {
          toast.success(i({ id: "TOAST.SUCCESS.CREATED" }));
          props.handleClose();
          props.handleRefresh();
        } else {
          toast.error(
            i({ id: getCustomStatusCodesErrorMessage(data.statusCode) })
          );
        }
      } else {
        const { data } = await editPolicyVersion(formData);
        if (data.success) {
          toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
          props.handleClose();
          props.handleRefresh();
        } else {
          toast.error(
            i({ id: getCustomStatusCodesErrorMessage(data.statusCode) })
          );
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
          // setSubmitting(false);
          handleSubmit(values, setSubmitting);
        }}
      >
        {({ values, setFieldValue, setFieldTouched, ...formik }) => {
          // console.log(formik.errors);
          // console.log(values);

          return (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
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
                  <Stack className="mt-4">
                    <FormLabel>
                      {i({ id: "OCCASION.OCCASION_IMAGE" })}
                    </FormLabel>
                    <Box
                      component="div"
                      sx={{
                        border: 1,
                        borderRadius: 1,
                        borderColor: "text.disabled",
                      }}
                      className="d-flex flex-column align-items-center text-center p-4 "
                    >
                      <IconButton
                        component="label"
                        role="button"
                        aria-label="select logo"
                        sx={{
                          border: 0,
                          color:
                            formik.touched.policyDoc &&
                            Boolean(formik.errors.policyDoc)
                              ? "error.main"
                              : "primary.main",
                        }}
                      >
                        <CloudUploadOutlined className="fs-36" />
                        <input
                          name="policyDoc"
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) =>
                            handleFileChange(e, setFieldValue, setFieldTouched)
                          }
                          hidden
                        />
                      </IconButton>
                      <Stack>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {" "}
                          {i(
                            { id: "POLICIES.SELECTED_DOCUMENT" },
                            { document: values.policyDoc?.name ?? "" }
                          )}
                        </Typography>
                        {formik.touched.policyDoc && formik.errors.policyDoc ? (
                          <Typography
                            variant="body2"
                            sx={{ color: "error.main" }}
                          >
                            {i({ id: formik.errors.policyDoc })}
                          </Typography>
                        ) : (
                          <Typography variant="body2">
                            {i({ id: "VALIDATION_ERR.DOCUMENT_FORMAT" })}
                          </Typography>
                        )}
                      </Stack>
                    </Box>
                  </Stack>
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
                  label={i({
                    id: props.isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD",
                  })}
                />
              </Stack>
            </form>
          );
        }}
      </Formik>
    </CustomisedModal>
  );
}
