import React from "react";
import {
  Typography,
  Grid,
  FormHelperText,
  MenuItem,
  Stack,
  Select,
  Box,
  IconButton,
  TextField,
  FormLabel,
} from "@mui/material";
import { useIntl } from "react-intl";
import { Check, CloudUploadOutlined } from "@mui/icons-material";
import { Formik, FormikProps } from "formik";
import dayjs, { Dayjs } from "dayjs";

import holidaySchema from "../../../../utils/Schema/holidaySchema";
import { HolidayTypes } from "../../../../utils/constant/Constant";
import { CustomisedModal } from "../../../shared/components/CustomisedModal";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import CustomisedButton from "../../../shared/components/CustomisedButton";
import { HolidayModel } from "../models";
import { SelectInput } from "../../../shared/components/form-component/SelectInput";
import { addEditHoliday } from "../holidayServices";
import { toast } from "react-toastify";

type PropsTypes = {
  open: boolean;
  handleClose: () => void;
  initialValues: HolidayModel;
  isEdit: boolean;
  handleRefresh: () => void;
};

const HolidayForm: React.FC<PropsTypes> = ({ open, handleClose, initialValues, isEdit, handleRefresh }) => {
  const { formatMessage: i } = useIntl();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, formik: FormikProps<HolidayModel>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const selectedFile = files[0];
      formik.setFieldTouched("holidayImage", true, true)
      formik.setFieldValue("holidayImage", selectedFile, true)
    }
  }


  const handleAddUpdateHoliday = async (values: HolidayModel, setSubmitting: (isSubmitting: boolean) => void) => {
    try {
      const formData = new FormData();
      if (isEdit) {
        formData.append("HolidayId", values.holidayId!);
      }
      formData.append("HolidayName", values.holidayName);
      formData.append("HolidayType", values.holidayType.toString());
      formData.append("Date", dayjs(values.date).toISOString());
      formData.append("HolidayImage", values.holidayImage!);
      formData.append("Detail", values.detail);

      const { data } = await addEditHoliday(formData);
      if (data.success) {
        toast.success(i({ id: isEdit ? "TOAST.SUCCESS.UPDATE" : "TOAST.SUCCESS.HOLIDAY_CREATE" }))
        handleRefresh();
        handleClose();
      }
      else {
        toast.error(i({ id: isEdit ? "TOAST.FAILED.UPDATE" : "TOAST.FAILED.HOLIDAY_CREATE" }))
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CustomisedModal open={open} handleClose={handleClose}
      title={isEdit ? i({ id: "HOLIDAY.EDIT_HOLIDAYS" }) : i({ id: "HOLIDAY.ADD_HOLIDAYS" })}
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
            <form onSubmit={formik.handleSubmit} >
              <Grid container spacing={2}>
                <Grid
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <TextInput
                    required={true}
                    label={i({ id: "HOLIDAY.NAME" })}
                    type="text"
                    name="holidayName"
                    placeholder="Holiday Name"
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    md: 6
                  }}>
                  <SelectInput
                    label={i({ id: "HOLIDAY.TYPE" })}
                    name="holidayType"
                  >
                    {HolidayTypes.map(({ id, label }) => {
                      return (
                        <MenuItem key={id} value={id}>
                          {i({ id: label })}
                        </MenuItem>
                      )
                    })}
                  </SelectInput>
                </Grid>

                <Grid size={12}>
                  <CustomisedDatePicker
                    label={i({ id: "HOLIDAY.DATE" })}
                    value={formik.values.date ? dayjs(formik.values.date) : null}
                    setValue={(newDate: Dayjs | null) => {
                      formik.setFieldTouched("date", true);
                      formik.setFieldValue("date", newDate);
                    }}
                    name="date"
                  />
                  <FormHelperText>
                    {formik.touched.date && formik.errors.date && formik.errors.date}
                  </FormHelperText>
                </Grid>

                <Grid size={12}>
                  <TextInput
                    label={i({
                      id: "HOLIDAY.DESCRIPTION",
                    })}
                    placeholder={i({
                      id: "HOLIDAY.DESCRIPTION",
                    })}
                    name="detail"
                    multiline={true}
                    type="text"
                  />
                </Grid>
              </Grid>

              <Stack className="mt-4">
                <FormLabel>
                  {i({ id: "HOLIDAY.HOLIDAY_IMAGE" })}
                </FormLabel>
                <Box component="div"
                  sx={{
                    border: 1,
                    borderRadius: 1,
                    borderColor: 'text.disabled'
                  }}
                  className="d-flex flex-column align-items-center text-center p-4 "
                >
                  <IconButton component="label" role="button" aria-label="select logo" sx={{ border: 0, color: formik.touched.holidayImage && Boolean(formik.errors.holidayImage) ? 'error.main' : 'primary.main' }}>
                    <CloudUploadOutlined className="fs-36" />
                    <input
                      name="companyLogo"
                      type="file"
                      accept=".jpg,.png,.webp"
                      onChange={(e) => handleFileChange(e, formik)}
                      hidden
                    />
                  </IconButton>
                  <Stack>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}> {i({ id: "COMPANY_DETAILS.SELECTED_LOGO" }, { image: formik.values.holidayImage?.name })}</Typography>
                    {
                      (formik.touched.holidayImage && formik.errors.holidayImage) ?
                        <Typography variant="body2" sx={{ color: 'error.main' }}>{i({ id: formik.errors.holidayImage })}</Typography>
                        :
                        <Typography variant="body2">{i({ id: "VALIDATION_ERR.PICTURE_FORMAT" })}</Typography>
                    }
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
    </CustomisedModal >
  );
};

export default HolidayForm;
