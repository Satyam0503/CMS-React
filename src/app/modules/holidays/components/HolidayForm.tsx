import React from "react";
import {
  Typography,
  Grid,
  FormHelperText,
  Stack,
  Box,
  IconButton,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
} from "@mui/material";
import { useIntl } from "react-intl";
import { CloudUploadOutlined } from "@mui/icons-material";
import { Formik, FormikProps } from "formik";
import dayjs, { Dayjs } from "dayjs";
import holidaySchema from "../../../../utils/Schema/calendarSchema";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { CalendarItem } from "../models";
import { addEditCalendarItem } from "../calendarServices";
import { toast } from "react-toastify";

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
  // console.log(formik.values.recurring);

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
      formData.append("date", dayjs(values.date).startOf("day").toISOString());
      formData.append("image", values.image!);
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
        validationSchema={holidaySchema}
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
                    md: 6,
                  }}
                  className="pt-2"
                >
                  <TextInput
                    required={true}
                    label={i({ id: "OCCASION.NAME" })}
                    type="text"
                    name="name"
                    placeholder={i({ id: "OCCASION.NAME" })}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <CustomisedDatePicker
                    label={i({ id: "OCCASION.DATE" })}
                    value={
                      formik.values.date ? dayjs(formik.values.date) : null
                    }
                    setValue={(newDate: Dayjs | null) => {
                      formik.setFieldTouched("date", true);
                      formik.setFieldValue("date", newDate);
                    }}
                    name="date"
                  />
                  <FormHelperText>
                    {formik.touched.date &&
                      formik.errors.date &&
                      formik.errors.date}
                  </FormHelperText>
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                  className="d-flex align-items-center gap-2"
                >
                  <Typography>{i({ id: "OCCASION.TYPE" })} :</Typography>
                  <RadioGroup
                    row
                    aria-labelledby="demo-radio-buttons-group-label"
                    // defaultValue="1"
                    {...formik.getFieldProps("type")}
                  >
                    <FormControlLabel
                      value="1"
                      control={<Radio />}
                      label={i({ id: "OCCASION.TYPES.HOLIDAY" })}
                    />
                    <FormControlLabel
                      value="2"
                      control={<Radio />}
                      label={i({ id: "OCCASION.TYPES.EVENT" })}
                    />
                  </RadioGroup>
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    md: 6,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        defaultChecked
                        value={formik.values.recurring}
                        onChange={(e, checked) => {
                          formik.setFieldValue("recurring", checked);
                        }}
                      />
                    }
                    label={i({ id: "OCCASION.RECURRING" })}
                  // name="recurring"
                  />
                </Grid>

                <Grid size={12}>
                  <TextInput
                    label={i({
                      id: "OCCASION.DESCRIPTION",
                    })}
                    placeholder={i({
                      id: "OCCASION.DESCRIPTION",
                    })}
                    name="description"
                    multiline={true}
                    type="text"
                  />
                </Grid>
              </Grid>

              <Stack className="mt-4">
                <FormLabel>{i({ id: "OCCASION.OCCASION_IMAGE" })}</FormLabel>
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
                        formik.touched.imageUrl &&
                          Boolean(formik.errors.imageUrl)
                          ? "error.main"
                          : "primary.main",
                    }}
                  >
                    <CloudUploadOutlined className="fs-36" />
                    <input
                      name="image"
                      type="file"
                      accept=".jpg,.png,.webp"
                      onChange={(e) => handleFileChange(e, formik)}
                      hidden
                    />
                  </IconButton>
                  <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {" "}
                      {i(
                        { id: "COMPANY_DETAILS.SELECTED_LOGO" },
                        { image: formik.values.image?.name ?? "" }
                      )}
                    </Typography>
                    {formik.touched.imageUrl && formik.errors.imageUrl ? (
                      <Typography variant="body2" sx={{ color: "error.main" }}>
                        {i({ id: formik.errors.imageUrl })}
                      </Typography>
                    ) : (
                      <Typography variant="body2">
                        {i({ id: "VALIDATION_ERR.PICTURE_FORMAT" })}
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Stack>

              <Stack className="flex-row justify-content-end gap-2 mt-4">
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
