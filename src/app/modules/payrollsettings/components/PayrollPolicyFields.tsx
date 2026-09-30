import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import type { Dispatch, SetStateAction } from "react";
import type { PayrollDivisorPolicyConfig } from "./PayrollConfigurationPanel";

type Props = {
  config: PayrollDivisorPolicyConfig;
  canEdit: boolean;
  onChange: Dispatch<SetStateAction<PayrollDivisorPolicyConfig>>;
  onSaveLopBase: () => void;
  savingLopBase: boolean;
  onOpenComponents: () => void;
  onOpenGroups: () => void;
  onOpenTemplates: () => void;
};

const sectionSx = {
  p: { xs: 2, sm: 2.25 },
  border: "1px solid",
  borderColor: "divider",
  borderRadius: 2.5,
  bgcolor: "background.paper",
  minWidth: 0,
  height: "100%",
};

export function PayrollPolicyFields({
  config,
  canEdit,
  onChange,
  onSaveLopBase,
  savingLopBase,
  onOpenComponents,
  onOpenGroups,
  onOpenTemplates,
}: Props) {
  const theme = useTheme();
  const epfEnabled = config.epfMode !== "EXEMPT";
  const esicEnabled = config.esicMode !== "EXEMPT";
  const tdsEnabled = config.tdsMode !== "MANUAL_ONLY";
  const selectedCount = [epfEnabled, esicEnabled, tdsEnabled, config.requireAttendanceLock].filter(Boolean).length;
  const features = [
    {
      key: "epf", title: "Provident Fund (EPF)", detail: "Employee and employer contributions", checked: epfEnabled,
      update: (checked: boolean) => onChange((previous) => ({ ...previous, epfMode: checked ? "CAPPED_CEILING" : "EXEMPT" })),
    },
    {
      key: "esic", title: "State Insurance (ESIC)", detail: "Wage based insurance contributions", checked: esicEnabled,
      update: (checked: boolean) => onChange((previous) => ({ ...previous, esicMode: checked ? "STATUTORY" : "EXEMPT" })),
    },
    {
      key: "tds", title: "Automatic income tax (TDS)", detail: "Payroll calculates withholding", checked: tdsEnabled,
      update: (checked: boolean) => onChange((previous) => ({ ...previous, tdsMode: checked ? "AUTO_NEW_REGIME" : "MANUAL_ONLY" })),
    },
    {
      key: "attendance", title: "Attendance lock", detail: "Freeze timesheets and leave before payroll", checked: config.requireAttendanceLock,
      update: (checked: boolean) => onChange((previous) => ({ ...previous, requireAttendanceLock: checked })),
    },
  ];

  return (
    <Stack spacing={2.5}>
      <Box sx={{ ...sectionSx, bgcolor: alpha(theme.palette.primary.main, 0.035) }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} sx={{ mb: 1.75 }}>
          <Box>
            <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 750 }}>1. Choose payroll features</Typography>
            <Typography variant="body2" color="text.secondary">Select the rules this company needs. Each selected feature reveals its settings below.</Typography>
          </Box>
          <Chip size="small" color="primary" variant="outlined" label={`${selectedCount} selected`} />
        </Stack>
        <Grid container spacing={1.25}>
          {features.map((feature) => (
            <Grid key={feature.key} size={{ xs: 12, sm: 6, lg: 3 }}>
              <Box sx={{ p: 1.5, height: "100%", border: "1px solid", borderColor: feature.checked ? "primary.main" : "divider", borderRadius: 2, bgcolor: feature.checked ? alpha(theme.palette.primary.main, 0.07) : "background.paper" }}>
                <FormControlLabel
                  sx={{ m: 0, width: "100%", alignItems: "flex-start" }}
                  control={<Checkbox size="small" checked={feature.checked} disabled={!canEdit} onChange={(event) => feature.update(event.target.checked)} sx={{ p: 0.25, mr: 1, mt: 0.1 }} />}
                  label={<Box><Typography variant="body2" fontWeight={700}>{feature.title}</Typography><Typography variant="caption" color="text.secondary">{feature.detail}</Typography></Box>}
                />
              </Box>
            </Grid>
          ))}
        </Grid>
        <Alert severity="info" sx={{ mt: 1.75 }}>Selections become payroll rules only after this dated profile is submitted and approved.</Alert>
      </Box>

      <Box>
        <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 750, mb: 0.5 }}>2. Set the rules</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.75 }}>Only settings for selected features are shown. The daily rate rule applies to every payroll.</Typography>
        <Grid container spacing={1.5} alignItems="stretch">
          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={1.75} sx={sectionSx}>
              <Stack direction="row" spacing={1} alignItems="center"><CalendarMonthOutlined color="primary" fontSize="small" /><Typography variant="subtitle1" fontWeight={700}>Daily pay and loss of pay</Typography></Stack>
              <TextField select fullWidth size="small" label="Daily rate divisor" value={config.divisorPolicy} disabled={!canEdit} onChange={(event) => onChange((previous) => ({ ...previous, divisorPolicy: event.target.value as PayrollDivisorPolicyConfig["divisorPolicy"] }))} helperText="Monthly pay is divided by this number of days.">
                <MenuItem value="CALENDAR_DAYS">Calendar days in the month (28–31)</MenuItem>
                <MenuItem value="FIXED_30_DAYS">Fixed 30 days</MenuItem>
                <MenuItem value="WORKING_DAYS">Scheduled working days</MenuItem>
              </TextField>
              <TextField select fullWidth size="small" label="Unpaid leave deduction base" value={config.lopCalculationBase} disabled={!canEdit} onChange={(event) => onChange((previous) => ({ ...previous, lopCalculationBase: event.target.value as PayrollDivisorPolicyConfig["lopCalculationBase"] }))} helperText="Choose which salary amount is reduced for unpaid leave.">
                <MenuItem value="FIXED_GROSS">Gross fixed salary</MenuItem>
                <MenuItem value="BASIC_ONLY">Basic pay only</MenuItem>
              </TextField>
              {canEdit && <Button variant="outlined" size="small" disabled={savingLopBase} onClick={onSaveLopBase} sx={{ alignSelf: "flex-start" }}>{savingLopBase ? "Saving…" : "Save unpaid leave base"}</Button>}
              <Typography variant="caption" color="text.secondary">The unpaid leave base is a company setting and saves separately. The daily rate divisor follows the approval flow below.</Typography>
            </Stack>
          </Grid>

          {epfEnabled && <Grid size={{ xs: 12, md: 6 }}><Stack spacing={1.75} sx={sectionSx}>
            <Stack direction="row" spacing={1} alignItems="center"><AccountBalanceOutlined color="primary" fontSize="small" /><Typography variant="subtitle1" fontWeight={700}>Provident Fund</Typography></Stack>
            <TextField select fullWidth size="small" label="EPF contribution basis" value={config.epfMode} disabled={!canEdit} onChange={(event) => onChange((previous) => ({ ...previous, epfMode: event.target.value as PayrollDivisorPolicyConfig["epfMode"] }))}>
              <MenuItem value="CAPPED_CEILING">12% up to the configured wage ceiling</MenuItem>
              <MenuItem value="ACTUAL_BASIC_12">12% of actual basic pay</MenuItem>
            </TextField>
            {config.epfMode === "CAPPED_CEILING" && <TextField fullWidth size="small" type="number" label="EPF wage ceiling (₹)" value={config.epfWageCeiling} disabled={!canEdit} onChange={(event) => onChange((previous) => ({ ...previous, epfWageCeiling: Math.max(0, Number(event.target.value)) }))} inputProps={{ min: 0 }} />}
            <Typography variant="caption" color="text.secondary">Confirm eligibility, contribution basis, and ceiling with your payroll adviser.</Typography>
          </Stack></Grid>}

          {esicEnabled && <Grid size={{ xs: 12, md: 6 }}><Stack spacing={1.75} sx={sectionSx}>
            <Stack direction="row" spacing={1} alignItems="center"><ShieldOutlined color="primary" fontSize="small" /><Typography variant="subtitle1" fontWeight={700}>State Insurance</Typography></Stack>
            <TextField fullWidth size="small" type="number" label="ESIC wage ceiling (₹)" value={config.esicWageCeiling} disabled={!canEdit} onChange={(event) => onChange((previous) => ({ ...previous, esicWageCeiling: Math.max(0, Number(event.target.value)) }))} inputProps={{ min: 0 }} />
            <Typography variant="caption" color="text.secondary">The approved profile controls the contribution for eligible employees.</Typography>
          </Stack></Grid>}

          {tdsEnabled && <Grid size={{ xs: 12, md: 6 }}><Stack spacing={1.75} sx={sectionSx}>
            <Stack direction="row" spacing={1} alignItems="center"><PaymentsOutlined color="primary" fontSize="small" /><Typography variant="subtitle1" fontWeight={700}>Income tax withholding</Typography></Stack>
            <TextField select fullWidth size="small" label="Tax regime" value={config.tdsMode} disabled={!canEdit} onChange={(event) => onChange((previous) => ({ ...previous, tdsMode: event.target.value as PayrollDivisorPolicyConfig["tdsMode"] }))}>
              <MenuItem value="AUTO_NEW_REGIME">New tax regime</MenuItem>
              <MenuItem value="AUTO_OLD_REGIME">Old tax regime</MenuItem>
            </TextField>
            <Typography variant="caption" color="text.secondary">A tax reviewer must confirm the financial year and rule version before approval.</Typography>
          </Stack></Grid>}

          {config.requireAttendanceLock && <Grid size={{ xs: 12, md: 6 }}><Stack spacing={1.5} sx={sectionSx}>
            <Stack direction="row" spacing={1} alignItems="center"><FactCheckOutlined color="primary" fontSize="small" /><Typography variant="subtitle1" fontWeight={700}>Attendance readiness gate</Typography></Stack>
            <Typography variant="body2" color="text.secondary">Payroll waits until monthly timesheets and leave inputs are frozen. Exceptions must be resolved before salary calculation.</Typography>
          </Stack></Grid>}
        </Grid>
      </Box>

      <Box sx={{ ...sectionSx, height: "auto" }}>
        <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 0.5 }}>Optional payroll setup</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>Use pay groups for different cohorts, salary templates for reusable packages, and components for bonus, allowances, or deductions.</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap" useFlexGap>
          <Button variant="outlined" size="small" startIcon={<GroupsOutlined />} onClick={onOpenGroups}>Pay groups</Button>
          <Button variant="outlined" size="small" startIcon={<ReceiptLongOutlined />} onClick={onOpenTemplates}>Salary templates</Button>
          <Button variant="outlined" size="small" startIcon={<PaymentsOutlined />} onClick={onOpenComponents}>Bonus and components</Button>
        </Stack>
      </Box>
    </Stack>
  );
}
