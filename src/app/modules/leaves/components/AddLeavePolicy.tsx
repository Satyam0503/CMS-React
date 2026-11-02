import { useAppSelector } from "../../../Redux/hooks";
import {
  Grid,
  Box,
  Autocomplete,
  Stack,
  MenuItem,
  FormControl,
  FormHelperText,
  InputLabel,
  Chip,
  CircularProgress,
  Typography,
  InputAdornment,
  Tabs,
  Tab,
  Badge,
  RadioGroup,
  Radio,
  FormControlLabel,
  Button,
  useTheme,
  useMediaQuery,
  alpha,
} from "@mui/material";
import { Formik, FormikErrors } from "formik";
import { useEffect, useState, useMemo } from "react";
import { getCustomStatusCodesErrorMessage } from "../../../../utils/common";
import { LeavePolicyValidationSchema } from "../../../../utils/Schema/leaveManagementValidationSchemas";
import CustomisedButton from "../../../shared/components/C_Button";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import { useIntl } from "react-intl";
import { LeavePolicyModel } from "../model";
import { getAllEmployees } from "../../employees/employeeServices";
import { GetAllEmployeeResponseModel } from "../../employees/models";
import { toast } from "react-toastify";
import { createLeavePolicy, updateLeavePolicy } from "../leaveServices";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AccessTimeRoundedIcon from "@mui/icons-material/AccessTimeRounded";
import TuneRoundedIcon from "@mui/icons-material/TuneRounded";
import PeopleRoundedIcon from "@mui/icons-material/PeopleRounded";
import WorkOutlineRoundedIcon from "@mui/icons-material/WorkOutlineRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { TextInput } from "../../../shared/components/form-component/TextInput";
import { AppAlert, AppCheckbox, AppSelect, AppTextField } from "../../../shared/components/ui";
import { getRequest } from "../../../../server/axios";
import { ResponseData } from "../../../../utils/common_types";

type AttendanceStatusOption = {
  code: string;
  name: string;
  isActive: boolean;
  requiresTime: boolean;
  isAvailableForLeaveManagement: boolean;
  colorHex: string;
};

type Props = {
  open: boolean;
  handleClose: () => void;
  isEdit: boolean;
  initialValues: LeavePolicyModel | undefined;
  handleRefresh: () => void;
};

// Sleek interactive weekday chip selector
const ALL_WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const WEEKDAY_SHORT: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

interface WeekdayChipSelectorProps {
  label: string;
  selectedDays: string[];
  onChange: (days: string[]) => void;
  helperText?: string;
  activeColor?: "primary" | "error" | "secondary";
  showPresets?: boolean;
}

const WeekdayChipSelector = ({
  label,
  selectedDays,
  onChange,
  helperText,
  activeColor = "primary",
  showPresets = true,
}: WeekdayChipSelectorProps) => {
  const theme = useTheme();
  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      onChange(selectedDays.filter((d) => d !== day));
    } else {
      onChange([...selectedDays, day]);
    }
  };

  const selectWorkdays = () => onChange(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const selectAll = () => onChange([...ALL_WEEKDAYS]);
  const clearAll = () => onChange([]);

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2 },
        borderRadius: "12px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
          {label}
        </Typography>
        {showPresets && (
          <Stack direction="row" spacing={0.75} flexWrap="wrap">
            <Button
              size="small"
              variant="text"
              onClick={selectWorkdays}
              sx={{ fontSize: "0.72rem", py: 0.25, px: 0.75, minWidth: "auto", textTransform: "none" }}
            >
              Mon–Fri
            </Button>
            <Button
              size="small"
              variant="text"
              onClick={selectAll}
              sx={{ fontSize: "0.72rem", py: 0.25, px: 0.75, minWidth: "auto", textTransform: "none" }}
            >
              All Days
            </Button>
            <Button
              size="small"
              variant="text"
              color="inherit"
              onClick={clearAll}
              sx={{ fontSize: "0.72rem", py: 0.25, px: 0.75, minWidth: "auto", textTransform: "none", color: "text.secondary" }}
            >
              Clear
            </Button>
          </Stack>
        )}
      </Box>

      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {ALL_WEEKDAYS.map((day) => {
          const isSelected = selectedDays.includes(day);
          return (
            <Chip
              key={day}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <span>{WEEKDAY_SHORT[day]}</span>
                  <Typography component="span" sx={{ display: { xs: "none", sm: "inline" }, fontSize: "inherit" }}>
                    {day.slice(3)}
                  </Typography>
                </Box>
              }
              clickable
              onClick={() => toggleDay(day)}
              variant={isSelected ? "filled" : "outlined"}
              color={isSelected ? activeColor : "default"}
              sx={{
                fontWeight: isSelected ? 700 : 500,
                fontSize: "0.8rem",
                px: 0.5,
                borderRadius: "8px",
                transition: "all 0.15s ease",
                ...(isSelected
                  ? {
                      boxShadow: `0 2px 8px ${alpha(theme.palette[activeColor]?.main || theme.palette.primary.main, 0.25)}`,
                    }
                  : {
                      bgcolor: "background.paper",
                      borderColor: "divider",
                      "&:hover": { bgcolor: "action.hover" },
                    }),
              }}
            />
          );
        })}
      </Box>
      {helperText && (
        <Typography variant="caption" sx={{ color: "text.secondary", display: "block", mt: 1 }}>
          {helperText}
        </Typography>
      )}
    </Box>
  );
};

