import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import SaveRounded from "@mui/icons-material/SaveRounded";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import TuneRounded from "@mui/icons-material/TuneRounded";
import {
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { useIsDark } from "../../theme/useIsDark";
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
  componentFeatures: Array<Pick<PayrollFeatureComponent, "id" | "code" | "name" | "kind" | "calculationType" | "isTaxable" | "isActive">>;
  onToggleComponent: (component: PayrollFeatureComponent, checked: boolean) => void;
  componentsBusy: boolean;
};

export type PayrollFeatureComponent = {
  id?: string;
  code: string;
  name: string;
  kind: "EARNING" | "DEDUCTION";
  calculationType: "FIXED" | "PERCENT_OF_GROSS" | "PERCENT_OF_COMPONENT";
  isTaxable: boolean;
  isActive: boolean;
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
  componentFeatures,
  onToggleComponent,
  componentsBusy,
}: Props) {
  const theme = useTheme();
  const isDark = useIsDark();

  const epfEnabled = config.epfMode !== "EXEMPT";
  const esicEnabled = config.esicMode !== "EXEMPT";
  const tdsEnabled = config.tdsMode !== "MANUAL_ONLY";
  const selectedCount = [
    epfEnabled,
    esicEnabled,
    tdsEnabled,
    config.requireAttendanceLock,
    ...componentFeatures.map((component) => component.isActive),
  ].filter(Boolean).length;

  const features = [
    {
      key: "epf",
      title: "Provident Fund (EPF)",
      detail: "Employee and employer contributions",
      checked: epfEnabled,
      update: (checked: boolean) =>
        onChange((previous) => ({
          ...previous,
          epfMode: checked ? "CAPPED_CEILING" : "EXEMPT",
        })),
    },
    {
      key: "esic",
      title: "State Insurance (ESIC)",
      detail: "Wage based insurance contributions",
      checked: esicEnabled,
      update: (checked: boolean) =>
        onChange((previous) => ({
          ...previous,
          esicMode: checked ? "STATUTORY" : "EXEMPT",
        })),
    },
    {
      key: "tds",
      title: "Automatic income tax (TDS)",
      detail: "Payroll calculates withholding",
      checked: tdsEnabled,
      update: (checked: boolean) =>
        onChange((previous) => ({
          ...previous,
          tdsMode: checked ? "AUTO_NEW_REGIME" : "MANUAL_ONLY",
        })),
    },
    {
      key: "attendance",
      title: "Attendance lock",
      detail: "Freeze timesheets and leave before payroll",
      checked: config.requireAttendanceLock,
      update: (checked: boolean) =>
        onChange((previous) => ({
          ...previous,
          requireAttendanceLock: checked,
        })),
    },
    ...componentFeatures.map((component) => ({
      key: `component-${component.id || component.code}`,
      title: component.name,
      detail: `${component.kind === "EARNING" ? "Earning" : "Deduction"} · ${component.calculationType.replace(/_/g, " ").toLowerCase()} · ${component.isTaxable ? "taxable" : "non-taxable"}`,
      checked: component.isActive,
      update: (checked: boolean) => onToggleComponent(component, checked),
      component,
    })),
  ];

  const modernConfigCardSx = {
    p: { xs: 2, sm: 2.5 },
    border: "1px solid",
    borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
    borderRadius: "14px",
    bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "#FFFFFF",
    boxShadow: isDark
      ? "0 2px 10px rgba(0, 0, 0, 0.25)"
      : "0 2px 10px rgba(15, 23, 42, 0.03)",
    minWidth: 0,
    height: "100%",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    "&:hover": {
      borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "#CBD5E1",
      boxShadow: isDark
        ? "0 4px 18px rgba(0, 0, 0, 0.35)"
        : "0 4px 16px rgba(15, 23, 42, 0.06)",
    },
  };

  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "9px",
      transition: "border-color 0.18s ease, box-shadow 0.18s ease",
      "&:hover:not(.Mui-disabled) .MuiOutlinedInput-notchedOutline": {
        borderColor: "primary.main",
      },
      "&.Mui-focused": {
        boxShadow: `0 0 0 3px ${alpha(theme.palette.primary.main, 0.15)}`,
      },
    },
  };

  const renderFeatureToggle = (feature: (typeof features)[number]) => {
    const isEpf = feature.key === "epf";
    const isEsic = feature.key === "esic";
    const isTds = feature.key === "tds";
    const isAttendance = feature.key === "attendance";

    let icon = <PaymentsOutlined sx={{ fontSize: 17 }} />;
    let accentColor = isDark ? "#7DD3FC" : "#0284C7";
    let iconBg = isDark ? "rgba(2, 132, 199, 0.18)" : "rgba(2, 132, 199, 0.09)";

    if (isEpf) {
      icon = <AccountBalanceOutlined sx={{ fontSize: 17 }} />;
      accentColor = isDark ? "#93C5FD" : "#2563EB";
      iconBg = isDark ? "rgba(37, 99, 235, 0.18)" : "rgba(37, 99, 235, 0.09)";
    } else if (isEsic) {
      icon = <ShieldOutlined sx={{ fontSize: 17 }} />;
      accentColor = isDark ? "#6EE7B7" : "#059669";
      iconBg = isDark ? "rgba(5, 150, 105, 0.18)" : "rgba(5, 150, 105, 0.09)";
    } else if (isTds) {
      icon = <ReceiptLongOutlined sx={{ fontSize: 17 }} />;
      accentColor = isDark ? "#FCD34D" : "#D97706";
      iconBg = isDark ? "rgba(217, 119, 6, 0.18)" : "rgba(217, 119, 6, 0.09)";
    } else if (isAttendance) {
      icon = <FactCheckOutlined sx={{ fontSize: 17 }} />;
      accentColor = isDark ? "#C4B5FD" : "#7C3AED";
      iconBg = isDark ? "rgba(124, 58, 237, 0.18)" : "rgba(124, 58, 237, 0.09)";
    }

    return (
      <Box
        key={feature.key}
        sx={{
          p: { xs: 1.25, sm: 1.5 },
          minHeight: 64,
          display: "flex",
          alignItems: "flex-start",
          border: feature.checked ? "1.5px solid" : "1px solid",
          borderColor: feature.checked
            ? alpha(accentColor, isDark ? 0.7 : 0.6)
            : isDark
            ? "rgba(255, 255, 255, 0.08)"
            : "#E2E8F0",
          borderRadius: "12px",
          bgcolor: feature.checked
            ? isDark
              ? alpha(accentColor, 0.1)
              : alpha(accentColor, 0.035)
            : "background.paper",
          boxShadow: feature.checked
            ? isDark
              ? `0 3px 14px rgba(0, 0, 0, 0.3), inset 0 1px 0 ${alpha(accentColor, 0.2)}`
              : `0 3px 12px ${alpha(accentColor, 0.12)}, inset 0 1px 0 #FFFFFF`
            : isDark
            ? "none"
            : "0 1px 2px rgba(0, 0, 0, 0.02)",
          transition:
            "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.2s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.2s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            transform: canEdit ? "translateY(-2px)" : "none",
            boxShadow: isDark
              ? "0 6px 20px rgba(0, 0, 0, 0.35)"
              : `0 6px 18px ${alpha(accentColor, 0.14)}`,
            borderColor: alpha(accentColor, 0.65),
          },
        }}
      >
        <FormControlLabel
          sx={{
            m: 0,
            width: "100%",
            alignItems: "flex-start",
            cursor: canEdit ? "pointer" : "default",
            userSelect: "none",
          }}
          control={
            <Checkbox
              size="small"
              checked={feature.checked}
              disabled={!canEdit || ("component" in feature && componentsBusy)}
              inputProps={{
                "aria-label": `${feature.checked ? "Exclude" : "Include"} ${feature.title} in payroll`,
              }}
              onChange={(event) => feature.update(event.target.checked)}
              sx={{
                p: 0.25,
                mr: 1.25,
                mt: 0.1,
                color: feature.checked ? accentColor : "text.secondary",
                "&.Mui-checked": {
                  color: accentColor,
                },
                transition: "transform 0.15s ease",
                "&:hover": {
                  transform: canEdit ? "scale(1.12)" : "none",
                },
              }}
            />
          }
          label={
            <Box sx={{ width: "100%", minWidth: 0 }}>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 0.35 }}
              >
                <Stack direction="row" spacing={1} alignItems="center" minWidth={0} sx={{ flex: 1, pr: 0.5 }}>
                  <Box
                    sx={{
                      width: 26,
                      height: 26,
                      borderRadius: "7px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: iconBg,
                      color: accentColor,
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.86rem",
                      lineHeight: 1.3,
                      color: feature.checked ? "text.primary" : "text.secondary",
                      letterSpacing: "-0.01em",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {feature.title}
                  </Typography>
                </Stack>
                <Chip
                  size="small"
                  label={feature.checked ? "Active" : "Off"}
                  sx={{
                    height: 19,
                    fontSize: "0.66rem",
                    fontWeight: 750,
                    borderRadius: "5px",
                    px: 0.5,
                    flexShrink: 0,
                    bgcolor: feature.checked
                      ? alpha(accentColor, isDark ? 0.22 : 0.12)
                      : isDark
                      ? "rgba(255,255,255,0.06)"
                      : "#F1F5F9",
                    color: feature.checked ? accentColor : "text.disabled",
                    border: "1px solid",
                    borderColor: feature.checked ? alpha(accentColor, 0.3) : "transparent",
                    transition: "all 0.18s ease",
                  }}
                />
              </Stack>
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  fontSize: "0.74rem",
                  lineHeight: 1.4,
                  display: "block",
                  pl: "34px",
                }}
              >
                {feature.detail}
              </Typography>
            </Box>
          }
        />
      </Box>
    );
  };

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2.5} alignItems="stretch">
        <Grid data-testid="payroll-feature-selection-step" size={{ xs: 12 }}>
          <Stack
            spacing={2}
            sx={{
              p: { xs: 1.5, sm: 2 },
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
              borderRadius: "16px",
              bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "#FFFFFF",
              boxShadow: isDark
                ? "0 4px 20px rgba(0, 0, 0, 0.25)"
                : "0 4px 18px rgba(15, 23, 42, 0.03)",
              minWidth: 0,
              height: "100%",
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={1.5}
              sx={{
                pb: 1.5,
                borderBottom: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9",
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 36,
                    height: 36,
                    borderRadius: "10px",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                    color: "primary.main",
                    flexShrink: 0,
                  }}
                >
                  <TuneRounded sx={{ fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "1.025rem",
                      fontWeight: 750,
                      letterSpacing: "-0.015em",
                      color: "text.primary",
                    }}
                  >
                    1. Choose payroll features
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem" }}>
                    Select what this company uses.
                  </Typography>
                </Box>
              </Stack>
              <Chip
                size="small"
                label={`${selectedCount} selected`}
                sx={{
                  height: 26,
                  px: 1,
                  borderRadius: "999px",
                  fontWeight: 750,
                  fontSize: "0.75rem",
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.25),
                }}
              />
            </Stack>

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25, mt: 0.5 }}>
                <Box sx={{ width: 3, height: 14, borderRadius: "2px", bgcolor: "#2563EB" }} />
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 750,
                    fontSize: "0.72rem",
                    letterSpacing: "0.06em",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    lineHeight: 1.5,
                  }}
                >
                  Statutory and tax
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  label={`${features.filter((f) => ["epf", "esic", "tds"].includes(f.key) && f.checked).length} of 3 active`}
                  sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderColor: "divider" }}
                />
              </Stack>
              <Grid container spacing={1.5}>
                {features
                  .filter((feature) => ["epf", "esic", "tds"].includes(feature.key))
                  .map((feature) => (
                    <Grid key={feature.key} size={{ xs: 12, sm: 6, lg: 4 }}>
                      {renderFeatureToggle(feature)}
                    </Grid>
                  ))}
              </Grid>
            </Box>

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25, mt: 0.5 }}>
                <Box sx={{ width: 3, height: 14, borderRadius: "2px", bgcolor: "#7C3AED" }} />
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 750,
                    fontSize: "0.72rem",
                    letterSpacing: "0.06em",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    lineHeight: 1.5,
                  }}
                >
                  Payroll control
                </Typography>
                <Chip
                  size="small"
                  variant="outlined"
                  label={config.requireAttendanceLock ? "Active" : "Off"}
                  sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderColor: "divider" }}
                />
              </Stack>
              <Grid container spacing={1.5}>
                {features
                  .filter((feature) => feature.key === "attendance")
                  .map((feature) => (
                    <Grid key={feature.key} size={{ xs: 12, sm: 6, lg: 4 }}>
                      {renderFeatureToggle(feature)}
                    </Grid>
                  ))}
              </Grid>
            </Box>

            <Box>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.25, mt: 0.5 }}>
                <Box sx={{ width: 3, height: 14, borderRadius: "2px", bgcolor: "#0284C7" }} />
                <Typography
                  variant="overline"
                  sx={{
                    fontWeight: 750,
                    fontSize: "0.72rem",
                    letterSpacing: "0.06em",
                    color: "text.secondary",
                    textTransform: "uppercase",
                    lineHeight: 1.5,
                  }}
                >
                  Earnings and deductions
                </Typography>
                {componentFeatures.length > 0 && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`${componentFeatures.filter((c) => c.isActive).length} of ${componentFeatures.length} active`}
                    sx={{ height: 18, fontSize: "0.64rem", fontWeight: 700, borderColor: "divider" }}
                  />
                )}
              </Stack>
              {componentFeatures.length > 0 ? (
                <Grid container spacing={1.5}>
                  {features
                    .filter((feature) => "component" in feature)
                    .map((feature) => (
                      <Grid key={feature.key} size={{ xs: 12, sm: 6, lg: 4 }}>
                        {renderFeatureToggle(feature)}
                      </Grid>
                    ))}
                </Grid>
              ) : (
                <Stack
                  spacing={1.25}
                  alignItems="flex-start"
                  sx={{
                    p: 2,
                    border: "1px dashed",
                    borderColor: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1",
                    borderRadius: "12px",
                    bgcolor: isDark ? "rgba(255,255,255,0.02)" : "#F8FAFC",
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <PaymentsOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem" }}>
                      No company earning or deduction components have been defined yet.
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<PaymentsOutlined />}
                    onClick={onOpenComponents}
                    sx={{
                      borderRadius: "8px",
                      textTransform: "none",
                      fontWeight: 650,
                      fontSize: "0.8rem",
                      borderColor: isDark ? "rgba(255,255,255,0.14)" : "#CBD5E1",
                      "&:hover": {
                        borderColor: "primary.main",
                        bgcolor: alpha(theme.palette.primary.main, 0.06),
                      },
                    }}
                  >
                    Set up components
                  </Button>
                </Stack>
              )}
            </Box>
          </Stack>
        </Grid>

        <Grid data-testid="payroll-feature-configuration-step" size={{ xs: 12 }}>
          <Box>
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  fontSize: "1.025rem",
                  fontWeight: 750,
                  mb: 0.35,
                  letterSpacing: "-0.015em",
                  color: "text.primary",
                }}
              >
                2. Configure selected features
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem" }}>
                Settings appear here when enabled. The daily rate rule applies to every payroll.
              </Typography>
            </Box>

            <Grid container spacing={2} alignItems="stretch">
              <Grid size={{ xs: 12, md: 6 }}>
                <Stack spacing={2} sx={modernConfigCardSx}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      pb: 1,
                      borderBottom: "1px solid",
                      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9",
                    }}
                  >
                    <Stack direction="row" spacing={1.25} alignItems="center">
                      <Box
                        sx={{
                          width: 32,
                          height: 32,
                          borderRadius: "8px",
                          display: "grid",
                          placeItems: "center",
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: "primary.main",
                        }}
                      >
                        <CalendarMonthOutlined sx={{ fontSize: 18 }} />
                      </Box>
                      <Typography variant="subtitle1" fontWeight={750} sx={{ fontSize: "0.925rem" }}>
                        Daily pay and loss of pay
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label="Universal"
                      sx={{
                        height: 20,
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        borderRadius: "5px",
                        bgcolor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
                        color: "text.secondary",
                      }}
                    />
                  </Stack>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Daily rate divisor"
                    value={config.divisorPolicy}
                    disabled={!canEdit}
                    onChange={(event) =>
                      onChange((previous) => ({
                        ...previous,
                        divisorPolicy: event.target.value as PayrollDivisorPolicyConfig["divisorPolicy"],
                      }))
                    }
                    helperText="Monthly pay is divided by this number of days."
                    sx={inputSx}
                  >
                    <MenuItem value="CALENDAR_DAYS">Calendar days in the month (28–31)</MenuItem>
                    <MenuItem value="FIXED_30_DAYS">Fixed 30 days</MenuItem>
                    <MenuItem value="WORKING_DAYS">Scheduled working days</MenuItem>
                  </TextField>

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Unpaid leave deduction base"
                    value={config.lopCalculationBase}
                    disabled={!canEdit}
                    onChange={(event) =>
                      onChange((previous) => ({
                        ...previous,
                        lopCalculationBase: event.target.value as PayrollDivisorPolicyConfig["lopCalculationBase"],
                      }))
                    }
                    helperText="Choose which salary amount is reduced for unpaid leave."
                    sx={inputSx}
                  >
                    <MenuItem value="FIXED_GROSS">Gross fixed salary</MenuItem>
                    <MenuItem value="BASIC_ONLY">Basic pay only</MenuItem>
                  </TextField>

                  {canEdit && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={
                        savingLopBase ? (
                          <CircularProgress size={14} color="inherit" />
                        ) : (
                          <SaveRounded sx={{ fontSize: 16 }} />
                        )
                      }
                      disabled={savingLopBase}
                      onClick={onSaveLopBase}
                      sx={{
                        alignSelf: "flex-start",
                        height: 34,
                        px: 2,
                        fontWeight: 700,
                        fontSize: "0.8rem",
                        textTransform: "none",
                        borderRadius: "8px",
                        borderColor: isDark ? "rgba(255,255,255,0.14)" : "#CBD5E1",
                        transition: "all 0.18s ease",
                        "&:hover": {
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          borderColor: "primary.main",
                        },
                      }}
                    >
                      {savingLopBase ? "Saving…" : "Save unpaid leave base"}
                    </Button>
                  )}

                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: "8px",
                      bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                      border: "1px dashed",
                      borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", fontSize: "0.74rem", lineHeight: 1.45 }}
                    >
                      The unpaid leave base is a company setting and saves separately. The daily rate divisor follows the approval flow below.
                    </Typography>
                  </Box>
                </Stack>
              </Grid>

              {epfEnabled && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2} sx={modernConfigCardSx}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        pb: 1,
                        borderBottom: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9",
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: isDark ? "rgba(37, 99, 235, 0.18)" : "rgba(37, 99, 235, 0.09)",
                            color: "#2563EB",
                          }}
                        >
                          <AccountBalanceOutlined sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={750} sx={{ fontSize: "0.925rem" }}>
                          Provident Fund
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        label="Statutory"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          borderRadius: "5px",
                          bgcolor: isDark ? "rgba(37, 99, 235, 0.2)" : "rgba(37, 99, 235, 0.1)",
                          color: "#2563EB",
                        }}
                      />
                    </Stack>

                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="EPF contribution basis"
                      value={config.epfMode}
                      disabled={!canEdit}
                      onChange={(event) =>
                        onChange((previous) => ({
                          ...previous,
                          epfMode: event.target.value as PayrollDivisorPolicyConfig["epfMode"],
                        }))
                      }
                      sx={inputSx}
                    >
                      <MenuItem value="CAPPED_CEILING">Configured rate up to the wage ceiling</MenuItem>
                      <MenuItem value="ACTUAL_BASIC_12">Configured rate of actual basic pay</MenuItem>
                    </TextField>

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Employee contribution (%)"
                          value={config.epfEmployeeRatePercent}
                          disabled={!canEdit}
                          onChange={(event) =>
                            onChange((previous) => ({
                              ...previous,
                              epfEmployeeRatePercent: Math.min(100, Math.max(0, Number(event.target.value))),
                            }))
                          }
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                          sx={inputSx}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Employer contribution (%)"
                          value={config.epfEmployerRatePercent}
                          disabled={!canEdit}
                          onChange={(event) =>
                            onChange((previous) => ({
                              ...previous,
                              epfEmployerRatePercent: Math.min(100, Math.max(0, Number(event.target.value))),
                            }))
                          }
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                          sx={inputSx}
                        />
                      </Grid>
                    </Grid>

                    {config.epfMode === "CAPPED_CEILING" && (
                      <TextField
                        fullWidth
                        size="small"
                        type="number"
                        label="EPF wage ceiling (₹)"
                        value={config.epfWageCeiling}
                        disabled={!canEdit}
                        onChange={(event) =>
                          onChange((previous) => ({
                            ...previous,
                            epfWageCeiling: Math.max(0, Number(event.target.value)),
                          }))
                        }
                        inputProps={{ min: 0 }}
                        sx={inputSx}
                      />
                    )}

                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: "8px",
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                        border: "1px dashed",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontSize: "0.74rem", lineHeight: 1.45 }}
                      >
                        Confirm eligibility, contribution basis, and ceiling with your payroll adviser.
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}

              {esicEnabled && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2} sx={modernConfigCardSx}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        pb: 1,
                        borderBottom: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9",
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: isDark ? "rgba(5, 150, 105, 0.18)" : "rgba(5, 150, 105, 0.09)",
                            color: "#059669",
                          }}
                        >
                          <ShieldOutlined sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={750} sx={{ fontSize: "0.925rem" }}>
                          State Insurance
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        label="Statutory"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          borderRadius: "5px",
                          bgcolor: isDark ? "rgba(5, 150, 105, 0.2)" : "rgba(5, 150, 105, 0.1)",
                          color: "#059669",
                        }}
                      />
                    </Stack>

                    <Grid container spacing={1.5}>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Employee contribution (%)"
                          value={config.esicEmployeeRatePercent}
                          disabled={!canEdit}
                          onChange={(event) =>
                            onChange((previous) => ({
                              ...previous,
                              esicEmployeeRatePercent: Math.min(100, Math.max(0, Number(event.target.value))),
                            }))
                          }
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                          sx={inputSx}
                        />
                      </Grid>
                      <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                          fullWidth
                          size="small"
                          type="number"
                          label="Employer contribution (%)"
                          value={config.esicEmployerRatePercent}
                          disabled={!canEdit}
                          onChange={(event) =>
                            onChange((previous) => ({
                              ...previous,
                              esicEmployerRatePercent: Math.min(100, Math.max(0, Number(event.target.value))),
                            }))
                          }
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                          sx={inputSx}
                        />
                      </Grid>
                    </Grid>

                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="ESIC wage ceiling (₹)"
                      value={config.esicWageCeiling}
                      disabled={!canEdit}
                      onChange={(event) =>
                        onChange((previous) => ({
                          ...previous,
                          esicWageCeiling: Math.max(0, Number(event.target.value)),
                        }))
                      }
                      inputProps={{ min: 0 }}
                      sx={inputSx}
                    />

                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: "8px",
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                        border: "1px dashed",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontSize: "0.74rem", lineHeight: 1.45 }}
                      >
                        The approved profile controls the contribution for eligible employees.
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}

              {tdsEnabled && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2} sx={modernConfigCardSx}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        pb: 1,
                        borderBottom: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9",
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: isDark ? "rgba(217, 119, 6, 0.18)" : "rgba(217, 119, 6, 0.09)",
                            color: "#D97706",
                          }}
                        >
                          <ReceiptLongOutlined sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={750} sx={{ fontSize: "0.925rem" }}>
                          Income tax withholding
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        label="Statutory"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          borderRadius: "5px",
                          bgcolor: isDark ? "rgba(217, 119, 6, 0.2)" : "rgba(217, 119, 6, 0.1)",
                          color: "#D97706",
                        }}
                      />
                    </Stack>

                    <TextField
                      select
                      fullWidth
                      size="small"
                      label="Tax regime"
                      value={config.tdsMode}
                      disabled={!canEdit}
                      onChange={(event) =>
                        onChange((previous) => ({
                          ...previous,
                          tdsMode: event.target.value as PayrollDivisorPolicyConfig["tdsMode"],
                        }))
                      }
                      sx={inputSx}
                    >
                      <MenuItem value="AUTO_NEW_REGIME">New tax regime</MenuItem>
                      <MenuItem value="AUTO_OLD_REGIME">Old tax regime</MenuItem>
                    </TextField>

                    <Box
                      sx={{
                        p: 1.25,
                        borderRadius: "8px",
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                        border: "1px dashed",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                      }}
                    >
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: "block", fontSize: "0.74rem", lineHeight: 1.45 }}
                      >
                        A tax reviewer must confirm the financial year and rule version before approval.
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              )}

              {config.requireAttendanceLock && (
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={2} sx={modernConfigCardSx}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{
                        pb: 1,
                        borderBottom: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9",
                      }}
                    >
                      <Stack direction="row" spacing={1.25} alignItems="center">
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            borderRadius: "8px",
                            display: "grid",
                            placeItems: "center",
                            bgcolor: isDark ? "rgba(124, 58, 237, 0.18)" : "rgba(124, 58, 237, 0.09)",
                            color: "#7C3AED",
                          }}
                        >
                          <FactCheckOutlined sx={{ fontSize: 18 }} />
                        </Box>
                        <Typography variant="subtitle1" fontWeight={750} sx={{ fontSize: "0.925rem" }}>
                          Attendance readiness gate
                        </Typography>
                      </Stack>
                      <Chip
                        size="small"
                        label="Payroll gate"
                        sx={{
                          height: 20,
                          fontSize: "0.68rem",
                          fontWeight: 700,
                          borderRadius: "5px",
                          bgcolor: isDark ? "rgba(124, 58, 237, 0.2)" : "rgba(124, 58, 237, 0.1)",
                          color: "#7C3AED",
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontSize: "0.85rem", lineHeight: 1.55 }}
                    >
                      Payroll waits until monthly timesheets and leave inputs are frozen. Exceptions must be resolved before salary calculation.
                    </Typography>

                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: "8px",
                        bgcolor: isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC",
                        border: "1px solid",
                        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleRounded sx={{ fontSize: 16, color: "#10B981" }} />
                          <Typography variant="caption" sx={{ fontWeight: 650, fontSize: "0.76rem" }}>
                            Timesheet lock enforced before draft run
                          </Typography>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CheckCircleRounded sx={{ fontSize: 16, color: "#10B981" }} />
                          <Typography variant="caption" sx={{ fontWeight: 650, fontSize: "0.76rem" }}>
                            Approved leave balances reconciled with LOP
                          </Typography>
                        </Stack>
                      </Stack>
                    </Box>
                  </Stack>
                </Grid>
              )}
            </Grid>
          </Box>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Box
            sx={{
              borderRadius: "12px",
              border: "1px solid",
              borderColor: isDark ? "rgba(11, 92, 171, 0.3)" : "rgba(11, 92, 171, 0.18)",
              bgcolor: isDark ? "rgba(11, 92, 171, 0.12)" : "rgba(11, 92, 171, 0.04)",
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              p: { xs: 1.25, sm: 1.5 },
            }}
          >
            <Box sx={{ color: "primary.main", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <FactCheckOutlined sx={{ fontSize: 18 }} />
            </Box>
            <Typography
              variant="caption"
              sx={{ fontSize: "0.78rem", color: "text.primary", lineHeight: 1.45, fontWeight: 500 }}
            >
              Statutory rules apply after approval. Selected components take effect via employee salary structures.
            </Typography>
          </Box>
        </Grid>
      </Grid>

      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderRadius: "14px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
          bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "#F8FAFC",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", lg: "center" }}
          spacing={{ xs: 1.5, lg: 2 }}
        >
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography
              variant="subtitle2"
              fontWeight={750}
              sx={{ fontSize: "0.9rem", letterSpacing: "-0.01em", mb: 0.25 }}
            >
              Optional payroll setup
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem", lineHeight: 1.45, display: "block" }}>
              Configure pay groups, reusable salary templates, and custom components.
            </Typography>
          </Box>
          <Stack
            direction="row"
            spacing={1}
            useFlexGap
            flexWrap="wrap"
            sx={{
              width: { xs: "100%", lg: "auto" },
              justifyContent: { xs: "flex-start", sm: "flex-start", lg: "flex-end" },
            }}
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<GroupsOutlined sx={{ fontSize: 16 }} />}
              onClick={onOpenGroups}
              sx={{
                height: 32,
                px: 1.5,
                borderRadius: "8px",
                fontWeight: 650,
                fontSize: "0.78rem",
                textTransform: "none",
                bgcolor: "background.paper",
                borderColor: isDark ? "rgba(255,255,255,0.14)" : "#CBD5E1",
                flex: { xs: "1 1 auto", sm: "none" },
                transition: "all 0.18s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  transform: "translateY(-1px)",
                },
              }}
            >
              Pay groups
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<ReceiptLongOutlined sx={{ fontSize: 16 }} />}
              onClick={onOpenTemplates}
              sx={{
                height: 32,
                px: 1.5,
                borderRadius: "8px",
                fontWeight: 650,
                fontSize: "0.78rem",
                textTransform: "none",
                bgcolor: "background.paper",
                borderColor: isDark ? "rgba(255,255,255,0.14)" : "#CBD5E1",
                flex: { xs: "1 1 auto", sm: "none" },
                transition: "all 0.18s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  transform: "translateY(-1px)",
                },
              }}
            >
              Salary templates
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<PaymentsOutlined sx={{ fontSize: 16 }} />}
              onClick={onOpenComponents}
              sx={{
                height: 32,
                px: 1.5,
                borderRadius: "8px",
                fontWeight: 650,
                fontSize: "0.78rem",
                textTransform: "none",
                bgcolor: "background.paper",
                borderColor: isDark ? "rgba(255,255,255,0.14)" : "#CBD5E1",
                flex: { xs: "1 1 auto", sm: "none" },
                transition: "all 0.18s ease",
                "&:hover": {
                  borderColor: "primary.main",
                  bgcolor: alpha(theme.palette.primary.main, 0.06),
                  transform: "translateY(-1px)",
                },
              }}
            >
              Bonus and components
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
}
