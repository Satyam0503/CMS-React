import { Grid, Stack } from "@mui/system";
import { Formik, FormikProps } from "formik";
import React from "react";
import { CreateEmployeeSalary, SalaryModel } from "../models";
import dayjs, { Dayjs } from "dayjs";
import {
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";
import CustomisedDatePicker from "../../../shared/components/CustomisedDatePicker";
import Select, { SelectChangeEvent } from "@mui/material/Select";

interface PropsTypes {
  employeeId: string;
  onUserUpdate: (success: boolean) => void;
  formRef: React.MutableRefObject<FormikProps<SalaryModel> | null>;
  handleButtonLoading: (loading: boolean) => void;
}

const employeeSalaryInitialValues: CreateEmployeeSalary = {
  userId: "",
  basicPay: 0,
  hra: 0,
  otherAllowance: 0,
  lta: 0,
  bonus: 0,
  healthInsurance: 0,
  totalDeductions: 0,
  effectiveFrom: dayjs(Date.now()),
  effectiveTo: null,
  paymentFrequency: "",
  status: "",
};

export const UpdateEmployeeSalaryData = (props: PropsTypes) => {
  const { employeeId, onUserUpdate, formRef, handleButtonLoading } = props;

  const [age, setAge] = React.useState("");

  const handleChange = (event: SelectChangeEvent) => {
    setAge(event.target.value);
  };

  const handleSubmit = () => {
    console.log("Hello");
  };
  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Formik
        initialValues={employeeSalaryInitialValues}
        onSubmit={(values, { setSubmitting }) => {
          handleSubmit();
        }}
      >
        {({
          values,
          setFieldTouched,
          setFieldValue,
          touched,
          errors,
          handleSubmit,
        }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Stack spacing={1}>
                <Grid container spacing={2}>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      placeholder="Basic Pay"
                      sx={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      placeholder="HRA"
                      sx={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      placeholder="LTA"
                      sx={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      placeholder="Other Allowances"
                      sx={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      placeholder="Bonus"
                      sx={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      placeholder="Health Insurance"
                      sx={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid size={12} sx={{ marginTop: "10px" }}>
                    <TextField
                      type="Number"
                      placeholder="Total Deduction"
                      sx={{ width: "100%" }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomisedDatePicker
                      label="Effective From"
                      value={
                        values.effectiveFrom
                          ? dayjs(values.effectiveFrom)
                          : null
                      }
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("date", true);
                        setFieldValue("date", newDate);
                      }}
                      name="date"
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomisedDatePicker
                      label="Effective To"
                      value={
                        values.effectiveTo ? dayjs(values.effectiveTo) : null
                      }
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("date", true);
                        setFieldValue("date", newDate);
                      }}
                      name="date"
                    />
                  </Grid>
                  <Grid size={12}>
                    {/* <Select label="Payment Frequency" sx={{ width: "100%" }}>
                      <MenuItem>Monthly</MenuItem>
                      <MenuItem>Quaterly</MenuItem>
                      <MenuItem>Yearly</MenuItem>
                    </Select> */}
                    <div>
                      <FormControl
                        sx={{ minWidth: 80, width: "100%", marginTop: "10px" }}
                      >
                        <InputLabel id="demo-simple-select-autowidth-label">
                          Payment Frequency
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-autowidth-label"
                          id="demo-simple-select-autowidth"
                          value={age}
                          onChange={handleChange}
                          autoWidth
                          label="Payment Frequency"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          <MenuItem>Monthly</MenuItem>
                          <MenuItem>Quaterly</MenuItem>
                          <MenuItem>Yearly</MenuItem>
                        </Select>
                      </FormControl>
                    </div>
                  </Grid>
                </Grid>
              </Stack>
            </form>
          );
        }}
      </Formik>
    </Stack>
  );
};
