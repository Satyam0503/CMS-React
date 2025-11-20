import {
  Autocomplete,
  CircularProgress,
  Grid,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { useIntl } from "react-intl";

import { Formik, FormikProps } from "formik";
import dayjs, { Dayjs } from "dayjs";
import { CustomisedModal } from "../../../../shared/components/CustomisedModal";
import { userEducationSchema } from "../../../../../utils/Schema/userSchema";
import { TextInput } from "../../../../shared/components/form-component/TextInput";
import CustomisedDatePicker from "../../../../shared/components/CustomisedDatePicker";
import CustomisedButton from "../../../../shared/components/CustomisedButton";

import { SelectInput } from "../../../../shared/components/form-component/SelectInput";
import { EducationType } from "../../../../../utils/constant/Constant";
import { ErrorLabel } from "../../../../shared/components/form-component/ErrorLabel";
import React, { useEffect, useState } from "react";
import { useDebounce } from "../../../../hooks/useDebounce";
import { addEmployeeEducation, getCollegeList, updateEmployeeEducation } from "../../userservices";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import { UserEducationModel } from "../../models";

type PropTypes = {
  isEdit: boolean;
  open: boolean;
  refresh: () => void;
  initialValues: UserEducationModel;
  handleClose: () => void;
};

export default function AddUpdateEducation(props: PropTypes) {
  const { formatMessage: i } = useIntl();
  const { open, initialValues, handleClose, isEdit, refresh } = props;
  const [loading, setLoading] = useState(false);
  const [isListOpen, setListOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [colllegeList, setCollegeList] = useState<string[]>([]);
  const [selectedCollege, setSelectedCollege] = useState<string | null>(isEdit ? initialValues.collegeName : null)
  const debouncedValue = useDebounce(searchValue);
  const employeeId = useParams().employeeid;

  const handleAddUpdateEducation = async (
    values: UserEducationModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      if (!values.collegeName) {
        toast.error(i({ id: "VALIDATION_ERR.COLLEGE_NAME_REQ" }));
        return;
      }
      values.userId = employeeId ?? "";
      if (isEdit) {
        const response = await updateEmployeeEducation(values);
        const { success } = response.data;
        if (success) {
          toast.success(i({ id: "TOAST.SUCCESS.UPDATE_EDUCATION" }));
          handleClose();
          refresh();
        }
      } else {
        const response = await addEmployeeEducation(values);
        const { success, message } = response.data;
        if (success) {
          toast.success(i({ id: "TOAST.SUCCESS.ADD_EDUCATION" }));
          handleClose();
          refresh();
        }
      }
    } catch (error) {
      console.error((error as AxiosError).message);
    } finally {
      setSubmitting(false);
    }
  };
  const handleSearchChange = async (value: string, formik: FormikProps<UserEducationModel>) => {
    setSearchValue(value);
    formik.setFieldValue("collegeName", value, false)
  };

  const handlePopUpClose = () => {
    setListOpen(false);
  }

  useEffect(() => {
    (async () => {
      if (debouncedValue.trim().length > 0) {
        setLoading(true);
        try {
          const { data } = await getCollegeList(debouncedValue);
          if (data.success) {
            if (data.totalRecords > 0) {
              setCollegeList(data.methodResults);
              setListOpen(true);
            }
            else {
              setListOpen(false);
            }
          }
        } catch (error: any) {
          console.error(error.message);
        }
        finally {
          setLoading(false);
        }
      }
    })();
  }, [debouncedValue])


  return (
    <CustomisedModal open={open} handleClose={handleClose}
      title={i({ id: isEdit ? "PROFILE.EDUCATION.UPDATE" : "PROFILE.EDUCATION.ADD" })}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={userEducationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddUpdateEducation(values, setSubmitting);
        }}
      >
        {(formik) => {
          console.log(formik.values);
          return (
            <form onSubmit={formik.handleSubmit}>
              <Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2 }}>
                <Grid size={12}>
                  <TextInput
                    label={i({ id: "PROFILE.EDUCATION.NAME" })}
                    placeholder={i({ id: "PROFILE.EDUCATION.NAME" })}
                    type="text"
                    name="educationTitle"
                  />
                </Grid>
                <Grid
                  className="pt-2"
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <CustomisedDatePicker
                    label={i({
                      id: "FORM.START_DATE",
                    })}
                    name="startDate"
                    value={formik.values.startDate && dayjs(formik.values.startDate)}
                    setValue={(newDate: Dayjs | null) => {
                      formik.setFieldTouched("startDate", true);
                      formik.setFieldValue("startDate", newDate);
                    }}
                    maxDate={dayjs()}
                  />
                  {formik.touched.startDate && formik.errors.startDate &&
                    <ErrorLabel errorLabel={formik.errors.startDate} />
                  }
                </Grid>

                <Grid
                  className="pt-2"
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <CustomisedDatePicker
                    label={i({
                      id: "FORM.END_DATE",
                    })}
                    name="endDate"
                    value={formik.values.endDate && dayjs(formik.values.endDate)}
                    setValue={(newDate: Dayjs | null) => {
                      formik.setFieldTouched("endDate", true);
                      formik.setFieldValue("endDate", newDate);
                    }}
                    minDate={dayjs(formik.values.startDate)}
                  />
                  {formik.touched.endDate && formik.errors.endDate &&
                    <ErrorLabel errorLabel={formik.errors.endDate} />
                  }
                </Grid>

                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <Autocomplete
                    id="college-search"
                    size="small"
                    loading={loading}
                    open={isListOpen}
                    forcePopupIcon={!loading}
                    options={colllegeList}
                    getOptionLabel={(option) => option}
                    // inputValue={searchValue}
                    value={selectedCollege}
                    clearOnBlur={false}
                    clearOnEscape={false}
                    onInputChange={(e, value) => handleSearchChange(value, formik)}
                    onClose={handlePopUpClose}
                    onChange={(e, values) => {
                      setSelectedCollege(values);
                      formik.setFieldValue("collegeName", values, true);
                      setSearchValue("");
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={i({ id: "PROFILE.EDUCATION.COLLEGE_NAME" })}
                        slotProps={{
                          input: {
                            ...params.InputProps,
                            endAdornment: (
                              <>
                                {loading ? <CircularProgress size={20} className="me-2" /> : null}
                                {params.InputProps.endAdornment}
                              </>
                            ),
                          }
                        }}
                      />
                    )}
                  />
                </Grid>
                <Grid
                  size={{
                    xs: 12,
                    sm: 6
                  }}>
                  <SelectInput
                    label={i({ id: "FORM.TYPE" })}
                    name="type"
                  >
                    {EducationType.map((item) => (
                      <MenuItem key={item.id} value={item.value}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </SelectInput>
                </Grid>
              </Grid>
              <Stack className="flex-row mt-4 justify-content-end gap-2">
                <CustomisedButton
                  variant="outlined"
                  size="medium"
                  label={i({ id: "BUTTON.CLOSE" })}
                  handleClick={handleClose}
                />

                <CustomisedButton
                  loading={formik.isSubmitting}
                  label={i({ id: "BUTTON.SAVE" })}
                  type="submit"
                  disabled={formik.isSubmitting}
                />
              </Stack>
            </form>
          );
        }}
      </Formik>
    </CustomisedModal>
  );
}