// Section / Group card container
const PolicyCardSection = ({
  title,
  subtitle,
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) => (
  <Box
    sx={{
      p: { xs: 2, sm: 2.5 },
      borderRadius: "14px",
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
      display: "flex",
      flexDirection: "column",
      gap: 2,
    }}
  >
    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
      <Box>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {badge}
    </Box>
    {children}
  </Box>
);

export default function AddLeavePolicy(props: Props) {
  const { formatMessage: i } = useIntl();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const modulePermissions = useAppSelector((state) => state.user.userData?.modulePermission) ?? [];
  const hasWfhAccess = modulePermissions.some((p) => p.startsWith("Work_From_Home."));
  const [employeeList, setEmployeeList] = useState<Array<GetAllEmployeeResponseModel>>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [leaveStatuses, setLeaveStatuses] = useState<AttendanceStatusOption[]>([]);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([0, 6]);
  const [activeTab, setActiveTab] = useState(0);

  // Determine initial scope from props
  const [scope, setScope] = useState<"all" | "custom" | "none">(() => {
    const app = props.initialValues?.applicableTo;
    if (!app || app.includes("allEmployees") || (Array.isArray(app) && app.length === 0)) return "all";
    if (app.includes("noEmployee")) return "none";
    return "custom";
  });

  const empOptions: Array<GetAllEmployeeResponseModel> = useMemo(
    () => [
      {
        userId: "allEmployees",
        fullName: "All Employees",
        email: "",
        gender: "",
        employeeId: "",
        jobRole: null,
        department: null,
        phoneNumber: null,
        fullProfileUrl: null,
        dateOfBirth: null,
        isVerified: false,
      },
      {
        userId: "noEmployee",
        fullName: "None (Unassigned)",
        email: "",
        gender: "",
        employeeId: "",
        jobRole: null,
        department: null,
        phoneNumber: null,
        fullProfileUrl: null,
        dateOfBirth: null,
        isVerified: false,
      },
    ],
    []
  );

  useEffect(() => {
    // Load attendance statuses
    getRequest<ResponseData<AttendanceStatusOption>>("api/attendance-status-settings?activeOnly=true")
      .then(({ data }) => setLeaveStatuses(data.methodResults ?? []))
      .catch(() => toast.error("Unable to load leave attendance status codes."));

    // Load weekly offs
    getRequest<{ offDays: number[] }>("api/attendance/weekly-offs")
      .then(({ data }) => {
        if (data && Array.isArray(data.offDays)) setWeeklyOffDays(data.offDays);
      })
      .catch(() => setWeeklyOffDays([0, 6]));

    // Load all employees immediately so existing employee selections render properly
    setLoadingEmployees(true);
    getAllEmployees()
      .then(({ data }) => {
        if (data?.success) {
          setEmployeeList(empOptions.concat(data.methodResults || []));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingEmployees(false));
  }, [empOptions]);

  const handleCreateNewPolicy = async (
    values: LeavePolicyModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      const { data } = await createLeavePolicy(values);
      if (data.success) {
        toast.success(
          i({
            id: props.isEdit ? "TOAST.SUCCESS.UPDATE" : "TOAST.SUCCESS.CREATED",
          })
        );
        props.handleClose();
        props.handleRefresh();
      } else {
        toast.error(i({ id: getCustomStatusCodesErrorMessage(data.statusCode) }));
      }
    } catch (error) {
      toast.error(i({ id: "ERROR.SOMETHING_WRONG" }));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateLeavePolicy = async (
    values: LeavePolicyModel,
    setSubmitting: (isSubmitting: boolean) => void
  ) => {
    try {
      const { data } = await updateLeavePolicy(values);
      if (data.success) {
        toast.success(i({ id: props.isEdit ? "TOAST.SUCCESS.UPDATE" : "TOAST.SUCCESS.CREATED" }));
        props.handleClose();
        props.handleRefresh();
      } else {
        toast.error(data.message || i({ id: getCustomStatusCodesErrorMessage(data.statusCode) }));
      }
    } catch (error) {
      const message = (error as Error).message;
      toast.error(message && !/^\d+$/.test(message) ? message : i({ id: "ERROR.SOMETHING_WRONG" }));
    } finally {
      setSubmitting(false);
    }
  };

  // Define tabs dynamically based on policyType
  const getTabsForPolicyType = (policyType: 1 | 2 | 3) => {
    if (policyType === 2) {
      return [
        { id: "basic", label: "Basic Details", icon: <InfoOutlinedIcon fontSize="small" /> },
        { id: "schedule", label: "Schedule & Limits", icon: <CalendarMonthRoundedIcon fontSize="small" /> },
        { id: "cutoff", label: "Cutoff & Overrides", icon: <AccessTimeRoundedIcon fontSize="small" /> },
        { id: "halfday", label: "Half-Day & Combos", icon: <TuneRoundedIcon fontSize="small" /> },
        { id: "eligibility", label: "Eligible Employees", icon: <PeopleRoundedIcon fontSize="small" /> },
      ];
    }
    if (policyType === 3) {
      return [
        { id: "basic", label: "Basic Details", icon: <InfoOutlinedIcon fontSize="small" /> },
        { id: "eligibility", label: "Eligible Employees", icon: <PeopleRoundedIcon fontSize="small" /> },
      ];
    }
    return [
      { id: "basic", label: "Basic Details", icon: <InfoOutlinedIcon fontSize="small" /> },
      { id: "accrual", label: "Accrual & Balance", icon: <CalendarMonthRoundedIcon fontSize="small" /> },
      { id: "lifecycle", label: "Special Cases", icon: <WorkOutlineRoundedIcon fontSize="small" /> },
      { id: "eligibility", label: "Eligible Employees", icon: <PeopleRoundedIcon fontSize="small" /> },
    ];
  };

  // Map validation errors to tab IDs
  const getTabErrorMap = (errors: FormikErrors<LeavePolicyModel>, policyType: 1 | 2 | 3) => {
    const errorMap: Record<string, boolean> = {};

    if (errors.name || errors.code || errors.policyType || errors.status) {
      errorMap["basic"] = true;
    }

    if (policyType === 1) {
      if (errors.attendanceStatusCode || errors.fullDayAttendanceStatusCode || errors.halfDayAttendanceStatusCode) {
        errorMap["basic"] = true;
      }
      if (
        errors.accrualPeriod ||
        errors.accrualAmount ||
        errors.maxBalance ||
        errors.carryOverLimit ||
        errors.minNoticeDays
      ) {
        errorMap["accrual"] = true;
      }
      if (errors.lifecycle) {
        errorMap["lifecycle"] = true;
      }
    } else if (policyType === 2) {
      const wfhErrors = errors.workFromHome as Record<string, any> | undefined;
      if (wfhErrors?.fullDayAttendanceStatusCode) {
        errorMap["basic"] = true;
      }
      if (
        wfhErrors?.maxDaysPerWeek ||
        wfhErrors?.fullDayRequiredWorkingMinutes ||
        wfhErrors?.breakMinutes
      ) {
        errorMap["schedule"] = true;
      }
      if (wfhErrors?.sameDayCutoffTime || wfhErrors?.sameDayGraceMinutes) {
        errorMap["cutoff"] = true;
      }
      if (
        wfhErrors?.halfDayAttendanceStatusCode ||
        wfhErrors?.wfhWfoAttendanceStatusCode ||
        wfhErrors?.wfhHdAttendanceStatusCode
      ) {
        errorMap["halfday"] = true;
      }
    } else if (policyType === 3) {
      if (errors.attendanceStatusCode || errors.fullDayAttendanceStatusCode) {
        errorMap["basic"] = true;
      }
    }

    if (errors.applicableTo) {
      errorMap["eligibility"] = true;
    }

    return errorMap;
  };

  return (
    <CustomisedModal
      open={props.open}
      handleClose={props.handleClose}
      title={
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
            {props.isEdit
              ? props.initialValues?.name
                ? `Edit Policy: ${props.initialValues.name}`
                : i({ id: "LEAVE.TITLES.LEAVE_POLICY" })
              : i({ id: "LEAVE.TITLES.ADD_LEAVE_POLICIES" })}
          </Typography>
        </Box>
      }
      maxWidth="lg"
      allowMaximize
      paperSx={{
        width: { xs: "calc(100% - 20px)", sm: "calc(100% - 40px)", md: "960px", lg: "1040px" },
        maxWidth: "1040px",
        height: { xs: "94vh", sm: "88vh" },
        maxHeight: "860px",
        display: "flex",
        flexDirection: "column",
        borderRadius: "16px",
        overflow: "hidden",
        m: { xs: 1, sm: 2.5 },
      }}
      contentSx={{
        p: 0,
        display: "flex",
        flexDirection: "column",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {props.initialValues && (
        <Formik
          validationSchema={LeavePolicyValidationSchema}
          initialValues={{
            ...props.initialValues,
            accrualAmount: !props.isEdit && props.initialValues.policyType === 1 && props.initialValues.accrualAmount === 0 ? 1 : props.initialValues.accrualAmount,
            maxBalance: !props.isEdit && props.initialValues.policyType === 1 && props.initialValues.maxBalance === 0 ? 12 : props.initialValues.maxBalance,
          }}
          onSubmit={(values, { setSubmitting, setStatus }) => {
            const halfDayWfhEnabled =
              values.policyType === 2 &&
              Boolean(values.workFromHome?.allowFirstHalf || values.workFromHome?.allowSecondHalf);
            if (halfDayWfhEnabled && !values.workFromHome?.halfDayAttendanceStatusCode?.trim()) {
              setStatus("Select an attendance status for Half-day WFH.");
              setSubmitting(false);
              const currentTabs = getTabsForPolicyType(values.policyType);
              const halfDayTabIndex = currentTabs.findIndex((t) => t.id === "halfday");
              if (halfDayTabIndex !== -1) setActiveTab(halfDayTabIndex);
              toast.error("Select an attendance status for Half-day WFH.");
              return;
            }

            // Normalise applicableTo based on scope selection
            let applicableTo = values.applicableTo ?? [];
            if (scope === "all") {
              applicableTo = [];
            } else if (scope === "none") {
              applicableTo = null as any;
            } else {
              applicableTo = applicableTo.filter((id) => id !== "allEmployees" && id !== "noEmployee");
            }

            const attendanceCode =
              values.policyType === 2
                ? values.workFromHome?.fullDayAttendanceStatusCode?.trim().toUpperCase() ||
                  values.attendanceStatusCode?.trim().toUpperCase() ||
                  null
                : values.attendanceStatusCode?.trim().toUpperCase() ||
                  values.fullDayAttendanceStatusCode?.trim().toUpperCase() ||
                  null;

            const policy: LeavePolicyModel = {
              ...values,
              attendanceStatusCode: attendanceCode,
              fullDayAttendanceStatusCode: attendanceCode,
              halfDayAttendanceStatusCode:
                values.policyType === 2
                  ? values.workFromHome?.halfDayAttendanceStatusCode?.trim().toUpperCase() || null
                  : values.halfDayAllowed
                  ? values.halfDayAttendanceStatusCode?.trim().toUpperCase() || null
                  : null,
              ...(values.lifecycle?.enabled
                ? {
                    accrualPeriod: 3,
                    accrualAmount: 0,
                    maxBalance: 0,
                    carryOverAllowed: false,
                    carryOverLimit: 0,
                  }
                : values.policyType === 2
                ? {
                    accrualAmount: 1,
                    maxBalance: 0,
                    carryOverAllowed: false,
                    carryOverLimit: 0,
                    paid: true,
                    minNoticeDays: 0,
                    halfDayAllowed: Boolean(
                      values.workFromHome?.allowFirstHalf || values.workFromHome?.allowSecondHalf
                    ),
                  }
                : values.policyType === 3
                ? {
                    accrualPeriod: 3,
                    accrualAmount: 0,
                    maxBalance: 0,
                    carryOverAllowed: false,
                    carryOverLimit: 0,
                    paid: false,
                  }
                : {}),
              workFromHome: values.workFromHome
                ? {
                    ...values.workFromHome,
                    fullDayAttendanceStatusCode:
                      values.workFromHome.fullDayAttendanceStatusCode?.trim().toUpperCase() ||
                      attendanceCode ||
                      "",
                    halfDayAttendanceStatusCode:
                      values.workFromHome.halfDayAttendanceStatusCode?.trim().toUpperCase() || "",
                    mixedAttendanceStatusCode:
                      values.workFromHome.mixedAttendanceStatusCode?.trim().toUpperCase() || null,
                    wfhWfoAttendanceStatusCode:
                      values.workFromHome.wfhWfoAttendanceStatusCode?.trim().toUpperCase() || null,
                    wfhHdAttendanceStatusCode:
                      values.workFromHome.wfhHdAttendanceStatusCode?.trim().toUpperCase() || null,
                  }
                : undefined,
              applicableTo,
            };

            if (!props.isEdit) {
              handleCreateNewPolicy(policy, setSubmitting);
            } else {
              handleUpdateLeavePolicy(policy, setSubmitting);
            }
          }}
        >
          {({ values, errors, touched, setFieldValue, handleSubmit, isSubmitting, status }) => {
            const tabs = getTabsForPolicyType(values.policyType);
            const tabErrorMap = getTabErrorMap(errors, values.policyType);

            // Safe tab index clamping
            const safeActiveTab = Math.min(activeTab, tabs.length - 1);

            return (
              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}
              >
                {/* Modal Top Subheader / Policy Type Indicator */}
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 1.25,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.default, 0.6),
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip
                      size="small"
                      label={
                        values.policyType === 2
                          ? "Work From Home"
                          : values.policyType === 3
                          ? "Unpaid Leave (UL)"
                          : "Standard Leave"
                      }
                      color={values.policyType === 2 ? "secondary" : values.policyType === 3 ? "warning" : "primary"}
                      sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                    />
                    <Chip
                      size="small"
                      label={values.status ? "Policy Active" : "Policy Inactive"}
                      color={values.status ? "success" : "default"}
                      variant="outlined"
                      sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                    />
                    {values.policyType === 1 && values.paid && (
                      <Chip
                        size="small"
                        label="Paid Leave"
                        color="info"
                        variant="outlined"
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      />
                    )}
                  </Stack>
                  <Typography variant="caption" sx={{ color: "text.secondary", display: { xs: "none", md: "block" } }}>
                    Configure entitlements, constraints, and eligibility rules
                  </Typography>
                </Box>

                {/* Responsive Full-Width Edge-to-Edge Tab Navigation Bar */}
                <Box
                  sx={{
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    position: "sticky",
                    top: 0,
                    zIndex: 2,
                    width: "100%",
                  }}
                >
                  <Tabs
                    value={safeActiveTab}
                    onChange={(_, newIndex) => setActiveTab(newIndex)}
                    variant={isMobile ? "scrollable" : "fullWidth"}
                    scrollButtons={isMobile ? "auto" : false}
                    allowScrollButtonsMobile
                    aria-label="Leave Policy Sections"
                    sx={{
                      minHeight: 50,
                      width: "100%",
                      "& .MuiTabs-scroller": {
                        width: "100%",
                      },
                      "& .MuiTabs-flexContainer": {
                        width: "100%",
                        display: "flex",
                      },
                      "& .MuiTab-root": {
                        flex: { xs: "0 0 auto", sm: 1 },
                        maxWidth: "none",
                        minWidth: { xs: 120, sm: 0 },
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: { xs: "0.8rem", sm: "0.875rem" },
                        minHeight: 50,
                        py: 1.25,
                        px: { xs: 1, sm: 2 },
                        gap: 0.75,
                        transition: "all 0.15s ease",
                        "&.Mui-selected": {
                          fontWeight: 700,
                          color: "primary.main",
                        },
                      },
                      "& .MuiTabs-indicator": {
                        height: 3,
                        borderRadius: "3px 3px 0 0",
                      },
                    }}
                  >
                    {tabs.map((tab, idx) => {
                      const hasError = tabErrorMap[tab.id];
                      return (
                        <Tab
                          key={tab.id}
                          label={
                            <Badge
                              color="error"
                              variant="dot"
                              invisible={!hasError}
                              sx={{ "& .MuiBadge-badge": { right: -6, top: 4 } }}
                            >
                              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                {tab.icon}
                                <span>{tab.label}</span>
                              </Box>
                            </Badge>
                          }
                          id={`policy-tab-${idx}`}
                        />
                      );
                    })}
                  </Tabs>
                </Box>

                {/* Form Status Alert (if any) */}
                {Boolean(status) && (
                  <Box sx={{ px: { xs: 2, sm: 3 }, pt: 2 }}>
                    <AppAlert severity="warning">{status}</AppAlert>
                  </Box>
                )}

                {/* Tab Panel Content: Scrollable Body */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: { xs: 2, sm: 3 },
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                  }}
                >
                  {/* ============================================================== */}
                  {/* TAB: BASIC DETAILS (For All Policy Types)                      */}
                  {/* ============================================================== */}
                  {tabs[safeActiveTab]?.id === "basic" && (
                    <Stack spacing={2.5}>
                      <PolicyCardSection
                        title="Basic Information"
                        subtitle="Define the core identification and classification for this policy."
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextInput
                              label="Leave Name"
                              name="name"
                              type="text"
                              placeholder="e.g. Casual Leave, Sick Leave"
                              showErrorLabel={true}
                              required
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextInput
                              label="Short Code"
                              name="code"
                              type="text"
                              placeholder="e.g. CL, SL, WFH"
                              showErrorLabel={true}
                              required
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                              select
                              fullWidth
                              label="Policy Type"
                              value={values.policyType}
                              disabled={props.isEdit}
                              helperText={props.isEdit ? "Policy type is fixed after creation." : undefined}
                              onChange={(e) => {
                                const policyType = Number(e.target.value) as 1 | 2 | 3;
                                setFieldValue("policyType", policyType);
                                if (policyType === 2 && !values.workFromHome) {
                                  setFieldValue("workFromHome", {
                                    approvalRequired: true,
                                    approverStrategy: "REPORTING_MANAGER",
                                    reasonRequired: true,
                                    allowFullDay: true,
                                    allowFirstHalf: false,
                                    allowSecondHalf: false,
                                    allowMixedHalfDayLeave: false,
                                    allowOnWeeklyOff: false,
                                    allowOnHoliday: false,
                                    fullDayAttendanceStatusCode: values.attendanceStatusCode || "",
                                    halfDayAttendanceStatusCode: "",
                                    mixedAttendanceStatusCode: "",
                                    useEffectiveOfficeSchedule: true,
                                    breakMinutes: 0,
                                    maxDaysPerWeek: 1,
                                    maxDaysPerMonth: null,
                                    fullDayRequiredWorkingMinutes: null,
                                    halfDayRequiredWorkingMinutes: null,
                                    sameDayCutoffTime: "",
                                    sameDayGraceMinutes: 0,
                                    allowLateApplicationWithApproval: true,
                                    allowedDaysOfWeek: [],
                                    blockedDaysOfWeek: [],
                                  });
                                }
                              }}
                            >
                              <MenuItem value={1}>Standard Leave</MenuItem>
                              {hasWfhAccess && <MenuItem value={2}>Work From Home (WFH)</MenuItem>}
                              <MenuItem value={3}>Unpaid Leave (UL)</MenuItem>
                            </AppTextField>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                              select
                              fullWidth
                              label="Policy Status"
                              value={values.status ? 1 : 0}
                              onChange={(e) => setFieldValue("status", Number(e.target.value) === 1)}
                              helperText="Active policies can be selected by employees when applying."
                            >
                              <MenuItem value={1}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "success.main" }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Active</Typography>
                                </Box>
                              </MenuItem>
                              <MenuItem value={0}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                  <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: "text.disabled" }} />
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>Inactive</Typography>
                                </Box>
                              </MenuItem>
                            </AppTextField>
                          </Grid>

                          <Grid size={12}>
                            <TextInput
                              multiline
                              minRows={2}
                              maxRows={3}
                              label="Description"
                              name="description"
                              type="text"
                              placeholder="Provide instructions or background for when employees should use this policy..."
                              showErrorLabel={false}
                            />
                          </Grid>
                        </Grid>
                      </PolicyCardSection>

                      {/* Attendance Mapping Section */}
                      <PolicyCardSection
                        title="Attendance Status Mapping"
                        subtitle="Designate which official attendance status codes are recorded when this request is approved."
                      >
                        <Grid container spacing={2}>
                          {values.policyType !== 2 ? (
                            <>
                              <Grid size={{ xs: 12, sm: values.halfDayAllowed ? 6 : 12 }}>
                                <AppTextField
                                  select
                                  fullWidth
                                  label="Full-Day Attendance Status"
                                  value={values.fullDayAttendanceStatusCode ?? values.attendanceStatusCode ?? ""}
                                  onChange={(e) => {
                                    setFieldValue("fullDayAttendanceStatusCode", e.target.value);
                                    setFieldValue("attendanceStatusCode", e.target.value);
                                  }}
                                  helperText="Applied when a full day of this leave is approved."
                                >
                                  <MenuItem value="">
                                    <em>Select attendance status</em>
                                  </MenuItem>
                                  {leaveStatuses
                                    .filter((s) => s.isAvailableForLeaveManagement && !s.requiresTime)
                                    .map((status) => (
                                      <MenuItem key={status.code} value={status.code} sx={{ py: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <Box
                                            sx={{
                                              width: 10,
                                              height: 10,
                                              borderRadius: "50%",
                                              bgcolor: status.colorHex || "#94a3b8",
                                            }}
                                          />
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {status.code}
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            — {status.name}
                                          </Typography>
                                        </Box>
                                      </MenuItem>
                                    ))}
                                </AppTextField>
                              </Grid>

                              {values.halfDayAllowed && (
                                <Grid size={{ xs: 12, sm: 6 }}>
                                  <AppTextField
                                    select
                                    fullWidth
                                    label="Half-Day Attendance Status"
                                    value={values.halfDayAttendanceStatusCode ?? ""}
                                    onChange={(e) => setFieldValue("halfDayAttendanceStatusCode", e.target.value)}
                                    helperText="Applied to the leave segment when half-day leave is approved."
                                  >
                                    <MenuItem value="">
                                      <em>Select attendance status</em>
                                    </MenuItem>
                                    {leaveStatuses
                                      .filter((s) => s.isAvailableForLeaveManagement && !s.requiresTime)
                                      .map((status) => (
                                        <MenuItem key={status.code} value={status.code} sx={{ py: 1 }}>
                                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                            <Box
                                              sx={{
                                                width: 10,
                                                height: 10,
                                                borderRadius: "50%",
                                                bgcolor: status.colorHex || "#94a3b8",
                                              }}
                                            />
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                              {status.code}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                              — {status.name}
                                            </Typography>
                                          </Box>
                                        </MenuItem>
                                      ))}
                                  </AppTextField>
                                </Grid>
                              )}
                            </>
                          ) : (
                            /* WFH Attendance Status */
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <AppTextField
                                select
                                fullWidth
                                required
                                label="Full-Day WFH Attendance Status"
                                value={values.workFromHome?.fullDayAttendanceStatusCode ?? ""}
                                onChange={(e) => {
                                  setFieldValue("workFromHome.fullDayAttendanceStatusCode", e.target.value);
                                  setFieldValue("fullDayAttendanceStatusCode", e.target.value);
                                  setFieldValue("attendanceStatusCode", e.target.value);
                                }}
                                helperText="Applied to the attendance record for approved full-day WFH."
                              >
                                <MenuItem value="">
                                  <em>Select attendance status</em>
                                </MenuItem>
                                {leaveStatuses
                                  .filter((x) => x.requiresTime)
                                  .map((x) => (
                                    <MenuItem key={x.code} value={x.code} sx={{ py: 1 }}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                          sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            bgcolor: x.colorHex || "#94a3b8",
                                          }}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {x.code}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                          — {x.name}
                                        </Typography>
                                      </Box>
                                    </MenuItem>
                                  ))}
                              </AppTextField>
                            </Grid>
                          )}
                        </Grid>
                      </PolicyCardSection>

                      {/* For Standard Leave: Quick settings select fields */}
                      {values.policyType === 1 && (
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                              select
                              fullWidth
                              label="Pay Treatment"
                              value={values.paid ? 1 : 0}
                              onChange={(e) => setFieldValue("paid", Number(e.target.value) === 1)}
                              helperText="Employees receive regular salary during this leave."
                            >
                              <MenuItem value={1}>Paid Leave</MenuItem>
                              <MenuItem value={0}>Unpaid Leave</MenuItem>
                            </AppTextField>
                          </Grid>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                              select
                              fullWidth
                              label="Half-Day Requests"
                              value={values.halfDayAllowed ? 1 : 0}
                              onChange={(e) => setFieldValue("halfDayAllowed", Number(e.target.value) === 1)}
                              helperText="Allow employees to apply for half-day increments."
                            >
                              <MenuItem value={1}>Allowed</MenuItem>
                              <MenuItem value={0}>Disallowed (Full-day only)</MenuItem>
                            </AppTextField>
                          </Grid>
                        </Grid>
                      )}

                      {/* For WFH: Quick approval setting */}
                      {values.policyType === 2 && values.workFromHome && (
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                              select
                              fullWidth
                              label="Manager Approval"
                              value={values.workFromHome.approvalRequired ? 1 : 0}
                              onChange={(e) => setFieldValue("workFromHome.approvalRequired", Number(e.target.value) === 1)}
                              helperText="Submitted requests require manager sign-off before attendance is updated."
                            >
                              <MenuItem value={1}>Approval Required</MenuItem>
                              <MenuItem value={0}>Auto-Approved (No approval needed)</MenuItem>
                            </AppTextField>
                          </Grid>
                        </Grid>
                      )}
                    </Stack>
                  )}

                  {/* ============================================================== */}
                  {/* TAB: ACCRUAL & BALANCE (PolicyType === 1 Standard Leave)       */}
                  {/* ============================================================== */}
                  {tabs[safeActiveTab]?.id === "accrual" && values.policyType === 1 && (
                    <Stack spacing={2.5}>
                      <PolicyCardSection
                        title="Leave Accrual & Credit Rules"
                        subtitle="Configure frequency, credit quantities, and ceiling balances."
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <FormControl fullWidth>
                              <InputLabel id="accrual-period-label">Leave Credit Frequency</InputLabel>
                              <AppSelect
                                labelId="accrual-period-label"
                                label="Leave Credit Frequency"
                                value={values.accrualPeriod}
                                onChange={(e) => {
                                  const val = Number(e.target.value);
                                  setFieldValue("accrualPeriod", val);
                                  if (val === 3) {
                                    setFieldValue("accrualAmount", 0);
                                  } else if (values.accrualAmount === 0) {
                                    setFieldValue("accrualAmount", 1);
                                  }
                                }}
                              >
                                <MenuItem value={1}>Every Month</MenuItem>
                                <MenuItem value={2}>Every Year</MenuItem>
                                <MenuItem value={3}>None (No automatic credit)</MenuItem>
                              </AppSelect>
                              <FormHelperText>
                                Frequency at which leave is credited to employee balance.
                              </FormHelperText>
                            </FormControl>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextInput
                              label="Leaves Credited per Cycle"
                              name="accrualAmount"
                              type="number"
                              disabled={values.accrualPeriod === 3}
                              helperText={
                                values.accrualPeriod === 3
                                  ? "Accrual disabled (set to 0)."
                                  : "e.g. 1.0 or 1.5 days. Supports half-day increments."
                              }
                              inputProps={{ min: values.accrualPeriod === 3 ? 0 : 0.5, step: 0.5 }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextInput
                              label="Maximum Leave Balance"
                              name="maxBalance"
                              type="number"
                              disabled={values.accrualPeriod === 3}
                              helperText="Ceiling cap on employee leave balance."
                              inputProps={{ min: values.accrualPeriod === 3 ? 0 : 0.5, step: 0.5 }}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <TextInput
                              label="Minimum Notice Days"
                              name="minNoticeDays"
                              type="number"
                              helperText="Days in advance required to apply for this leave."
                              inputProps={{ min: 0 }}
                            />
                          </Grid>
                        </Grid>
                      </PolicyCardSection>

                      <PolicyCardSection
                        title="Carry Forward & Calendar Rules"
                        subtitle="Control unused balance rollover, weekend, and public holiday calculations."
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: values.carryOverAllowed ? 6 : 12 }}>
                            <AppTextField
                              select
                              fullWidth
                              label="Carry Forward"
                              value={values.carryOverAllowed ? 1 : 0}
                              onChange={(e) => {
                                const allowed = Number(e.target.value) === 1;
                                setFieldValue("carryOverAllowed", allowed);
                                if (!allowed) setFieldValue("carryOverLimit", 0);
                              }}
                              helperText="Unused leave from current cycle rolls over to the next period."
                            >
                              <MenuItem value={1}>Allowed</MenuItem>
                              <MenuItem value={0}>Not Allowed</MenuItem>
                            </AppTextField>
                          </Grid>

                          {values.carryOverAllowed && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <TextInput
                                label="Maximum Carry Forward Limit"
                                name="carryOverLimit"
                                type="number"
                                helperText="Max leave days that can be carried over."
                                inputProps={{ min: 0, step: 0.5 }}
                              />
                            </Grid>
                          )}

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                              select
                              fullWidth
                              label="Weekend Calculation"
                              value={values.weekendInclusive ? 1 : 0}
                              onChange={(e) => setFieldValue("weekendInclusive", Number(e.target.value) === 1)}
                              helperText="Determine if weekend days count toward leave duration."
                            >
                              <MenuItem value={1}>Weekend Inclusive (Count as leave)</MenuItem>
                              <MenuItem value={0}>Exclude Weekends (Working days only)</MenuItem>
                            </AppTextField>
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                              select
                              fullWidth
                              label="Public Holidays Calculation"
                              value={values.holidayInclusive ? 1 : 0}
                              onChange={(e) => setFieldValue("holidayInclusive", Number(e.target.value) === 1)}
                              helperText="Determine if public holidays count toward leave duration."
                            >
                              <MenuItem value={1}>Count Public Holidays as leave</MenuItem>
                              <MenuItem value={0}>Exclude Public Holidays</MenuItem>
                            </AppTextField>
                          </Grid>
                        </Grid>
                      </PolicyCardSection>
                    </Stack>
                  )}

                  {/* ============================================================== */}
                  {/* TAB: LIFECYCLE / SPECIAL LEAVE (Standard Leave Only)           */}
                  {/* ============================================================== */}
                  {tabs[safeActiveTab]?.id === "lifecycle" && values.policyType === 1 && (
                    <Stack spacing={2.5}>
                      <AppAlert severity="info">
                        Lifecycle special leave is designed for medical, maternity, paternity, sabbatical, or long-term leaves.
                        It operates without leave balances or accruals. Approval initiates an active case record.
                      </AppAlert>

                      <PolicyCardSection
                        title="Approval-Driven Special Leave"
                        subtitle="Enable special life-event leaves with formal documentation requirements."
                      >
                        <AppTextField
                          select
                          fullWidth
                          label="Lifecycle Special Leave"
                          value={values.lifecycle?.enabled ? 1 : 0}
                          onChange={(e) => {
                            const enabled = Number(e.target.value) === 1;
                            setFieldValue(
                              "lifecycle",
                              enabled
                                ? {
                                    enabled: true,
                                    eventType: "MedicalLeave",
                                    requiresHrApproval: true,
                                    requiresReason: true,
                                    requiresDocument: true,
                                    requiresExpectedReturnDate: true,
                                    defaultAccountStatus: "Active",
                                    defaultPayrollStatus: "Active",
                                    effectiveFromUtc: new Date().toISOString(),
                                  }
                                : null
                            );
                            if (enabled) {
                              setFieldValue("accrualPeriod", 3);
                              setFieldValue("accrualAmount", 0);
                              setFieldValue("maxBalance", 0);
                            }
                          }}
                          helperText="Approval-driven special leave cases (Medical, Maternity, Paternity, Sabbatical) without leave balance tracking."
                        >
                          <MenuItem value={1}>Enabled (Case-managed special leave)</MenuItem>
                          <MenuItem value={0}>Disabled</MenuItem>
                        </AppTextField>

                        {values.lifecycle?.enabled && (
                          <Grid container spacing={2} sx={{ mt: 0.5 }}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <AppTextField
                                select
                                fullWidth
                                label="Lifecycle Event Type"
                                value={values.lifecycle.eventType}
                                onChange={(e) => setFieldValue("lifecycle.eventType", e.target.value)}
                              >
                                <MenuItem value="MedicalLeave">Medical Leave</MenuItem>
                                <MenuItem value="MaternityLeave">Maternity Leave</MenuItem>
                                <MenuItem value="PaternityLeave">Paternity Leave</MenuItem>
                                <MenuItem value="LongTermLeave">Long-Term Leave</MenuItem>
                                <MenuItem value="Sabbatical">Sabbatical</MenuItem>
                              </AppTextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                              <AppTextField
                                select
                                fullWidth
                                label="Account Access During Leave"
                                value={values.lifecycle.defaultAccountStatus ?? "Active"}
                                onChange={(e) => setFieldValue("lifecycle.defaultAccountStatus", e.target.value)}
                                helperText="Reverted safely once the lifecycle case concludes."
                              >
                                <MenuItem value="Active">Active (Retains Login Access)</MenuItem>
                                <MenuItem value="TemporarilyDisabled">Temporarily Disabled</MenuItem>
                              </AppTextField>
                            </Grid>

                            <Grid size={{ xs: 12, sm: 6 }}>
                              <AppTextField
                                select
                                fullWidth
                                label="Payroll Handling During Leave"
                                value={values.lifecycle.defaultPayrollStatus ?? "Active"}
                                onChange={(e) => setFieldValue("lifecycle.defaultPayrollStatus", e.target.value)}
                                helperText="Flags payroll processing; Paid setting controls salary treatment."
                              >
                                <MenuItem value="Active">Active Processing</MenuItem>
                                <MenuItem value="Hold">Hold for Review</MenuItem>
                                <MenuItem value="Paused">Paused</MenuItem>
                              </AppTextField>
                            </Grid>

                            <Grid size={12}>
                              <Box
                                sx={{
                                  p: 2,
                                  borderRadius: "12px",
                                  border: "1px solid",
                                  borderColor: "divider",
                                  bgcolor: alpha(theme.palette.background.default, 0.5),
                                }}
                              >
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>
                                  Required Submission Items
                                </Typography>
                                <Grid container spacing={1.5}>
                                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControlLabel
                                      control={
                                        <AppCheckbox
                                          checked={values.lifecycle.requiresHrApproval}
                                          onChange={(e) =>
                                            setFieldValue("lifecycle.requiresHrApproval", e.target.checked)
                                          }
                                        />
                                      }
                                      label="HR Approval"
                                    />
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControlLabel
                                      control={
                                        <AppCheckbox
                                          checked={values.lifecycle.requiresReason}
                                          onChange={(e) =>
                                            setFieldValue("lifecycle.requiresReason", e.target.checked)
                                          }
                                        />
                                      }
                                      label="Mandatory Reason"
                                    />
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControlLabel
                                      control={
                                        <AppCheckbox
                                          checked={values.lifecycle.requiresExpectedReturnDate}
                                          onChange={(e) =>
                                            setFieldValue("lifecycle.requiresExpectedReturnDate", e.target.checked)
                                          }
                                        />
                                      }
                                      label="Expected Return Date"
                                    />
                                  </Grid>
                                  <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                    <FormControlLabel
                                      control={
                                        <AppCheckbox
                                          checked={values.lifecycle.requiresDocument}
                                          onChange={(e) =>
                                            setFieldValue("lifecycle.requiresDocument", e.target.checked)
                                          }
                                        />
                                      }
                                      label="Document / Evidence"
                                    />
                                  </Grid>
                                </Grid>
                              </Box>
                            </Grid>
                          </Grid>
                        )}
                      </PolicyCardSection>
                    </Stack>
                  )}

                  {/* ============================================================== */}
                  {/* TAB: SCHEDULE & LIMITS (WFH PolicyType === 2)                  */}
                  {/* ============================================================== */}
                  {tabs[safeActiveTab]?.id === "schedule" && values.policyType === 2 && values.workFromHome && (
                    <Stack spacing={2.5}>
                      <PolicyCardSection
                        title="Work From Home Days & Weekday Restrictions"
                        subtitle="Specify permissible weekdays and mandatory in-office collaboration days."
                      >
                        <Stack spacing={2}>
                          <WeekdayChipSelector
                            label="Allowed WFH Weekdays"
                            selectedDays={values.workFromHome.allowedDaysOfWeek ?? []}
                            onChange={(days) => setFieldValue("workFromHome.allowedDaysOfWeek", days)}
                            helperText="Permitted days (leave empty to allow all normal working days)."
                            activeColor="primary"
                          />

                          <WeekdayChipSelector
                            label="Mandatory In-Office Days (Core Days)"
                            selectedDays={values.workFromHome.blockedDaysOfWeek ?? []}
                            onChange={(days) => setFieldValue("workFromHome.blockedDaysOfWeek", days)}
                            helperText="Core collaboration days where WFH is strictly disallowed."
                            activeColor="error"
                          />
                        </Stack>
                      </PolicyCardSection>

                      <PolicyCardSection
                        title="Working Hours & Quota"
                        subtitle="Working minutes and maximum allowances per cycle."
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 4 }}>
                            {(() => {
                              const allowOnWeeklyOff = Boolean(values.workFromHome.allowOnWeeklyOff);
                              const offDaysCount = new Set(weeklyOffDays.filter((d) => d >= 0 && d <= 6)).size;
                              const maxWorkingDays = allowOnWeeklyOff ? 7 : Math.max(1, Math.min(7, 7 - offDaysCount));
                              return (
                                <AppTextField
                                  label="Max WFH Days / Week"
                                  type="number"
                                  inputProps={{ min: 1, max: maxWorkingDays }}
                                  value={values.workFromHome.maxDaysPerWeek ?? ""}
                                  onChange={(e) => {
                                    const raw = e.target.value === "" ? null : Number(e.target.value);
                                    setFieldValue(
                                      "workFromHome.maxDaysPerWeek",
                                      raw === null ? null : Math.max(1, Math.min(maxWorkingDays, raw))
                                    );
                                  }}
                                  helperText={`Allowed: 1 to ${maxWorkingDays} days/week.`}
                                />
                              );
                            })()}
                          </Grid>

                          <Grid size={{ xs: 12, sm: 4 }}>
                            <AppTextField
                              label="Required Working Minutes"
                              type="number"
                              inputProps={{ min: 0 }}
                              value={values.workFromHome.fullDayRequiredWorkingMinutes ?? ""}
                              onChange={(e) =>
                                setFieldValue(
                                  "workFromHome.fullDayRequiredWorkingMinutes",
                                  e.target.value === "" ? null : Number(e.target.value)
                                )
                              }
                              helperText="e.g. 480 mins (8 hrs). Empty uses office schedule."
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 4 }}>
                            <AppTextField
                              label="Break Minutes"
                              type="number"
                              inputProps={{ min: 0 }}
                              value={values.workFromHome.breakMinutes ?? 0}
                              onChange={(e) =>
                                setFieldValue("workFromHome.breakMinutes", e.target.value === "" ? 0 : Number(e.target.value))
                              }
                              helperText="Scheduled break time deducted from daily shift."
                            />
                          </Grid>
                        </Grid>
                      </PolicyCardSection>
                    </Stack>
                  )}

                  {/* ============================================================== */}
                  {/* TAB: CUTOFF & OVERRIDES (WFH PolicyType === 2)                  */}
                  {/* ============================================================== */}
                  {tabs[safeActiveTab]?.id === "cutoff" && values.policyType === 2 && values.workFromHome && (
                    <Stack spacing={2.5}>
                      <PolicyCardSection
                        title="Same-Day Application Cutoff"
                        subtitle="Set deadlines for submitting same-day work-from-home requests."
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                              label="Same-Day Cutoff Time (HH:mm)"
                              placeholder="e.g. 10:00"
                              value={values.workFromHome.sameDayCutoffTime ?? ""}
                              onChange={(e) =>
                                setFieldValue(
                                  "workFromHome.sameDayCutoffTime",
                                  e.target.value.trim() ? e.target.value.trim() : null
                                )
                              }
                              helperText="Fixed cutoff time. Leave empty if there is no deadline."
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <AppTextField
                              label="Grace Period (Minutes)"
                              type="number"
                              inputProps={{ min: 0 }}
                              value={values.workFromHome.sameDayGraceMinutes ?? 0}
                              onChange={(e) =>
                                setFieldValue(
                                  "workFromHome.sameDayGraceMinutes",
                                  e.target.value === "" ? 0 : Math.max(0, Number(e.target.value))
                                )
                              }
                              helperText="Buffer after cutoff before requests are considered late."
                            />
                          </Grid>

                          <Grid size={12}>
                            <AppTextField
                              select
                              fullWidth
                              label="Late Same-Day WFH Requests"
                              value={(values.workFromHome.allowLateApplicationWithApproval ?? true) ? 1 : 0}
                              onChange={(e) =>
                                setFieldValue("workFromHome.allowLateApplicationWithApproval", Number(e.target.value) === 1)
                              }
                              helperText="When enabled, employees applying after the cutoff time can still submit with a justification for manager approval."
                            >
                              <MenuItem value={1}>Allowed with manager approval (Override enabled)</MenuItem>
                              <MenuItem value={0}>Disallowed (Hard block after cutoff time)</MenuItem>
                            </AppTextField>
                          </Grid>
                        </Grid>
                      </PolicyCardSection>
                    </Stack>
                  )}

                  {/* ============================================================== */}
                  {/* TAB: HALF-DAY & COMBINATIONS (WFH PolicyType === 2)             */}
                  {/* ============================================================== */}
                  {tabs[safeActiveTab]?.id === "halfday" && values.policyType === 2 && values.workFromHome && (
                    <Stack spacing={2.5}>
                      <PolicyCardSection
                        title="Half-Day Work From Home"
                        subtitle="Permit employees to work remotely for half of the business day."
                      >
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 12, sm: (values.workFromHome.allowFirstHalf || values.workFromHome.allowSecondHalf) ? 6 : 12 }}>
                            <AppTextField
                              select
                              fullWidth
                              label="Half-Day Work From Home"
                              value={(values.workFromHome.allowFirstHalf || values.workFromHome.allowSecondHalf) ? 1 : 0}
                              onChange={(e) => {
                                const allowed = Number(e.target.value) === 1;
                                setFieldValue("workFromHome.allowFirstHalf", allowed);
                                setFieldValue("workFromHome.allowSecondHalf", allowed);
                              }}
                              helperText="Permit employees to divide their day between WFH and office attendance or leave."
                            >
                              <MenuItem value={1}>Allowed</MenuItem>
                              <MenuItem value={0}>Disallowed (Full-day only)</MenuItem>
                            </AppTextField>
                          </Grid>

                          {(values.workFromHome.allowFirstHalf || values.workFromHome.allowSecondHalf) && (
                            <Grid size={{ xs: 12, sm: 6 }}>
                              <AppTextField
                                select
                                fullWidth
                                required
                                label="Half-Day WFH Attendance Status"
                                value={values.workFromHome.halfDayAttendanceStatusCode ?? ""}
                                onChange={(e) =>
                                  setFieldValue("workFromHome.halfDayAttendanceStatusCode", e.target.value)
                                }
                                helperText="Applied when half-day WFH is approved."
                              >
                                <MenuItem value="">
                                  <em>Select attendance status</em>
                                </MenuItem>
                                {leaveStatuses
                                  .filter((x) => x.isActive)
                                  .map((x) => (
                                    <MenuItem key={x.code} value={x.code} sx={{ py: 1 }}>
                                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Box
                                          sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            bgcolor: x.colorHex || "#94a3b8",
                                          }}
                                        />
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                          {x.code}
                                        </Typography>
                                        <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                          — {x.name}
                                        </Typography>
                                      </Box>
                                    </MenuItem>
                                  ))}
                              </AppTextField>
                            </Grid>
                          )}
                        </Grid>
                      </PolicyCardSection>

                      <PolicyCardSection
                        title="WFH Combination Attendance Codes"
                        subtitle="Status mappings for hybrid combinations such as WFH + In-Office or WFH + Half-Day Leave."
                      >
                        <Grid container spacing={2}>
                          <Grid size={12}>
                            <AppTextField
                              select
                              fullWidth
                              label="WFH Combinations"
                              value={values.workFromHome.allowMixedHalfDayLeave ? 1 : 0}
                              onChange={(e) => setFieldValue("workFromHome.allowMixedHalfDayLeave", Number(e.target.value) === 1)}
                              helperText="Permits combinations like Half WFH with Half In-Office (WFO) or Half-Day Leave (HD)."
                            >
                              <MenuItem value={1}>Allowed (Combine with WFO or Half-Day Leave)</MenuItem>
                              <MenuItem value={0}>Disallowed</MenuItem>
                            </AppTextField>
                          </Grid>

                          {values.workFromHome.allowMixedHalfDayLeave && (
                            <>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <AppTextField
                                  select
                                  fullWidth
                                  label="WFH + WFO Combined Status"
                                  value={values.workFromHome.wfhWfoAttendanceStatusCode ?? ""}
                                  onChange={(e) =>
                                    setFieldValue("workFromHome.wfhWfoAttendanceStatusCode", e.target.value)
                                  }
                                  helperText="Applied when employee works half WFH and half in-office."
                                >
                                  <MenuItem value="">
                                    <em>Select attendance status</em>
                                  </MenuItem>
                                  {leaveStatuses
                                    .filter((x) => x.isActive)
                                    .map((x) => (
                                      <MenuItem key={x.code} value={x.code} sx={{ py: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <Box
                                            sx={{
                                              width: 10,
                                              height: 10,
                                              borderRadius: "50%",
                                              bgcolor: x.colorHex || "#94a3b8",
                                            }}
                                          />
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {x.code}
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            — {x.name}
                                          </Typography>
                                        </Box>
                                      </MenuItem>
                                    ))}
                                </AppTextField>
                              </Grid>

                              <Grid size={{ xs: 12, sm: 6 }}>
                                <AppTextField
                                  select
                                  fullWidth
                                  label="WFH + HD Leave Combined Status"
                                  value={values.workFromHome.wfhHdAttendanceStatusCode ?? ""}
                                  onChange={(e) =>
                                    setFieldValue("workFromHome.wfhHdAttendanceStatusCode", e.target.value)
                                  }
                                  helperText="Applied when employee has half WFH and half regular leave."
                                >
                                  <MenuItem value="">
                                    <em>Select attendance status</em>
                                  </MenuItem>
                                  {leaveStatuses
                                    .filter((x) => x.isActive)
                                    .map((x) => (
                                      <MenuItem key={x.code} value={x.code} sx={{ py: 1 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                          <Box
                                            sx={{
                                              width: 10,
                                              height: 10,
                                              borderRadius: "50%",
                                              bgcolor: x.colorHex || "#94a3b8",
                                            }}
                                          />
                                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                            {x.code}
                                          </Typography>
                                          <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                            — {x.name}
                                          </Typography>
                                        </Box>
                                      </MenuItem>
                                    ))}
                                </AppTextField>
                              </Grid>
                            </>
                          )}
                        </Grid>
                      </PolicyCardSection>
                    </Stack>
                  )}

                  {/* ============================================================== */}
                  {/* TAB: ELIGIBLE EMPLOYEES                                        */}
                  {/* ============================================================== */}
                  {tabs[safeActiveTab]?.id === "eligibility" && (
                    <Stack spacing={2.5}>
                      <PolicyCardSection
                        title="Policy Applicability & Eligibility"
                        subtitle="Determine which employees can view and apply for this policy."
                      >
                        <RadioGroup
                          row
                          value={scope}
                          onChange={(e) => {
                            const newScope = e.target.value as "all" | "custom" | "none";
                            setScope(newScope);
                            if (newScope === "all") {
                              setFieldValue("applicableTo", ["allEmployees"]);
                            } else if (newScope === "none") {
                              setFieldValue("applicableTo", ["noEmployee"]);
                            } else {
                              const current = values.applicableTo ?? [];
                              const filtered = current.filter(
                                (id) => id !== "allEmployees" && id !== "noEmployee"
                              );
                              setFieldValue("applicableTo", filtered);
                            }
                          }}
                          sx={{ gap: 2, mb: 1 }}
                        >
                          <FormControlLabel
                            value="all"
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  All Employees
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  Universal entitlement
                                </Typography>
                              </Box>
                            }
                          />
                          <FormControlLabel
                            value="custom"
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Specific Employees
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  Selected roster only
                                </Typography>
                              </Box>
                            }
                          />
                          <FormControlLabel
                            value="none"
                            control={<Radio />}
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                  Unassigned (Draft)
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                  Not available to anyone
                                </Typography>
                              </Box>
                            }
                          />
                        </RadioGroup>

                        {scope === "all" && (
                          <AppAlert severity="success">
                            This policy is automatically available to all current and future active employees.
                          </AppAlert>
                        )}

                        {scope === "none" && (
                          <AppAlert severity="warning">
                            This policy is saved as unassigned. No employees will be able to apply until assigned.
                          </AppAlert>
                        )}

                        {scope === "custom" && (
                          <Box sx={{ mt: 1 }}>
                            <Autocomplete
                              fullWidth
                              disableCloseOnSelect
                              multiple
                              loading={loadingEmployees}
                              options={employeeList.filter(
                                (e) => e.userId !== "allEmployees" && e.userId !== "noEmployee"
                              )}
                              value={employeeList.filter(
                                (e) =>
                                  e.userId !== "allEmployees" &&
                                  e.userId !== "noEmployee" &&
                                  values.applicableTo?.includes(e.userId)
                              )}
                              isOptionEqualToValue={(opt, val) => opt.userId === val.userId}
                              getOptionLabel={(opt) => opt.fullName || opt.email || opt.userId}
                              onChange={(_, selected) => {
                                const ids = selected.map((s) => s.userId);
                                setFieldValue("applicableTo", ids);
                              }}
                              renderTags={(selected, getTagProps) =>
                                selected.map((opt, index) => (
                                  <Chip
                                    {...getTagProps({ index })}
                                    key={opt.userId}
                                    label={opt.fullName || opt.email}
                                    size="small"
                                    sx={{ borderRadius: "6px" }}
                                  />
                                ))
                              }
                              renderInput={(params) => (
                                <AppTextField
                                  {...params}
                                  label="Eligible Employees"
                                  placeholder="Type to search employees..."
                                  helperText="Choose specific employees who are entitled to this policy."
                                  slotProps={{
                                    input: {
                                      ...params.InputProps,
                                      endAdornment: (
                                        <>
                                          {loadingEmployees ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
                                          {params.InputProps.endAdornment}
                                        </>
                                      ),
                                    },
                                  }}
                                />
                              )}
                            />
                          </Box>
                        )}
                      </PolicyCardSection>
                    </Stack>
                  )}
                </Box>

                {/* Sticky Dialog Bottom Footer */}
                <Box
                  sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.paper",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  {/* Step / Previous Navigation */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    {safeActiveTab > 0 && (
                      <Button
                        variant="outlined"
                        size="medium"
                        startIcon={<ArrowBackRoundedIcon />}
                        onClick={() => setActiveTab((prev) => Math.max(0, prev - 1))}
                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}
                      >
                        Previous
                      </Button>
                    )}
                    {safeActiveTab < tabs.length - 1 && (
                      <Button
                        variant="text"
                        size="medium"
                        endIcon={<ArrowForwardRoundedIcon />}
                        onClick={() => setActiveTab((prev) => Math.min(tabs.length - 1, prev + 1))}
                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}
                      >
                        Next: {tabs[safeActiveTab + 1]?.label}
                      </Button>
                    )}
                  </Stack>

                  {/* Actions: Cancel & Submit */}
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: "100%", sm: "auto" } }}>
                    <CustomisedButton
                      variant="outlined"
                      label={i({ id: "BUTTON.CANCEL" })}
                      handleClick={props.handleClose}
                      sx={{ minWidth: { xs: "auto", sm: 120 }, flex: { xs: 1, sm: "initial" } }}
                    />
                    <CustomisedButton
                      label={i({
                        id: props.isEdit ? "BUTTON.UPDATE" : "BUTTON.ADD",
                      })}
                      type="submit"
                      loading={isSubmitting}
                      disabled={isSubmitting}
                      sx={{ minWidth: { xs: "auto", sm: 150 }, flex: { xs: 1, sm: "initial" } }}
                    />
                  </Stack>
                </Box>
              </form>
            );
          }}
        </Formik>
      )}
    </CustomisedModal>
  );
}