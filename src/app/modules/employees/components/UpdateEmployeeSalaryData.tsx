import { Grid, Stack } from "@mui/system";
import { Formik, FormikProps } from "formik";
import React, { useEffect } from "react";
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
import { useIntl } from "react-intl";
import { updateSalary } from "../employeeServices";
import { salaryValidationSchema } from "../../../../utils/Schema/salaryValidationSchema";

interface PropsTypes {
  userId: string;
  onUserUpdate: (success: boolean) => void;
  formRef: React.MutableRefObject<FormikProps<CreateEmployeeSalary> | null>;
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
  status: true,
};

export const UpdateEmployeeSalaryData = (props: PropsTypes) => {
  const { userId, onUserUpdate, formRef, handleButtonLoading } = props;
  const { formatMessage: i } = useIntl();

  async function UpadteSalaryData(
    values: CreateEmployeeSalary,
    setSubmittng: (isSubmitting: boolean) => void,
  ) {
    const payload = {
      ...values,
      userId,
    };
    try {
      const response = await updateSalary(payload, userId);
      const { success, statusCode } = response.data;
      onUserUpdate(success);
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setSubmittng(false);
      handleButtonLoading(false);
    }
  }
  return (
    <Stack spacing={2} sx={{ p: 1 }}>
      <Formik
        initialValues={employeeSalaryInitialValues}
        onSubmit={(values, { setSubmitting }) => {
          UpadteSalaryData(values, setSubmitting);
        }}
        validationSchema={salaryValidationSchema}
        innerRef={formRef}
      >
        {({
          values,
          setFieldTouched,
          setFieldValue,
          touched,
          errors,
          handleSubmit,
        }) => {
          useEffect(() => {
            setFieldValue("userId", userId);
          }, []);

          return (
            <form onSubmit={handleSubmit}>
              <Stack spacing={1}>
                <Grid container spacing={2}>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      label={i({ id: "EMPLOYEE.SALARY.BASIC_PAY" })}
                      sx={{ width: "100%" }}
                      required
                      name="basicPay"
                      value={values.basicPay}
                      onChange={(e) => {
                        setFieldValue("basicPay", e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      label={i({ id: "EMPLOYEE.SALARY.HRA" })}
                      sx={{ width: "100%" }}
                      name="hra"
                      value={values.hra}
                      onChange={(e) => {
                        setFieldValue("hra", e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      label={i({ id: "EMPLOYEE.SALARY.LTA" })}
                      sx={{ width: "100%" }}
                      name="lta"
                      value={values.lta}
                      onChange={(e) => {
                        setFieldValue("lta", e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      label={i({ id: "EMPLOYEE.SALARY.OTHER_ALLOWANCE" })}
                      sx={{ width: "100%" }}
                      name="otherAllowance"
                      value={values.otherAllowance}
                      onChange={(e) => {
                        setFieldValue("otherAllowance", e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      label={i({ id: "EMPLOYEE.SALARY.BONUS" })}
                      sx={{ width: "100%" }}
                      name="bonus"
                      value={values.bonus}
                      onChange={(e) => {
                        setFieldValue("bonus", e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <TextField
                      type="Number"
                      label={i({ id: "EMPLOYEE.SALARY.HEALTH_INSURANCE" })}
                      sx={{ width: "100%" }}
                      name="healthInsurance"
                      value={values.healthInsurance}
                      onChange={(e) => {
                        setFieldValue("healthInsurance", e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid size={12} sx={{ marginTop: "10px" }}>
                    <TextField
                      type="Number"
                      label={i({ id: "EMPLOYEE.SALARY.TOTAL_DEDUCTIONS" })}
                      sx={{ width: "100%" }}
                      name="totalDeductions"
                      value={values.totalDeductions}
                      onChange={(e) => {
                        setFieldValue("totalDeductions", e.target.value);
                      }}
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomisedDatePicker
                      label={i({ id: "EMPLOYEE.SALARY.EFFECTIVE_FROM" })}
                      value={
                        values.effectiveFrom
                          ? dayjs(values.effectiveFrom)
                          : null
                      }
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("effectiveFrom", true);
                        setFieldValue("effectiveFrom", newDate);
                      }}
                      name="effectiveFrom"
                    />
                  </Grid>
                  <Grid size={12}>
                    <CustomisedDatePicker
                      label={i({ id: "EMPLOYEE.SALARY.EFFECTIVE_TO" })}
                      value={
                        values.effectiveTo ? dayjs(values.effectiveTo) : null
                      }
                      setValue={(newDate: Dayjs | null) => {
                        setFieldTouched("effectiveTo", true);
                        setFieldValue("effectiveTo", newDate);
                      }}
                      name="effectiveTo"
                    />
                  </Grid>
                  <Grid size={12}>
                    <div>
                      <FormControl
                        sx={{ minWidth: 80, width: "100%", marginTop: "10px" }}
                      >
                        <InputLabel id="demo-simple-select-autowidth-label">
                          {i({ id: "EMPLOYEE.SALARY.PAYMENT_FREQUENCY" })}
                        </InputLabel>
                        <Select
                          labelId="demo-simple-select-autowidth-label"
                          id="demo-simple-select-autowidth"
                          value={values.paymentFrequency}
                          onChange={(e) => {
                            setFieldValue("paymentFrequency", e.target.value);
                          }}
                          autoWidth
                          label="Payment Frequency"
                          name="paymentFrequency"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          <MenuItem value="Monthly">
                            {i({ id: "ACCRUAL_PERIOD.MONTHLY" })}
                          </MenuItem>
                          <MenuItem value="Quaterly">
                            {i({ id: "ACCRUAL_PERIOD.QUARTERLY" })}
                          </MenuItem>
                          <MenuItem value="Yearly">
                            {i({ id: "ACCRUAL_PERIOD.YEARLY" })}
                          </MenuItem>
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
