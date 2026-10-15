import {
  AccountBalanceOutlined,
  CalendarMonthOutlined,
  HealthAndSafetyOutlined,
  LockClockOutlined,
  ReceiptLongOutlined,
  SaveRounded,
  ShieldOutlined,
  TuneRounded,
} from "@mui/icons-material";
import {
  Box,
  Card,
  Collapse,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import dayjs from "dayjs";
import { AppButton } from "../../../shared/components/ui";
import { useIsDark } from "../../theme/useIsDark";

export type PayrollDivisorPolicyConfig = {
  id?: string;
  payrollMode: "Startup" | "Standard" | "Enterprise";
  divisorPolicy: "CALENDAR_DAYS" | "FIXED_30_DAYS" | "WORKING_DAYS";
  lopCalculationBase: "FIXED_GROSS" | "BASIC_ONLY";
  epfMode: "EXEMPT" | "CAPPED_CEILING" | "ACTUAL_BASIC_12";
  epfWageCeiling: number;
  esicMode: "EXEMPT" | "STATUTORY";
  tdsMode: "AUTO_NEW_REGIME" | "AUTO_OLD_REGIME" | "MANUAL_ONLY";
  requireAttendanceLock: boolean;
  effectiveFrom: string;
  isActive: boolean;
  version: number;
};

type Props = {
  policyConfig: PayrollDivisorPolicyConfig;
  setPolicyConfig: React.Dispatch<React.SetStateAction<PayrollDivisorPolicyConfig>>;
  policyExpanded: boolean;
  setPolicyExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  handleSavePolicyConfig: () => Promise<void>;
  isSavingPolicy: boolean;
  canSavePolicy: boolean;
};

export function PayrollPolicyConfigCard({
  policyConfig,
  setPolicyConfig,
  policyExpanded,
  setPolicyExpanded,
  handleSavePolicyConfig,
  isSavingPolicy,
  canSavePolicy,
}: Props) {
  const theme = useTheme();
  const isDark = useIsDark();

  const glassCardSx = {
    borderRadius: "16px",
    border: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(226, 232, 240, 0.85)",
    bgcolor: isDark ? "rgba(15, 23, 42, 0.75)" : "rgba(255, 255, 255, 0.88)",
    backdropFilter: "blur(20px) saturate(180%)",
    WebkitBackdropFilter: "blur(20px) saturate(180%)",
    boxShadow: isDark
      ? "0 12px 32px -4px rgba(0, 0, 0, 0.45)"
      : "0 10px 30px -4px rgba(11, 92, 171, 0.06), inset 0 1px 1px rgba(255, 255, 255, 0.95)",
  };

  const columnPanelSx = {
    p: 2.25,
    borderRadius: "12px",
    border: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#EDF2F7",
    bgcolor: isDark ? "rgba(30, 41, 59, 0.45)" : "rgba(248, 250, 252, 0.75)",
    backdropFilter: "blur(12px)",
    height: "100%",
    display: "flex",
    flexDirection: "column" as const,
  };

  const formattedDate = dayjs(policyConfig.effectiveFrom).isValid()
    ? dayjs(policyConfig.effectiveFrom).format("MMMM D, YYYY")
    : policyConfig.effectiveFrom || "Current Cycle";

  const epfSummary =
    policyConfig.epfMode === "CAPPED_CEILING"
      ? "Capped (₹1,800/mo)"
      : policyConfig.epfMode === "ACTUAL_BASIC_12"
      ? "12% Actual Basic"
      : "Exempt";

  const divisorSummary =
    policyConfig.divisorPolicy === "CALENDAR_DAYS"
      ? "Calendar Days (28–31)"
      : policyConfig.divisorPolicy === "FIXED_30_DAYS"
      ? "Fixed 30 Days"
      : "Working Days";

  const tdsSummary =
    policyConfig.tdsMode === "AUTO_NEW_REGIME"
      ? "New Regime (Sec 115BAC)"
      : policyConfig.tdsMode === "AUTO_OLD_REGIME"
      ? "Old Regime (Sec 87A)"
      : "Manual Override";

  return (
    <Card variant="outlined" sx={{ ...glassCardSx, p: { xs: 2.25, sm: 3 }, mb: 3 }}>
      {/* Executive Header */}
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Stack direction="row" spacing={2} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 46,
              height: 46,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
              background: "linear-gradient(135deg, #0B5CAB 0%, #1D4ED8 100%)",
              color: "#FFFFFF",
              boxShadow: "0 6px 16px -2px rgba(11, 92, 171, 0.35)",
            }}
          >
            <TuneRounded sx={{ fontSize: 24 }} />
          </Box>

          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 0.5 }}>
              <Typography variant="h6" fontWeight={750} sx={{ letterSpacing: "-0.015em", color: "text.primary" }}>
                Company Payroll Policy & Statutory Engine
              </Typography>
              {policyConfig.isActive && (
                <Stack direction="row" spacing={0.6} alignItems="center" sx={{ pl: 0.5 }}>
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      bgcolor: "#10B981",
                      boxShadow: "0 0 0 3px rgba(16, 185, 129, 0.2)",
                    }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: "#10B981", fontSize: "0.75rem" }}>
                    Active
                  </Typography>
                </Stack>
              )}
            </Stack>

            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.84rem", lineHeight: 1.5, maxWidth: 820 }}>
              Calculates daily salary rates, Loss of Pay (LOP) deductions, statutory EPF/ESIC compliance, and Section 115BAC income tax.
            </Typography>

            {/* Quick Status Glass Badges */}
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: 1.5 }}>
              <Box
                sx={{
                  px: 1.25,
                  py: 0.4,
                  borderRadius: "6px",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(241, 245, 249, 0.8)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <CalendarMonthOutlined sx={{ fontSize: 14, color: "#0B5CAB" }} />
                <span>Divisor: <strong style={{ color: isDark ? "#E2E8F0" : "#1E293B" }}>{divisorSummary}</strong></span>
              </Box>

              <Box
                sx={{
                  px: 1.25,
                  py: 0.4,
                  borderRadius: "6px",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(241, 245, 249, 0.8)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <AccountBalanceOutlined sx={{ fontSize: 14, color: "#0D9488" }} />
                <span>EPF: <strong style={{ color: isDark ? "#E2E8F0" : "#1E293B" }}>{epfSummary}</strong></span>
              </Box>

              <Box
                sx={{
                  px: 1.25,
                  py: 0.4,
                  borderRadius: "6px",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(241, 245, 249, 0.8)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <HealthAndSafetyOutlined sx={{ fontSize: 14, color: "#10B981" }} />
                <span>ESIC: <strong style={{ color: isDark ? "#E2E8F0" : "#1E293B" }}>{policyConfig.esicMode}</strong></span>
              </Box>

              <Box
                sx={{
                  px: 1.25,
                  py: 0.4,
                  borderRadius: "6px",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(241, 245, 249, 0.8)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <ReceiptLongOutlined sx={{ fontSize: 14, color: "#6366F1" }} />
                <span>Tax: <strong style={{ color: isDark ? "#E2E8F0" : "#1E293B" }}>{tdsSummary}</strong></span>
              </Box>

              <Box
                sx={{
                  px: 1.25,
                  py: 0.4,
                  borderRadius: "6px",
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(241, 245, 249, 0.8)",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  fontSize: "0.75rem",
                  color: "text.secondary",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.6,
                }}
              >
                <LockClockOutlined sx={{ fontSize: 14, color: policyConfig.requireAttendanceLock ? "#0B5CAB" : "#94A3B8" }} />
                <span>Attendance Gate: <strong style={{ color: policyConfig.requireAttendanceLock ? "#0B5CAB" : "inherit" }}>{policyConfig.requireAttendanceLock ? "Enforced" : "Optional"}</strong></span>
              </Box>
            </Stack>
          </Box>
        </Stack>

        <AppButton
          variant={policyExpanded ? "contained" : "outlined"}
          size="small"
          startIcon={<TuneRounded sx={{ fontSize: 17 }} />}
          onClick={() => setPolicyExpanded((prev) => !prev)}
          sx={{
            height: 38,
            px: 2.25,
            borderRadius: "8px",
            fontSize: "0.825rem",
            fontWeight: 650,
            whiteSpace: "nowrap",
            flexShrink: 0,
            bgcolor: policyExpanded ? "#0B5CAB" : "transparent",
            borderColor: policyExpanded ? "#0B5CAB" : isDark ? "rgba(255,255,255,0.15)" : "#CBD5E1",
          }}
        >
          {policyExpanded ? "Hide Configuration" : "Configure Rules"}
        </AppButton>
      </Stack>

      {/* Expandable Configuration Body */}
      <Collapse in={policyExpanded}>
        <Divider sx={{ my: 2.75, borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0" }} />

        <Stack spacing={3}>
          {/* Form Rules Grid (3 Clean Enhanced Columns) */}
          <Grid container spacing={2}>
            {/* Column 1: Divisor & LOP */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={columnPanelSx}>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "6px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha("#0B5CAB", 0.1),
                      color: "#0B5CAB",
                    }}
                  >
                    <CalendarMonthOutlined sx={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.85rem" }}>
                      1. Divisor & LOP Rules
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                      Daily rate basis & absent day deduction
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2} sx={{ mt: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="divisor-select-label">Daily Divisor Policy</InputLabel>
                    <Select
                      labelId="divisor-select-label"
                      label="Daily Divisor Policy"
                      value={policyConfig.divisorPolicy}
                      onChange={(e) =>
                        setPolicyConfig((prev) => ({
                          ...prev,
                          divisorPolicy: e.target.value as PayrollDivisorPolicyConfig["divisorPolicy"],
                        }))
                      }
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value="CALENDAR_DAYS">Calendar Days in Month (28–31) &bull; Standard</MenuItem>
                      <MenuItem value="FIXED_30_DAYS">Fixed 30 Days &bull; Commercial Baseline</MenuItem>
                      <MenuItem value="WORKING_DAYS">Actual Working Days (Excl. Weekends/Offs)</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="lop-base-label">Loss of Pay (LOP) Base</InputLabel>
                    <Select
                      labelId="lop-base-label"
                      label="Loss of Pay (LOP) Base"
                      value={policyConfig.lopCalculationBase}
                      onChange={(e) =>
                        setPolicyConfig((prev) => ({
                          ...prev,
                          lopCalculationBase: e.target.value as PayrollDivisorPolicyConfig["lopCalculationBase"],
                        }))
                      }
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value="FIXED_GROSS">Gross Salary (Basic + HRA + Allowances)</MenuItem>
                      <MenuItem value="BASIC_ONLY">Basic Pay Only</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            </Grid>

            {/* Column 2: Statutory EPF & ESIC */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={columnPanelSx}>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "6px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha("#0D9488", 0.1),
                      color: "#0D9488",
                    }}
                  >
                    <ShieldOutlined sx={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.85rem" }}>
                      2. Statutory Contributions
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                      Employee PF and ESI compliance rules
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2} sx={{ mt: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="epf-mode-label">Provident Fund (EPF)</InputLabel>
                    <Select
                      labelId="epf-mode-label"
                      label="Provident Fund (EPF)"
                      value={policyConfig.epfMode}
                      onChange={(e) =>
                        setPolicyConfig((prev) => ({
                          ...prev,
                          epfMode: e.target.value as PayrollDivisorPolicyConfig["epfMode"],
                        }))
                      }
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value="CAPPED_CEILING">12% Capped at Wage Ceiling (₹1,800/mo)</MenuItem>
                      <MenuItem value="ACTUAL_BASIC_12">12% of Actual Basic Pay</MenuItem>
                      <MenuItem value="EXEMPT">{"Exempt / Not Applicable (<20 Staff)"}</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth size="small">
                    <InputLabel id="esic-mode-label">State Insurance (ESIC)</InputLabel>
                    <Select
                      labelId="esic-mode-label"
                      label="State Insurance (ESIC)"
                      value={policyConfig.esicMode}
                      onChange={(e) =>
                        setPolicyConfig((prev) => ({
                          ...prev,
                          esicMode: e.target.value as PayrollDivisorPolicyConfig["esicMode"],
                        }))
                      }
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value="STATUTORY">Statutory 0.75% (Gross &le; ₹21,000)</MenuItem>
                      <MenuItem value="EXEMPT">Exempt / Not Applicable</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
            </Grid>

            {/* Column 3: Tax & Attendance Gate */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={columnPanelSx}>
                <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 30,
                      height: 30,
                      borderRadius: "6px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha("#6366F1", 0.1),
                      color: "#6366F1",
                    }}
                  >
                    <ReceiptLongOutlined sx={{ fontSize: 17 }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.85rem" }}>
                      3. Tax & Governance Gate
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                      TDS tax withholding & attendance freeze
                    </Typography>
                  </Box>
                </Stack>

                <Stack spacing={2} sx={{ mt: 1 }}>
                  <FormControl fullWidth size="small">
                    <InputLabel id="tds-mode-label">Income Tax (TDS) Engine</InputLabel>
                    <Select
                      labelId="tds-mode-label"
                      label="Income Tax (TDS) Engine"
                      value={policyConfig.tdsMode}
                      onChange={(e) =>
                        setPolicyConfig((prev) => ({
                          ...prev,
                          tdsMode: e.target.value as PayrollDivisorPolicyConfig["tdsMode"],
                        }))
                      }
                      sx={{ bgcolor: isDark ? "rgba(15, 23, 42, 0.6)" : "#FFFFFF", borderRadius: "8px" }}
                    >
                      <MenuItem value="AUTO_NEW_REGIME">New Tax Regime (Sec 115BAC) &bull; Standard</MenuItem>
                      <MenuItem value="AUTO_OLD_REGIME">Old Tax Regime (Sec 87A Rebate)</MenuItem>
                      <MenuItem value="MANUAL_ONLY">Manual Override / Zero Auto TDS</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Enhanced Attendance Gate Switch Box */}
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: "8px",
                      border: "1px solid",
                      borderColor: policyConfig.requireAttendanceLock
                        ? alpha("#0B5CAB", 0.3)
                        : isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "#E2E8F0",
                      bgcolor: policyConfig.requireAttendanceLock
                        ? alpha("#0B5CAB", 0.04)
                        : isDark
                        ? "rgba(15, 23, 42, 0.6)"
                        : "#FFFFFF",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Box sx={{ pr: 1 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ fontSize: "0.825rem", color: "text.primary" }}>
                        Attendance Lock Gate
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", display: "block", lineHeight: 1.3 }}>
                        Freeze monthly timesheets before calculating salaries.
                      </Typography>
                    </Box>
                    <Switch
                      size="small"
                      checked={policyConfig.requireAttendanceLock}
                      onChange={(e) =>
                        setPolicyConfig((prev) => ({
                          ...prev,
                          requireAttendanceLock: e.target.checked,
                        }))
                      }
                    />
                  </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>

          {/* Action Footer Bar */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1.5}
            sx={{
              pt: 2,
              borderTop: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.775rem" }}>
              Active Version: <strong>v{policyConfig.version || 1}</strong> &bull; Effective Cycle:{" "}
              <strong>{formattedDate}</strong>
            </Typography>

            <AppButton
              variant="contained"
              color="primary"
              size="small"
              startIcon={<SaveRounded sx={{ fontSize: 17 }} />}
              onClick={() => void handleSavePolicyConfig()}
              disabled={isSavingPolicy || !canSavePolicy}
              sx={{
                height: 36,
                px: 3,
                fontSize: "0.825rem",
                fontWeight: 650,
                borderRadius: "8px",
                bgcolor: "#0B5CAB",
                boxShadow: "0 4px 12px rgba(11, 92, 171, 0.25)",
                "&:hover": {
                  bgcolor: "#094A8A",
                  boxShadow: "0 6px 16px rgba(11, 92, 171, 0.35)",
                },
              }}
            >
              {isSavingPolicy ? "Saving Policy..." : "Save Policy Configuration"}
            </AppButton>
          </Stack>
        </Stack>
      </Collapse>
    </Card>
  );
}
