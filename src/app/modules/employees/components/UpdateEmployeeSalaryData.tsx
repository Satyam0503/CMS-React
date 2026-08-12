import { AppSelect } from "../../../shared/components/ui";
import {
  Grid,
  Stack } from "@mui/system";
import { Formik,
  FormikProps } from "formik";
import React from "react";
import { CreateEmployeeSalary,
  SalaryModel } from "../models";
import dayjs,
  { Dayjs } from "dayjs";
import {
  FormControl,
  InputLabel,
  MenuItem,
} from "@mui/material";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { useIntl } from "react-intl";
import { updateSalary } from "../employeeServices";
import { salaryValidationSchema } from "../../../../utils/Schema/salaryValidationSchema";

import { CurrencyInput } from "../../../shared/components/form-component/CurrencyInput";
interface PropsTypes {
  userId: string;
  employeeId: string;
  onUserUpdate: (success: boolean) => void;
  formRef: React.MutableRefObject<FormikProps<CreateEmployeeSalary> | null>;
  handleButtonLoading: (loading: boolean) => void;
  // pre-fills the form with the employee's current active salary when editing one that
  // already exists; omit for a brand new employee who has no salary yet
  existingSalary?: SalaryModel | null;
}

const employeeSalaryInitialValues: CreateEmployeeSalary = {
  userId: "",
  employeeId: "",
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
  const {
    userId,
    employeeId,
    onUserUpdate,
    formRef,
    handleButtonLoading,
    existingSalary,
  } = props;
  const { formatMessage: i } = useIntl();

  async function UpadteSalaryData(
    values: CreateEmployeeSalary,
    setSubmittng: (isSubmitting: boolean) => void,
  ) {
    const payload = {
      ...values,
      userId,
      employeeId,
    };
    try {
      const response = await updateSalary(payload, userId, employeeId);
      const { success } = response.data;
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
        initialValues={{
          ...employeeSalaryInitialValues,
          ...(existingSalary && {
            basicPay: existingSalary.basicPay,
            hra: existingSalary.hra,
            lta: existingSalary.lta,
            otherAllowance: existingSalary.otherAllowance,
            bonus: existingSalary.bonus,
            healthInsurance: existingSalary.healthInsurance,
            totalDeductions: existingSalary.totalDeductions,
            paymentFrequency: existingSalary.paymentFrequency,
          }),
          userId,
          employeeId,
        }}
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
          handleSubmit,
        }) => {
          return (
            <form onSubmit={handleSubmit}>
              <Stack spacing={1}>
                <Grid container spacing={2}>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.BASIC_PAY" })}
                      required
                      name="basicPay"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.HRA" })}
                      name="hra"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.LTA" })}
                      name="lta"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.OTHER_ALLOWANCE" })}
                      name="otherAllowance"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.BONUS" })}
                      name="bonus"
                    />
                  </Grid>
                  <Grid size={{ md: 6, sm: 12, xs: 12 }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.HEALTH_INSURANCE" })}
                      name="healthInsurance"
                    />
                  </Grid>
                  <Grid size={12} sx={{ marginTop: "10px" }}>
                    <CurrencyInput
                      label={i({ id: "EMPLOYEE.SALARY.TOTAL_DEDUCTIONS" })}
                      name="totalDeductions"
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
                        <AppSelect
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
                            {i({ id: "LEAVE.ACCRUAL_PERIOD.MONTHLY" })}
                          </MenuItem>
                          <MenuItem value="Quaterly">
                            {i({ id: "LEAVE.ACCRUAL_PERIOD.QUARTERLY" })}
                          </MenuItem>
                          <MenuItem value="Yearly">
                            {i({ id: "LEAVE.ACCRUAL_PERIOD.YEARLY" })}
                          </MenuItem>
                        </AppSelect>
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
