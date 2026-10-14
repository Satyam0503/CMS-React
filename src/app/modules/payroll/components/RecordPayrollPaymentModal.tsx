import { Alert, FormControl, InputLabel, MenuItem, Select, Stack, TextField } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import CustomisedDatePicker from "../../../shared/components/C_DatePicker";
import { AppButton } from "../../../shared/components/ui";

export type PaymentForm = { paymentReference: string; paymentMethod: string; paymentDate: string; notes?: string };

type Props = { open: boolean; employeeName: string; submitting: boolean; onClose: () => void; onSubmit: (form: PaymentForm) => void };

const paymentMethods = ["MANUAL", "BANK_TRANSFER", "CASH", "CHEQUE"];

export const RecordPayrollPaymentModal = ({ open, employeeName, submitting, onClose, onSubmit }: Props) => {
  const [reference, setReference] = useState("");
  const [method, setMethod] = useState("MANUAL");
  const [paymentDate, setPaymentDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [notes, setNotes] = useState("");
  const close = () => {
    if (submitting) return;
    setReference("");
    setMethod("MANUAL");
    setPaymentDate(dayjs().format("YYYY-MM-DD"));
    setNotes("");
    onClose();
  };
  const submit = () => {
    const value = reference.trim();
    if (!value || !paymentDate) return;
    onSubmit({ paymentReference: value, paymentMethod: method, paymentDate, notes: notes.trim() || undefined });
  };
  return <CustomisedModal open={open} handleClose={close} title="Record payroll payment" maxWidth="sm" fullWidth>
    <Stack spacing={2} sx={{ pt: 1 }}>
      <Alert severity="info">Record the payment for {employeeName}. This action cannot be repeated after the payroll is marked paid.</Alert>
      <FormControl fullWidth disabled={submitting}>
        <InputLabel id="payroll-payment-method-label">Payment method</InputLabel>
        <Select labelId="payroll-payment-method-label" label="Payment method" value={method} onChange={event => setMethod(event.target.value)}>
          {paymentMethods.map(value => <MenuItem key={value} value={value}>{value.replace("_", " ")}</MenuItem>)}
        </Select>
      </FormControl>
      <TextField label="Payment reference" value={reference} onChange={event => setReference(event.target.value)} required fullWidth autoFocus disabled={submitting} error={!reference.trim() && reference.length > 0} helperText="Bank, cash, or internal reference is required." />
      <CustomisedDatePicker
        label="Payment date"
        value={paymentDate ? dayjs(paymentDate) : null}
        setValue={(val) => setPaymentDate(val ? val.format("YYYY-MM-DD") : "")}
        required
        disabled={submitting}
      />
      <TextField label="Notes (optional)" value={notes} onChange={event => setNotes(event.target.value)} fullWidth multiline minRows={2} disabled={submitting} />
      <Stack direction="row" justifyContent="flex-end" spacing={1}>
        <AppButton variant="outlined" onClick={close} disabled={submitting}>Cancel</AppButton>
        <AppButton color="success" onClick={submit} disabled={submitting || !reference.trim() || !paymentDate}>{submitting ? "Saving…" : "Record payment"}</AppButton>
      </Stack>
    </Stack>
  </CustomisedModal>;
};