import React from "react";
import {
  Typography,
  Grid,
  Stack,
  Box,
  FormLabel,
  RadioGroup,
  FormControlLabel,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CloudUploadOutlined } from "@mui/icons-material";
import { Formik, FormikProps } from "formik";
import dayjs, { Dayjs } from "dayjs";
import calendarItemSchema from "../../../../utils/Schema/calendarSchema";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import CustomisedButton from "../../../shared/components/C_Button";
import { CalendarItem } from "../models";
import { addEditCalendarItem } from "../calendarServices";
import { toast } from "react-toastify";

import { AppCheckbox, AppIconButton, AppRadio } from "../../../shared/components/ui";
type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  initialValues: CalendarItem;
  isEdit: boolean;
  handleRefresh: () => void;
};

const HolidayForm: React.FC<PropsTypes> = ({
  open,
  handleClose,
  initialValues,
  isEdit,
  handleRefresh,
}) => {
  const { formatMessage: i } = useIntl();

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    formik: FormikProps<CalendarItem>
  ) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      formik.setFieldTouched("image", true, true);
      formik.setFieldValue("image", selectedFile, true);
    }
  };

  const handleAddUpdateHoliday = async (
    values: CalendarItem,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      const formData = new FormData();
      if (isEdit) {
        formData.append("id", values.id!);
      }
      formData.append("name", values.name);
      formData.append("type", values.type.toString());
      formData.append("date", dayjs(values.date).startOf("day").format("YYYY-MM-DD"));
      if (values.image) {
        formData.append("image", values.image);
      }
      formData.append("description", values.description);
      formData.append("recurring", String(values.recurring));

      const { data } = await addEditCalendarItem(formData);
      if (data.success) {
        toast.success(
          i({
            id: isEdit
              ? "TOAST.SUCCESS.UPDATE"
              : "TOAST.SUCCESS.HOLIDAY_CREATE",
          })
        );
        handleRefresh();
        handleClose();
      } else {
        toast.error(
          i({
            id: isEdit ? "TOAST.FAILED.UPDATE" : "TOAST.FAILED.HOLIDAY_CREATE",
          })
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomisedModal
      open={open}
      handleClose={handleClose}
      title={
        isEdit
          ? i({ id: "OCCASION.EDIT_OCCASION" })
          : i({ id: "OCCASION.ADD_OCCASION" })
      }
    >
      <Formik
        initialValues={initialValues}
        validationSchema={calendarItemSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddUpdateHoliday(values, setSubmitting);
        }}
      >
        {(formik) => {
          return (
            <form onSubmit={formik.handleSubmit}>
              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <TextInput
                    required={true}
                    label={i({ id: "OCCASION.NAME" })}
                    type="text"
                    name="name"
                    placeholder={i({ id: "OCCASION.NAME" })}
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        height: 40,
                      },
                    }}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                >
                  <CustomisedDatePicker
                    required={true}
                    label={i({ id: "OCCASION.DATE" })}
                    value={
                      formik.values.date ? dayjs(formik.values.date) : null
                    }
                    setValue={(newDate: Dayjs | null) => {
                      formik.setFieldTouched("date", true, true);
                      formik.setFieldValue("date", newDate, true);
                    }}
                    name="date"
                    error={Boolean(formik.touched.date && formik.errors.date)}
                    helperText={
                      formik.touched.date && formik.errors.date
                        ? i({
                            id: formik.errors.date,
                            defaultMessage: formik.errors.date,
                          })
                        : undefined
                    }
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 40,
                      gap: 1.5,
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: "text.primary",
                        fontSize: "13.5px",
                        whiteSpace: "nowrap",
                        m: 0,
                      }}
                    >
                      {i({ id: "OCCASION.TYPE" })}:
                    </Typography>
                    <RadioGroup
                      row
                      aria-labelledby="occasion-type-radio-group-label"
                      {...formik.getFieldProps("type")}
                      sx={{ gap: 0.5 }}
                    >
                      <FormControlLabel
                        value="1"
                        control={<AppRadio size="small" />}
                        label={i({ id: "OCCASION.TYPES.HOLIDAY" })}
                        sx={{
                          mr: 1,
                          "& .MuiFormControlLabel-label": {
                            fontSize: "13.5px",
                            fontWeight: 500,
                          },
                        }}
                      />
                      <FormControlLabel
                        value="2"
                        control={<AppRadio size="small" />}
                        label={i({ id: "OCCASION.TYPES.EVENT" })}
                        sx={{
                          mr: 0,
                          "& .MuiFormControlLabel-label": {
                            fontSize: "13.5px",
                            fontWeight: 500,
                          },
                        }}
                      />
                    </RadioGroup>
                  </Box>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6,
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      minHeight: 40,
                      width: "100%",
                    }}
                  >
                    <FormControlLabel
                      sx={{
                        ml: 0,
                        "& .MuiFormControlLabel-label": {
                          fontSize: "13.5px",
                          fontWeight: 500,
                        },
                      }}
                      control={
                        <AppCheckbox
                          size="small"
                          checked={Boolean(formik.values.recurring)}
                          name="recurring"
                          onChange={(_e, checked) => {
                            formik.setFieldValue("recurring", checked);
                          }}
                          sx={{ p: 0.5, mr: 0.5 }}
                        />
                      }
                      label={i({ id: "OCCASION.RECURRING" })}
                    />
                  </Box>
                </Grid>

                <Grid size={12}>
                  <TextInput
                    required={true}
                    label={i({
                      id: "OCCASION.DESCRIPTION",
                    })}
                    placeholder={i({
                      id: "OCCASION.DESCRIPTION",
                    })}
                    name="description"
                    multiline={true}
                    rows={3}
                    type="text"
                    size="small"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        alignItems: "flex-start",
                      },
                    }}
                  />
                </Grid>

                <Grid size={12}>
                  <FormLabel
                    sx={{
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "text.primary",
                      mb: 1,
                      display: "block",
                    }}
                  >
                    {i({ id: "OCCASION.OCCASION_IMAGE" })}
                  </FormLabel>
                  <Box
                    component="div"
                    sx={{
                      border: "1px dashed",
                      borderColor:
                        formik.touched.image && Boolean(formik.errors.image)
                          ? "error.main"
                          : "divider",
                      borderRadius: "10px",
                      bgcolor: (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(255, 255, 255, 0.02)"
                          : "rgba(248, 250, 252, 0.7)",
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      textAlign: "center",
                      transition:
                        "border-color 0.2s ease, background-color 0.2s ease",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: (theme) =>
                          theme.palette.mode === "dark"
                            ? "rgba(255, 255, 255, 0.04)"
                            : "rgba(241, 245, 249, 0.8)",
                      },
                    }}
                  >
                    <AppIconButton
                      component="label"
                      role="button"
                      aria-label="select cover image"
                      sx={{
                        border: 0,
                        color:
                          formik.touched.image && Boolean(formik.errors.image)
                            ? "error.main"
                            : "primary.main",
                        mb: 0.5,
                      }}
                    >
                      <CloudUploadOutlined sx={{ fontSize: 36 }} />
                      <input
                        name="image"
                        type="file"
                        accept=".jpg,.png,.jpeg,.webp"
                        onChange={(e) => handleFileChange(e, formik)}
                        hidden
                      />
                    </AppIconButton>
                    <Stack spacing={0.5} alignItems="center">
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formik.values.image?.name
                          ? formik.values.image.name
                          : isEdit && formik.values.imageUrl
                          ? formik.values.imageUrl.split("/").pop()
                          : i(
                              { id: "COMPANY_DETAILS.SELECTED_LOGO" },
                              { image: "" }
                            )}
                      </Typography>
                      {formik.touched.image && formik.errors.image ? (
                        <Typography
                          variant="caption"
                          sx={{ color: "error.main", fontWeight: 500 }}
                        >
                          {i({
                            id: String(formik.errors.image),
                            defaultMessage: String(formik.errors.image),
                          })}
                        </Typography>
                      ) : (
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary" }}
                        >
                          {i({ id: "VALIDATION_ERR.PICTURE_FORMAT" })}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                </Grid>
              </Grid>

              <Stack
                direction="row"
                justifyContent="flex-end"
                spacing={1.5}
                sx={{ mt: 3 }}
              >
                <CustomisedButton
                  variant="outlined"
                  label={i({ id: "BUTTON.CANCEL" })}
                  handleClick={handleClose}
                />
                <CustomisedButton
                  type="submit"
                  disabled={!formik.isValid || formik.isSubmitting}
                  variant="contained"
                  label={i({ id: isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD" })}
                />
              </Stack>
            </form>
          );
        }}
      </Formik>
    </CustomisedModal>
  );
};

export default HolidayForm;
