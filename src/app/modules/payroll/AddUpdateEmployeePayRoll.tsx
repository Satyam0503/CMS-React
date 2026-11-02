import { useIntl } from "react-intl";
import { CustomisedModal } from "../../shared/components/C_Modal";
import { Formik } from "formik";
import { TextInput } from "../../shared/components/form-component/TextInput";
import { CurrencyInput } from "../../shared/components/form-component/CurrencyInput";
import {
  Avatar,
  Box,
  Card,
  Chip,
  DialogActions,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import PersonOutlineOutlined from "@mui/icons-material/PersonOutlineOutlined";
import AccountBalanceWalletOutlined from "@mui/icons-material/AccountBalanceWalletOutlined";
import EventAvailableOutlined from "@mui/icons-material/EventAvailableOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import LockOutlined from "@mui/icons-material/LockOutlined";
import InfoOutlined from "@mui/icons-material/InfoOutlined";
import { payrollValidationSchema } from "../../../utils/Schema/payrollValidationSchema";
import CustomisedButton from "../../shared/components/C_Button";
import { PayRollDataModel } from "./models";
import { Nullable } from "../../../utils/common_types";
import CustomisedDatePicker from "../../shared/components/C_DatePicker";
import dayjs, { Dayjs } from "dayjs";
import { addUpdateEmployeePayRoll } from "./services";
import { toast } from "react-toastify";
import { getStatusCodeString } from "../../../utils/common";

type PayRollFormValues = Nullable<PayRollDataModel> & { payMonth: Dayjs };

interface PropsType {
  open: boolean;
  edit: boolean;
  initialValues: PayRollFormValues;
  employeeName?: string;
  handleClose: () => void;
  handlePageRefresh: () => void;
}

export const AddUpdateEmployeePayRoll = ({
  open,
  handleClose,
  edit,
  initialValues,
  employeeName,
  handlePageRefresh,
}: PropsType) => {
  const { formatMessage: i } = useIntl();

  const handleAddUpdate = async (
    values: typeof initialValues,
    setSubmitting: (isSubmitting: boolean) => void,
  ) => {
    try {
      // Send a plain date string rather than the raw Dayjs object: serializing a Dayjs
      // value sends its full UTC ISO instant, which can shift the intended calendar
      // month backward depending on the browser's local timezone.
      const { data } = await addUpdateEmployeePayRoll({
        ...values,
        payMonth: values.payMonth.format("YYYY-MM-DD"),
      });
      if (data.success) {
        toast.success(
          i({
            id: edit
              ? "TOAST.SUCCESS.PAYROLL_UPDATED"
              : "TOAST.SUCCESS.PAYROLL_ADDED",
          }),
        );
        handleClose();
        handlePageRefresh();
      } else {
        toast.error(
          i({
            id: getStatusCodeString(data.statusCode),
            defaultMessage: i({ id: "ERROR.SOMETHING_WRONG" }),
          }),
        );
      }
    } catch (error) {
      console.error((error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const modalTitle = edit
    ? employeeName
      ? `Update Employee Payroll — ${employeeName}`
      : i({ id: "PAYROLL.UPDATE_EMP_PAYROLL" })
    : i({ id: "PAYROLL.ADD_EMP_PAYROLL" });

  return (
    <CustomisedModal
      open={open}
      handleClose={handleClose}
      title={modalTitle}
      fullWidth
      allowMaximize
      paperSx={{ width: "min(960px, calc(100vw - 32px))" }}
      contentSx={{ pt: 1, pb: 2 }}
    >
      <Formik
        initialValues={initialValues}
        validationSchema={payrollValidationSchema}
        onSubmit={(values, { setSubmitting }) => {
          handleAddUpdate(values, setSubmitting);
        }}
      >
        {({
          handleSubmit,
          setFieldValue,
          setFieldTouched,
          isSubmitting,
          values,
          touched,
          errors,
        }) => {
          // Dynamic live calculations
          const basicPay = Number(values.basicPay) || 0;
          const bonus = Number(values.bonus) || 0;
          const hra = Number(values.hra) || 0;
          const lta = Number(values.lta) || 0;
          const otherAllowance = Number(values.otherAllowance) || 0;
          const grossEarnings = basicPay + bonus + hra + lta + otherAllowance;

          const lossOfPay = Number(values.lossOfPay) || 0;
          const incomeTax = Number(values.incomeTax) || 0;
          const healthInsurance = Number(values.healthInsurance) || 0;
          const epf = Number(values.epf) || 0;
          const esic = Number(values.esic) || 0;
          const totalDeductions =
            lossOfPay + incomeTax + healthInsurance + epf + esic;

          const netSalary = Math.max(0, grossEarnings - totalDeductions);

          return (
            <form onSubmit={handleSubmit}>
              <Stack spacing={2.5}>
                {/* 1. Live Executive Metric Summary Cards */}
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "repeat(3, 1fr)",
                    },
                    gap: 1.5,
                  }}
                >
                  {/* Gross Earnings */}
                  <Card
                    elevation={0}
                    sx={{
                      p: 1.75,
                      borderRadius: "12px",
                      bgcolor: "rgba(16, 185, 129, 0.08)",
                      border: "1px solid rgba(16, 185, 129, 0.25)",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "#047857",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Gross Earnings
                      </Typography>
                      <AccountBalanceWalletOutlined
                        sx={{ fontSize: 18, color: "#059669" }}
                      />
                    </Stack>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: "#065f46" }}
                    >
                      ₹ {grossEarnings.toLocaleString("en-IN")}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#047857", opacity: 0.85 }}
                    >
                      Base pay + allowances
                    </Typography>
                  </Card>

                  {/* Total Deductions */}
                  <Card
                    elevation={0}
                    sx={{
                      p: 1.75,
                      borderRadius: "12px",
                      bgcolor: "rgba(239, 68, 68, 0.08)",
                      border: "1px solid rgba(239, 68, 68, 0.25)",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "#b91c1c",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Total Deductions
                      </Typography>
                      <ReceiptLongOutlined
                        sx={{ fontSize: 18, color: "#dc2626" }}
                      />
                    </Stack>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: "#991b1b" }}
                    >
                      ₹ {totalDeductions.toLocaleString("en-IN")}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#b91c1c", opacity: 0.85 }}
                    >
                      Statutory withholdings & LOP
                    </Typography>
                  </Card>

                  {/* Net Payable Pay */}
                  <Card
                    elevation={0}
                    sx={{
                      p: 1.75,
                      borderRadius: "12px",
                      bgcolor: "rgba(37, 99, 235, 0.08)",
                      border: "1px solid rgba(37, 99, 235, 0.25)",
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mb: 0.5 }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: 700,
                          color: "#1d4ed8",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        Net Payable Pay
                      </Typography>
                      <PaymentsOutlined
                        sx={{ fontSize: 18, color: "#2563eb" }}
                      />
                    </Stack>
                    <Typography
                      variant="h6"
                      sx={{ fontWeight: 800, color: "#1e40af" }}
                    >
                      ₹ {netSalary.toLocaleString("en-IN")}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "#1d4ed8", opacity: 0.85 }}
                    >
                      Gross Earnings − Deductions
                    </Typography>
                  </Card>
                </Box>

                {/* 2. Employee Identity Section */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  {edit ? (
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Stack direction="row" alignItems="center" spacing={1.75}>
                        <Avatar
                          sx={{
                            bgcolor: "primary.light",
                            color: "primary.main",
                            width: 44,
                            height: 44,
                          }}
                        >
                          <PersonOutlineOutlined />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={700}>
                            {employeeName || values.employeeId || "Employee"}
                          </Typography>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ mt: 0.25 }}
                          >
                            <Chip
                              size="small"
                              label={`ID: ${values.employeeId}`}
                              variant="outlined"
                              color="primary"
                              sx={{ fontWeight: 600, height: 22 }}
                            />
                            {values.payMonth && (
                              <Chip
                                size="small"
                                label={`Period: ${dayjs(values.payMonth).format("MMMM YYYY")}`}
                                sx={{ height: 22 }}
                              />
                            )}
                          </Stack>
                        </Box>
                      </Stack>
                      <Chip
                        size="small"
                        icon={<LockOutlined sx={{ fontSize: 14 }} />}
                        label="Employee ID Locked"
                        variant="outlined"
                        color="default"
                        sx={{ fontSize: "0.75rem" }}
                      />
                    </Stack>
                  ) : (
                    <Box>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1.25}
                        sx={{ mb: 1.5 }}
                      >
                        <PersonOutlineOutlined
                          color="primary"
                          sx={{ fontSize: 22 }}
                        />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700}>
                            Employee Identification
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Specify the unique employee identifier for this
                            payroll record.
                          </Typography>
                        </Box>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                          <TextInput
                            size="small"
                            name="employeeId"
                            type="text"
                            label={i({ id: "PAYROLL.TABLE.EMP_ID" })}
                            placeholder="e.g. CD 0006"
                            helperText="Unique corporate Employee ID"
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  )}
                </Card>

                {/* 3. Earnings & Allowances Card */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2.25,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "8px",
                          bgcolor: "rgba(16, 185, 129, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#059669",
                        }}
                      >
                        <AccountBalanceWalletOutlined sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Earnings & Allowances
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Monthly base compensation and supplemental allowances.
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      size="small"
                      label={`Gross: ₹ ${grossEarnings.toLocaleString("en-IN")}`}
                      sx={{
                        fontWeight: 700,
                        bgcolor: "rgba(16, 185, 129, 0.1)",
                        color: "#047857",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                      }}
                    />
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="basicPay"
                        label={i({ id: "PAYROLL.TABLE.BASIC_PAY" })}
                        inputProps={{ min: 0 }}
                        helperText="Foundational statutory salary component"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="bonus"
                        label={i({ id: "PAYROLL.TABLE.BONUS" })}
                        inputProps={{ min: 0 }}
                        helperText="Performance or incentive bonus"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="hra"
                        label={i({ id: "PAYROLL.TABLE.HRA" })}
                        inputProps={{ min: 0 }}
                        helperText="House Rent Allowance"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="lta"
                        label={i({ id: "PAYROLL.TABLE.LTA" })}
                        inputProps={{ min: 0 }}
                        helperText="Leave Travel Allowance"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="otherAllowance"
                        label={i({ id: "PAYROLL.TABLE.OTHER_ALLOWANCE" })}
                        inputProps={{ min: 0 }}
                        helperText="Special / other recurring allowance"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "8px",
                          bgcolor: "rgba(16, 185, 129, 0.05)",
                          border: "1px dashed rgba(16, 185, 129, 0.3)",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                        }}
                      >
                        <InfoOutlined
                          sx={{
                            color: "#059669",
                            fontSize: 20,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ lineHeight: 1.4 }}
                        >
                          Allowances and bonus add to Basic Pay to determine total
                          monthly Gross Earnings before statutory deductions.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>

                {/* 4. Attendance & Loss of Pay Card */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2.25,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "8px",
                          bgcolor: "rgba(99, 102, 241, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#4f46e5",
                        }}
                      >
                        <EventAvailableOutlined sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Attendance & Loss of Pay
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recorded presence, unpaid absences, and salary impact.
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      size="small"
                      label={`${values.paidDays ?? 0} Paid Days`}
                      variant="outlined"
                      sx={{ fontWeight: 600 }}
                    />
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextInput
                        size="small"
                        name="paidDays"
                        type="number"
                        label={i({ id: "PAYROLL.TABLE.PAID_DAYS" })}
                        inputProps={{ min: 0, max: 31, step: "0.5" }}
                        helperText="Days worked & paid leaves in month"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <TextInput
                        size="small"
                        name="lossOfPayDays"
                        type="number"
                        label={i({ id: "PAYROLL.TABLE.LOSS_OF_PAID_DAYS" })}
                        inputProps={{ min: 0, max: 31, step: "0.5" }}
                        helperText="Unpaid absence days (e.g. 0, 1, 1.5)"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="lossOfPay"
                        label={i({ id: "PAYROLL.TABLE.LOSS_OF_PAY" })}
                        inputProps={{ min: 0 }}
                        helperText="Salary deduction amount for unpaid days"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Box
                        sx={{
                          p: 1.5,
                          borderRadius: "8px",
                          bgcolor: "rgba(100, 116, 139, 0.05)",
                          border: "1px dashed rgba(100, 116, 139, 0.25)",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          gap: 1.25,
                        }}
                      >
                        <InfoOutlined
                          sx={{
                            color: "text.secondary",
                            fontSize: 20,
                            flexShrink: 0,
                          }}
                        />
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ lineHeight: 1.4 }}
                        >
                          Loss of Pay (LOP) deduction reduces the payable amount
                          based on unpaid absences recorded in the attendance
                          cycle.
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>

                {/* 5. Deductions Card */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2.25,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: "8px",
                          bgcolor: "rgba(239, 68, 68, 0.12)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#dc2626",
                        }}
                      >
                        <ReceiptLongOutlined sx={{ fontSize: 20 }} />
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700}>
                          Deductions & Withholdings
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Statutory withholdings, insurance, and taxes withheld.
                        </Typography>
                      </Box>
                    </Stack>
                    <Chip
                      size="small"
                      label={`Total: ₹ ${totalDeductions.toLocaleString("en-IN")}`}
                      sx={{
                        fontWeight: 700,
                        bgcolor: "rgba(239, 68, 68, 0.1)",
                        color: "#b91c1c",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                      }}
                    />
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="incomeTax"
                        label={i({ id: "PAYROLL.TABLE.INCOME_TAX" })}
                        inputProps={{ min: 0 }}
                        helperText="Monthly TDS withholding"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="healthInsurance"
                        label={i({ id: "PAYROLL.TABLE.HEALTH_INS" })}
                        inputProps={{ min: 0 }}
                        helperText="Health / medical insurance premium"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="epf"
                        label={i({ id: "PAYROLL.TABLE.EPF" })}
                        inputProps={{ min: 0 }}
                        helperText="Employee Provident Fund contribution"
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CurrencyInput
                        size="small"
                        name="esic"
                        label={i({ id: "PAYROLL.TABLE.ESIC" })}
                        inputProps={{ min: 0 }}
                        helperText="Employee State Insurance contribution"
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* 6. Payroll Dates Card */}
                <Card
                  elevation={0}
                  sx={{
                    p: 2.25,
                    borderRadius: "12px",
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                  }}
                >
                  <Stack
                    direction="row"
                    alignItems="center"
                    spacing={1.25}
                    sx={{ mb: 2 }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "8px",
                        bgcolor: "rgba(14, 165, 233, 0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#0284c7",
                      }}
                    >
                      <CalendarMonthOutlined sx={{ fontSize: 20 }} />
                    </Box>
                    <Box>
                      <Typography variant="subtitle2" fontWeight={700}>
                        Payroll Cycle & Payment Schedule
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        The accounting payroll month and disbursement payment
                        date.
                      </Typography>
                    </Box>
                  </Stack>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomisedDatePicker
                        name="payMonth"
                        value={values.payMonth as Dayjs | null}
                        label={i({ id: "PAYROLL.TABLE.PAY_MONTH" })}
                        views={["year", "month"]}
                        setValue={(date: Dayjs | null) => {
                          setFieldTouched("payMonth", true);
                          setFieldValue("payMonth", date);
                        }}
                        maxDate={dayjs().subtract(1, "month")}
                        disabled={edit}
                        error={Boolean(touched.payMonth && errors.payMonth)}
                        helperText={
                          touched.payMonth && errors.payMonth
                            ? String(errors.payMonth)
                            : undefined
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomisedDatePicker
                        name="paidDate"
                        value={values.paidDate as Dayjs | null}
                        label={i({ id: "PAYROLL.TABLE.PAID_DATE" })}
                        views={["year", "month", "day"]}
                        setValue={(date: Dayjs | null) => {
                          setFieldTouched("paidDate", true);
                          setFieldValue("paidDate", date);
                        }}
                        maxDate={dayjs()}
                        error={Boolean(touched.paidDate && errors.paidDate)}
                        helperText={
                          touched.paidDate && errors.paidDate
                            ? String(errors.paidDate)
                            : undefined
                        }
                      />
                    </Grid>
                  </Grid>
                </Card>
              </Stack>

              {/* Action Footer */}
              <DialogActions
                sx={{
                  mt: 3,
                  pt: 2,
                  px: 0,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1.5,
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography variant="body2" color="text.secondary">
                    Net Payable:
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    fontWeight={800}
                    color="primary.main"
                  >
                    ₹ {netSalary.toLocaleString("en-IN")}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={1.5}>
                  <CustomisedButton
                    label={i({ id: "BUTTON.CANCEL" })}
                    variant="outlined"
                    handleClick={handleClose}
                  />
                  <CustomisedButton
                    loading={isSubmitting}
                    label={i({ id: edit ? "BUTTON.UPDATE" : "BUTTON.ADD" })}
                    type="submit"
                  />
                </Stack>
              </DialogActions>
            </form>
          );
        }}
      </Formik>
    </CustomisedModal>
  );
};
