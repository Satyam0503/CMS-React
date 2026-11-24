import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import {
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import VerifiedUserOutlined from "@mui/icons-material/VerifiedUserOutlined";
import SearchRounded from "@mui/icons-material/SearchRounded";
import PersonSearchRounded from "@mui/icons-material/PersonSearchRounded";
import ShieldOutlined from "@mui/icons-material/ShieldOutlined";
import AssignmentTurnedInOutlined from "@mui/icons-material/AssignmentTurnedInOutlined";
import { toast } from "react-toastify";
import { AppButton, AppSwitch, CustomisedDateTimePicker } from "../../shared/components";
import {
  getAllJobVacancies,
  getRecruitmentOfferApprovalPolicy,
  upsertRecruitmentOfferApprovalPolicy,
} from "./services";
import { getAllDepartments, getCompanyDetails, getJobTitles } from "../admin/adminservices";
import { getAllEmployees } from "../employees/employeeServices";
import type { GetAllEmployeeResponseModel } from "../employees/models";
import { DepartmentModel, JobTitleResponseModel } from "../admin/models";
import { RecruitmentOfferApprovalPolicy } from "./models";
import { useIsDark } from "../theme/useIsDark";
import RecruitmentCapabilityNotice from "./RecruitmentCapabilityNotice";
import { isRecruitmentFeatureDisabled, responseDataFromError } from "./recruitmentCapabilityUtils";

const key = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-offer-policy`;

interface CurrencyOption {
  code: string;
  symbol: string;
  name: string;
}

const COMMON_CURRENCIES: CurrencyOption[] = [
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "AED", symbol: "د.إ", name: "UAE Dirham" },
  { code: "CAD", symbol: "$", name: "Canadian Dollar" },
  { code: "AUD", symbol: "$", name: "Australian Dollar" },
  { code: "SGD", symbol: "$", name: "Singapore Dollar" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "CHF", symbol: "CHF", name: "Swiss Franc" },
];

const STANDARD_JOB_GRADES = [
  { code: "", label: "All Job Levels", description: "Applies across all hierarchy bands" },
  { code: "L6", label: "Executive (L6 - CXO, VP)", description: "CXO, VP, Managing Director" },
  { code: "L5", label: "Director (L5 - Head of Dept)", description: "Director, Associate VP" },
  { code: "L4", label: "Lead / Staff (L4)", description: "Principal Engineer, Team Lead" },
  { code: "L3", label: "Senior Level (L3)", description: "Senior Engineer, Specialist" },
  { code: "L2", label: "Mid-Level (L2)", description: "Engineer, Analyst, Associate II" },
  { code: "L1", label: "Junior / Associate (L1)", description: "Junior Analyst, Associate" },
  { code: "INTERN", label: "Intern / Trainee", description: "Graduate Trainee, Intern" },
];

interface EmployeeOption {
  userId: string;
  employeeId: string;
  fullName: string;
  email: string;
  department?: string | null;
  jobRole?: string | null;
}

interface DepartmentOption {
  departmentId: string;
  name: string;
}

interface VacancyOption {
  jobId: string;
  title: string;
  department?: string;
  location?: string;
  status: boolean;
}

export default function RecruitmentOfferApprovalPolicyEditor() {
  const theme = useTheme();
  const isDark = useIsDark();

  // Scope selection
  const [scopeMode, setScopeMode] = useState<"GLOBAL" | "VACANCY">("GLOBAL");
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyOption | null>(null);

  // Policy form state
  const [currency, setCurrency] = useState("INR");
  const [legalEntityId, setLegalEntityId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [grade, setGrade] = useState("");
  const [threshold, setThreshold] = useState(0);
  const [required, setRequired] = useState(true);
  const [delegatedApproverUserId, setDelegatedApproverUserId] = useState("");
  const [delegationExpiresAtUtc, setDelegationExpiresAtUtc] = useState("");

  // System options loaded from APIs
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitleResponseModel[]>([]);
  const [vacancies, setVacancies] = useState<VacancyOption[]>([]);
  const [legalEntities, setLegalEntities] = useState<string[]>([]);

  // Metadata / policy tracking
  const [loadedPolicy, setLoadedPolicy] = useState<RecruitmentOfferApprovalPolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [featureDisabled, setFeatureDisabled] = useState(false);
  const [loadError, setLoadError] = useState<string>();

  // Fetch contextual reference data (employees, departments, job titles, vacancies, legal entity)
  useEffect(() => {
    let active = true;

    const loadContextualData = async () => {
      setLoadingData(true);
      try {
        const [empRes, deptRes, titlesRes, vacRes, companyRes] = await Promise.allSettled([
          getAllEmployees({ name: "", pageNo: 1, records: 500, departmentId: [], gender: [], employmentStatus: "Active" }),
          getAllDepartments(true),
          getJobTitles(true),
          getAllJobVacancies({ jobTypes: [], status: null, pageNo: 1, records: 100, search: "" }),
          getCompanyDetails(),
        ]);

        if (!active) return;

        // Employees
        if (empRes.status === "fulfilled" && empRes.value?.data) {
          const list = ((empRes.value.data.methodResults ?? []) as Array<GetAllEmployeeResponseModel & { firstName?: string; lastName?: string; name?: string; designation?: string }>).map((e) => ({
            userId: e.userId || "",
            employeeId: e.employeeId || "",
            fullName: [e.firstName, e.lastName].filter(Boolean).join(" ") || e.fullName || e.name || e.email || e.userId,
            email: e.email || "",
            department: typeof e.department === "string" ? e.department : e.department ? Object.values(e.department).join(" ") : "",
            jobRole: (typeof e.jobRole === "string" ? e.jobRole : e.jobRole ? Object.values(e.jobRole).join(" ") : "") || e.designation || "",
          }));
          setEmployees(list.filter((e) => Boolean(e.userId)));
        }

        // Departments
        if (deptRes.status === "fulfilled" && deptRes.value?.data) {
          const depts = (deptRes.value.data.methodResults ?? (deptRes.value.data.methodResult as unknown as DepartmentModel[] | undefined) ?? []).map((d) => ({
            departmentId: d.departmentId || "",
            name: Object.values(d.titles ?? {})[0] || d.departmentId || "Department",
          }));
          setDepartments(depts.filter((d) => Boolean(d.departmentId)));
        }

        // Job Titles
        if (titlesRes.status === "fulfilled" && titlesRes.value?.data?.success) {
          setJobTitles((titlesRes.value.data.methodResults ?? []) as JobTitleResponseModel[]);
        }

        // Vacancies
        if (vacRes.status === "fulfilled" && vacRes.value?.data?.success) {
          const vList = (vacRes.value.data.methodResults ?? []).map((v) => ({
            jobId: v.jobId,
            title: v.title,
            department: v.department,
            location: v.location,
            status: v.status,
          }));
          setVacancies(vList);
        }

        // Company Details / Legal Entities
        if (companyRes.status === "fulfilled" && companyRes.value?.data?.success && companyRes.value.data.methodResult) {
          const compName = companyRes.value.data.methodResult.companyName;
          if (compName) {
            setLegalEntities([compName, `${compName} (Primary Entity)`]);
          }
        }
      } catch (err) {
        console.error("Failed to load reference data for recruitment governance", err);
      } finally {
        if (active) setLoadingData(false);
      }
    };

    void loadContextualData();
    return () => {
      active = false;
    };
  }, []);

  // Fetch the active policy (either company-wide default or vacancy-specific)
  const loadPolicy = useCallback(async (vacancyId?: string) => {
    setLoading(true);
    setLoadError(undefined);
    try {
      const { data } = await getRecruitmentOfferApprovalPolicy(vacancyId);
      if (!data.success && isRecruitmentFeatureDisabled(data)) {
        setFeatureDisabled(true);
        return;
      }
      if (!data.success) {
        setFeatureDisabled(false);
        setLoadError(data.message || "The offer approval policy could not be loaded.");
        return;
      }
      const policy = data.methodResult;
      if (data.success && policy) {
        setFeatureDisabled(false);
        setLoadedPolicy(policy);
        setCurrency(policy.currency || "INR");
        setLegalEntityId(policy.legalEntityId ?? "");
        setDepartmentId(policy.departmentId ?? "");
        setGrade(policy.grade ?? "");
        setThreshold(policy.approvalThreshold ?? 0);
        setRequired(policy.requireApprovalReference ?? true);
        setDelegatedApproverUserId(policy.delegatedApproverUserId ?? "");
        setDelegationExpiresAtUtc(policy.delegationExpiresAtUtc ? policy.delegationExpiresAtUtc.slice(0, 16) : "");
      } else {
        setFeatureDisabled(false);
        setLoadedPolicy(null);
        setCurrency("INR");
        setLegalEntityId("");
        setDepartmentId("");
        setGrade("");
        setThreshold(0);
        setRequired(true);
        setDelegatedApproverUserId("");
        setDelegationExpiresAtUtc("");
      }
    } catch (error) {
      const response = responseDataFromError(error) as { message?: string } | undefined;
      if (isRecruitmentFeatureDisabled(response)) {
        setFeatureDisabled(true);
      } else {
        setFeatureDisabled(false);
        setLoadError(response?.message || (error instanceof Error ? error.message : "") || "The offer approval policy could not be loaded. Check your connection and try again.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Load policy on mount or when scope changes
  useEffect(() => {
    if (scopeMode === "GLOBAL") {
      void loadPolicy();
    } else if (scopeMode === "VACANCY" && selectedVacancy) {
      void loadPolicy(selectedVacancy.jobId);
    }
  }, [scopeMode, selectedVacancy, loadPolicy]);

  // Selected approver details
  const selectedApprover = useMemo(() => {
    if (!delegatedApproverUserId) return null;
    return employees.find((e) => e.userId === delegatedApproverUserId) || null;
  }, [delegatedApproverUserId, employees]);

  // Delegation status calculations
  const delegationStatus = useMemo(() => {
    if (!delegatedApproverUserId) {
      return {
        severity: "info" as const,
        label: "Default Sign-Off Authority",
        message: "Offers are approved by the Hiring Manager and HR Leadership.",
        isActive: false,
      };
    }
    const approverName = selectedApprover ? selectedApprover.fullName : delegatedApproverUserId;
    if (!delegationExpiresAtUtc) {
      return {
        severity: "warning" as const,
        label: "Indefinite Delegation",
        message: `Sign-off authority is delegated to ${approverName} indefinitely until revoked.`,
        isActive: true,
      };
    }
    const expiry = dayjs(delegationExpiresAtUtc);
    const now = dayjs();
    if (expiry.isBefore(now)) {
      return {
        severity: "error" as const,
        label: "Delegation Expired",
        message: `Delegation to ${approverName} expired on ${expiry.format("MMM D, YYYY h:mm A")}. Reverting to standard authority.`,
        isActive: false,
      };
    }
    const diffDays = expiry.diff(now, "day");
    const diffHours = expiry.diff(now, "hour");
    const remainingText = diffDays > 0 ? `${diffDays} day${diffDays > 1 ? "s" : ""} left` : `${diffHours} hour${diffHours > 1 ? "s" : ""} left`;
    return {
      severity: "success" as const,
      label: "Active Delegation",
      message: `Sign-off authority delegated to ${approverName} (${remainingText} · until ${expiry.format("MMM D, YYYY")}).`,
      isActive: true,
    };
  }, [delegatedApproverUserId, delegationExpiresAtUtc, selectedApprover]);

  // Save handler
  const save = async () => {
    if (delegationExpiresAtUtc && dayjs(delegationExpiresAtUtc).isBefore(dayjs())) {
      toast.error("Delegation expiry date must be in the future.");
      return;
    }

    setSaving(true);
    try {
      const vacancyIdParam = scopeMode === "VACANCY" && selectedVacancy ? selectedVacancy.jobId : null;
      const { data } = await upsertRecruitmentOfferApprovalPolicy({
        policyId: loadedPolicy?.policyId,
        vacancyId: vacancyIdParam,
        legalEntityId: legalEntityId.trim() || null,
        departmentId: departmentId.trim() || null,
        grade: grade.trim() || null,
        currency: currency.trim().toUpperCase(),
        approvalThreshold: Math.max(0, Number(threshold) || 0),
        requireApprovalReference: required,
        delegatedApproverUserId: delegatedApproverUserId.trim() || null,
        delegationExpiresAtUtc: delegationExpiresAtUtc ? new Date(delegationExpiresAtUtc).toISOString() : null,
        idempotencyKey: key(),
        expectedVersion: loadedPolicy?.version,
      });

      if (!data.success && isRecruitmentFeatureDisabled(data)) {
        setFeatureDisabled(true);
        return;
      }
      if (!data.success) throw new Error(data.message || "Unable to save offer policy.");
      toast.success(
        vacancyIdParam
          ? `Offer approval policy saved for ${selectedVacancy?.title || "selected vacancy"}.`
          : "Company-wide offer approval policy saved."
      );
      void loadPolicy(vacancyIdParam || undefined);
    } catch (error) {
      if (isRecruitmentFeatureDisabled(responseDataFromError(error))) {
        setFeatureDisabled(true);
      } else {
        toast.error((error as Error).message || "Unable to save offer policy.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Reset form to defaults
  const resetToDefaults = () => {
    setCurrency("INR");
    setLegalEntityId("");
    setDepartmentId("");
    setGrade("");
    setThreshold(0);
    setRequired(true);
    setDelegatedApproverUserId("");
    setDelegationExpiresAtUtc("");
    toast.info("Form reset to default governance parameters.");
  };

  // Helpers for formatting
  const currencySymbol = useMemo(() => {
    const match = COMMON_CURRENCIES.find((c) => c.code === currency.toUpperCase());
    return match ? match.symbol : currency;
  }, [currency]);

  const thresholdPresets = useMemo(() => {
    const isInr = currency.toUpperCase() === "INR";
    if (isInr) {
      return [
        { label: "₹0 (Always)", value: 0 },
        { label: "₹5 Lakh", value: 500000 },
        { label: "₹10 Lakh", value: 1000000 },
        { label: "₹25 Lakh", value: 2500000 },
        { label: "₹50 Lakh", value: 5000000 },
      ];
    }
    return [
      { label: `${currencySymbol}0 (Always)`, value: 0 },
      { label: `${currencySymbol}50k`, value: 50000 },
      { label: `${currencySymbol}100k`, value: 100000 },
      { label: `${currencySymbol}150k`, value: 150000 },
      { label: `${currencySymbol}250k`, value: 250000 },
    ];
  }, [currency, currencySymbol]);

  const formattedThreshold = useMemo(() => {
    if (currency.toUpperCase() === "INR") {
      return `${currencySymbol} ${Number(threshold).toLocaleString("en-IN")}`;
    }
    return `${currencySymbol} ${Number(threshold).toLocaleString()}`;
  }, [threshold, currency, currencySymbol]);

  // Selected department title
  const selectedDeptName = useMemo(() => {
    if (!departmentId) return "All Departments";
    const match = departments.find((d) => d.departmentId === departmentId);
    return match ? match.name : departmentId;
  }, [departmentId, departments]);

  if (featureDisabled || loadError) {
    return (
      <RecruitmentCapabilityNotice
        feature="Offer approval policy"
        settingsArea="Stage gates → Offer approval sign-off"
        disabled={featureDisabled}
        errorMessage={loadError}
        onRetry={() => void loadPolicy(scopeMode === "VACANCY" ? selectedVacancy?.jobId : undefined)}
        retrying={loading}
      />
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
        borderRadius: "12px",
        bgcolor: isDark ? "rgba(30, 41, 59, 0.3)" : "background.paper",
        boxShadow: "none",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header bar */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={1.5}
        flexWrap="wrap"
        useFlexGap
      >
        <Stack direction="row" spacing={1.25} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <VerifiedUserOutlined sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={750} sx={{ fontSize: "1rem" }}>
              Offer Approval & Compensation Governance
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.82rem", mt: 0.25 }}>
              Choose who approves offers, when approval is needed, and what evidence to collect.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap sx={{ width: { xs: "100%", sm: "auto" } }}>
          {/* Scope Segmented Pill Switcher */}
          <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
            <Chip
              label="Company policy"
              onClick={() => {
                setScopeMode("GLOBAL");
                setSelectedVacancy(null);
                void loadPolicy("");
              }}
              color={scopeMode === "GLOBAL" ? "primary" : "default"}
              variant={scopeMode === "GLOBAL" ? "filled" : "outlined"}
              size="small"
              sx={{ fontWeight: 750, borderRadius: "8px", height: 32, px: 0.75, cursor: "pointer", flex: { xs: 1, sm: "none" } }}
            />
            <Chip
              label="Vacancy override"
              onClick={() => setScopeMode("VACANCY")}
              color={scopeMode === "VACANCY" ? "primary" : "default"}
              variant={scopeMode === "VACANCY" ? "filled" : "outlined"}
              size="small"
              sx={{ fontWeight: 750, borderRadius: "8px", height: 32, px: 0.75, cursor: "pointer", flex: { xs: 1, sm: "none" } }}
            />
          </Stack>

          <AppButton
            variant="outlined"
            size="small"
            onClick={resetToDefaults}
            disabled={loading || saving}
            sx={{
              height: 36,
              px: 2,
              fontSize: "0.8rem",
              fontWeight: 650,
              borderRadius: "9px",
              flex: { xs: 1, sm: "none" },
            }}
          >
            Reset
          </AppButton>
          <AppButton
            variant="contained"
            size="small"
            onClick={() => void save()}
            disabled={loading || saving}
            sx={{
              height: 36,
              px: 2.25,
              fontSize: "0.8rem",
              fontWeight: 750,
              borderRadius: "9px",
              flex: { xs: 1, sm: "none" },
            }}
          >
            {loading ? "Loading…" : saving ? "Saving…" : "Save policy"}
          </AppButton>
        </Stack>
      </Stack>

      {/* Search bar when Vacancy-Specific Override is chosen */}
      {scopeMode === "VACANCY" && (
        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
            bgcolor: isDark ? "rgba(15,23,42,0.3)" : "#F8FAFC",
          }}
        >
          <Autocomplete
            size="small"
            options={vacancies}
            value={selectedVacancy}
            onChange={(_, newValue) => {
              setSelectedVacancy(newValue);
              if (newValue) {
                void loadPolicy(newValue.jobId);
              }
            }}
            getOptionLabel={(option) => `${option.title} (${option.jobId})${option.department ? ` · ${option.department}` : ""}`}
            isOptionEqualToValue={(option, val) => option.jobId === val.jobId}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                label="Search Job Vacancy"
                placeholder="Search by job title, vacancy code, or department..."
                InputProps={{
                  ...params.InputProps,
                  startAdornment: (
                    <>
                      <InputAdornment position="start">
                        <SearchRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                      </InputAdornment>
                      {params.InputProps.startAdornment}
                    </>
                  ),
                }}
                fullWidth
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props} key={option.jobId} sx={{ py: 1 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between" width="100%">
                  <Box minWidth={0}>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {option.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.jobId} {option.department ? `· ${option.department}` : ""} {option.location ? `· ${option.location}` : ""}
                    </Typography>
                  </Box>
                  <Chip
                    size="small"
                    label={option.status ? "Active" : "Closed"}
                    color={option.status ? "success" : "default"}
                    variant="outlined"
                    sx={{ height: 20, fontSize: "0.68rem" }}
                  />
                </Stack>
              </Box>
            )}
          />

          {selectedVacancy && (
            <Alert severity="info" sx={{ mt: 1.5, py: 0.5, fontSize: "0.78rem", borderRadius: "8px" }}>
              Currently managing custom offer approval gates for: <strong>{selectedVacancy.title}</strong> (<code>{selectedVacancy.jobId}</code>).
            </Alert>
          )}
        </Box>
      )}

      <Divider sx={{ my: 2.5 }} />

      <Stack spacing={0} divider={<Divider flexItem />}>
        {/* SECTION 1: Organizational Scope & Eligibility */}
        <Box sx={{ py: 2 }}>
          <Typography variant="subtitle2" color="text.primary" fontWeight={750}>
            Who does this policy cover?
          </Typography>
          <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1.5, fontSize: "0.8rem" }}>
            Choose the legal entities, departments, and job levels this rule applies to.
          </Typography>

          <Grid container spacing={{ xs: 1.5, md: 2 }}>
            {/* Legal Entity Autocomplete */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Autocomplete
                freeSolo
                size="small"
                options={["All Legal Entities", ...legalEntities]}
                value={legalEntityId || "All Legal Entities"}
                onChange={(_, newValue) => {
                  if (!newValue || newValue === "All Legal Entities") {
                    setLegalEntityId("");
                  } else {
                    setLegalEntityId(newValue);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Legal entity"
                    placeholder="All Legal Entities"
                    fullWidth
                  />
                )}
              />
            </Grid>

            {/* Department Searchable Autocomplete */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Autocomplete
                size="small"
                options={[{ departmentId: "", name: "All Departments" }, ...departments]}
                value={departments.find((d) => d.departmentId === departmentId) || { departmentId, name: selectedDeptName }}
                onChange={(_, newValue) => {
                  setDepartmentId(newValue ? newValue.departmentId : "");
                }}
                getOptionLabel={(option) => (typeof option === "string" ? option : option.name)}
                isOptionEqualToValue={(option, val) => option.departmentId === val.departmentId}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Department"
                    placeholder="All Departments"
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={option.departmentId || "all"}>
                    <Typography variant="body2" sx={{ fontSize: "0.82rem" }}>
                      {option.name}
                    </Typography>
                    {option.departmentId && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: "auto", pl: 1 }}>
                        {option.departmentId}
                      </Typography>
                    )}
                  </Box>
                )}
              />
            </Grid>

            {/* Job Grade Searchable Autocomplete */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Autocomplete
                freeSolo
                size="small"
                options={[
                  ...STANDARD_JOB_GRADES,
                  ...jobTitles.map((j) => ({
                    code: j.jobTitleId || "",
                    label: Object.values(j.titles ?? {})[0] || j.jobTitleId || "Job Title",
                    description: "Company Designation",
                  })),
                ]}
                value={
                  grade
                    ? STANDARD_JOB_GRADES.find((g) => g.code === grade) || { code: grade, label: grade, description: "Custom Grade" }
                    : STANDARD_JOB_GRADES[0]
                }
                onChange={(_, newValue) => {
                  if (!newValue) {
                    setGrade("");
                  } else if (typeof newValue === "string") {
                    setGrade(newValue === "All Job Levels" ? "" : newValue);
                  } else {
                    setGrade(newValue.code);
                  }
                }}
                getOptionLabel={(option) => (typeof option === "string" ? option : option.label)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Job grade / Level"
                    placeholder="All Job Levels"
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={typeof option === "string" ? option : option.code || option.label}>
                    <Box>
                      <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
                        {typeof option === "string" ? option : option.label}
                      </Typography>
                      {typeof option !== "string" && option.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                          {option.description}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                )}
              />
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 2: Delegation & Authorization Controls */}
        <Box sx={{ py: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.25 }} flexWrap="wrap" useFlexGap>
            <Typography variant="subtitle2" color="text.primary" fontWeight={750}>
              Who can approve during an absence?
            </Typography>
            <Chip
              size="small"
              label={delegationStatus.label}
              color={delegationStatus.severity}
              variant="outlined"
              sx={{ height: 20, fontSize: "0.68rem", fontWeight: 700 }}
            />
          </Stack>
          <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1.5, fontSize: "0.8rem" }}>
            Optionally assign a temporary approver. Leave this blank to use the standard sign-off authority.
          </Typography>

          <Grid container spacing={2}>
            {/* Left: Search Delegated Approver */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Autocomplete
                  size="small"
                  options={employees}
                  value={selectedApprover}
                  onChange={(_, newValue) => {
                    setDelegatedApproverUserId(newValue ? newValue.userId : "");
                    if (!newValue) {
                      setDelegationExpiresAtUtc("");
                    }
                  }}
                  getOptionLabel={(option) => `${option.fullName} (${option.employeeId || option.userId})`}
                  isOptionEqualToValue={(option, val) => option.userId === val.userId}
                  loading={loadingData}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      size="small"
                      label="Delegated approver"
                      placeholder="Search employee by name, ID, or email..."
                      fullWidth
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <InputAdornment position="start">
                              <PersonSearchRounded sx={{ fontSize: 18, color: "text.secondary" }} />
                            </InputAdornment>
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {loadingData ? <CircularProgress color="inherit" size={16} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => (
                    <Box component="li" {...props} key={option.userId} sx={{ py: 1 }}>
                      <Stack direction="row" spacing={1.25} alignItems="center" width="100%">
                        <Avatar
                          sx={{
                            width: 32,
                            height: 32,
                            fontSize: "0.75rem",
                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                            color: "primary.main",
                            fontWeight: 700,
                          }}
                        >
                          {option.fullName.slice(0, 2).toUpperCase()}
                        </Avatar>
                        <Box minWidth={0} sx={{ flex: 1 }}>
                          <Typography variant="body2" fontWeight={700} noWrap sx={{ fontSize: "0.82rem" }}>
                            {option.fullName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" noWrap display="block" sx={{ fontSize: "0.72rem" }}>
                            {option.email} {option.department ? `· ${option.department}` : ""}
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={option.employeeId || option.userId}
                          variant="outlined"
                          sx={{ height: 20, fontSize: "0.68rem" }}
                        />
                      </Stack>
                    </Box>
                  )}
                />

                {/* Sub-status below approver search */}
                <Box sx={{ minHeight: 28, display: "flex", alignItems: "center" }}>
                  {delegatedApproverUserId ? (
                    <Stack direction="row" spacing={1} alignItems="center" minWidth={0}>
                      <Avatar
                        sx={{
                          width: 22,
                          height: 22,
                          fontSize: "0.65rem",
                          bgcolor: "primary.main",
                          color: "#fff",
                          fontWeight: 700,
                        }}
                      >
                        {(selectedApprover?.fullName || delegatedApproverUserId).slice(0, 2).toUpperCase()}
                      </Avatar>
                      <Typography variant="caption" fontWeight={700} noWrap sx={{ fontSize: "0.75rem" }}>
                        {selectedApprover?.fullName || delegatedApproverUserId}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: "0.72rem" }}>
                        {selectedApprover?.department ? `(${selectedApprover.department})` : ""}
                      </Typography>
                      <Tooltip title="Clear delegated approver">
                        <Chip
                          size="small"
                          label="Revoke"
                          color="error"
                          variant="outlined"
                          onClick={() => {
                            setDelegatedApproverUserId("");
                            setDelegationExpiresAtUtc("");
                            toast.info("Delegation cleared. Standard authority restored.");
                          }}
                          sx={{ height: 20, fontSize: "0.65rem", cursor: "pointer", ml: 0.5 }}
                        />
                      </Tooltip>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                      Standard HR Leadership sign-off active.
                    </Typography>
                  )}
                </Box>
              </Stack>
            </Grid>

            {/* Right: Delegation Expiry DateTimePicker */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Stack spacing={1}>
                <Box sx={{ width: "100%", "& .MuiStack-root": { pt: "0 !important", overflow: "visible" } }}>
                  <CustomisedDateTimePicker
                    label="Delegation expiry"
                    value={delegationExpiresAtUtc ? dayjs(delegationExpiresAtUtc) : null}
                    minDateTime={dayjs()}
                    onChange={(value) => setDelegationExpiresAtUtc(value?.format("YYYY-MM-DDTHH:mm") ?? "")}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: "small",
                      },
                    }}
                  />
                </Box>

                {/* Sub-presets below DateTimePicker */}
                <Box sx={{ minHeight: 28, display: "flex", alignItems: "center" }}>
                  <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mr: 0.25, fontSize: "0.72rem" }}>
                      Presets:
                    </Typography>
                    {[
                      { label: "+7d", days: 7 },
                      { label: "+14d", days: 14 },
                      { label: "+30d", days: 30 },
                      { label: "+90d", days: 90 },
                    ].map((preset) => (
                      <Chip
                        key={preset.label}
                        size="small"
                        label={preset.label}
                        onClick={() => setDelegationExpiresAtUtc(dayjs().add(preset.days, "day").format("YYYY-MM-DDTHH:mm"))}
                        variant="outlined"
                        sx={{
                          fontSize: "0.68rem",
                          height: 20,
                          cursor: "pointer",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      />
                    ))}
                    {delegationExpiresAtUtc && (
                      <Chip
                        size="small"
                        label="Clear"
                        onClick={() => setDelegationExpiresAtUtc("")}
                        color="default"
                        variant="outlined"
                        sx={{ fontSize: "0.68rem", height: 20, cursor: "pointer" }}
                      />
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 3: Threshold & Evidence */}
        <Box sx={{ py: 2 }}>
          <Typography variant="subtitle2" color="text.primary" fontWeight={750}>
            When is approval required?
          </Typography>
          <Typography variant="body2" color="text.secondary" display="block" sx={{ mb: 1.5, fontSize: "0.8rem" }}>
            Set the compensation threshold and decide whether an approval reference must be provided.
          </Typography>

          <Grid container spacing={2}>
            {/* Currency Selector (50% Width on tablet/desktop) */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <Autocomplete
                freeSolo
                size="small"
                options={COMMON_CURRENCIES}
                value={COMMON_CURRENCIES.find((c) => c.code === currency.toUpperCase()) || { code: currency, symbol: currency, name: currency }}
                onChange={(_, newValue) => {
                  if (!newValue) {
                    setCurrency("INR");
                  } else if (typeof newValue === "string") {
                    setCurrency(newValue.toUpperCase());
                  } else {
                    setCurrency(newValue.code);
                  }
                }}
                getOptionLabel={(option) => (typeof option === "string" ? option : `${option.code} (${option.symbol})`)}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Currency"
                    placeholder="Select currency"
                    fullWidth
                  />
                )}
                renderOption={(props, option) => (
                  <Box component="li" {...props} key={typeof option === "string" ? option : option.code}>
                    <Stack direction="row" spacing={1} justifyContent="space-between" width="100%">
                      <Typography variant="body2" sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
                        {typeof option === "string" ? option : `${option.code} (${option.symbol})`}
                      </Typography>
                      {typeof option !== "string" && (
                        <Typography variant="caption" color="text.secondary">
                          {option.name}
                        </Typography>
                      )}
                    </Stack>
                  </Box>
                )}
              />
            </Grid>

            {/* Approval Threshold (50% Width on tablet/desktop — IDENTICAL SIZE TO CURRENCY) */}
            <Grid size={{ xs: 12, sm: 6, md: 6 }}>
              <TextField
                size="small"
                label="Approval threshold"
                type="number"
                value={threshold}
                onChange={(event) => setThreshold(Math.max(0, Number(event.target.value) || 0))}
                inputProps={{ min: 0, step: "any" }}
                fullWidth
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body2" fontWeight={800} color="primary.main">
                        {currencySymbol}
                      </Typography>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Row 2: Quick Presets Bar */}
            <Grid size={{ xs: 12 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                spacing={1}
                flexWrap="wrap"
                useFlexGap
              >
                <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap" useFlexGap>
                  <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ mr: 0.25, fontSize: "0.72rem" }}>
                    Presets:
                  </Typography>
                  {thresholdPresets.map((preset) => (
                    <Chip
                      key={preset.label}
                      size="small"
                      label={preset.label}
                      onClick={() => setThreshold(preset.value)}
                      color={threshold === preset.value ? "primary" : "default"}
                      variant={threshold === preset.value ? "filled" : "outlined"}
                      sx={{
                        fontSize: "0.7rem",
                        height: 24,
                        cursor: "pointer",
                        fontWeight: threshold === preset.value ? 700 : 500,
                      }}
                    />
                  ))}
                </Stack>
                <Chip
                  size="small"
                  label={threshold <= 0 ? "Applies to every offer" : `CTC over ${formattedThreshold}`}
                  color="primary"
                  variant="outlined"
                  sx={{ height: 24, fontSize: "0.72rem", fontWeight: 750, borderRadius: "6px" }}
                />
              </Stack>
            </Grid>

            {/* Row 3: Dedicated Full-Width Verification Switch Card */}
            <Grid size={{ xs: 12 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: "10px",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  bgcolor: isDark ? "rgba(15, 23, 42, 0.2)" : "#F8FAFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1.5,
                  minWidth: 0,
                  maxWidth: "100%",
                  boxSizing: "border-box",
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" minWidth={0} sx={{ flex: "1 1 240px" }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: "8px",
                      display: "grid",
                      placeItems: "center",
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      color: "primary.main",
                      flexShrink: 0,
                    }}
                  >
                    <AssignmentTurnedInOutlined sx={{ fontSize: 20 }} />
                  </Box>
                  <Box minWidth={0}>
                    <Typography variant="body2" fontWeight={800} sx={{ fontSize: "0.84rem" }}>
                      Approval Reference & Audit Evidence Required
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.74rem", display: "block" }}>
                      Require a memo, budget request, or approval code before sending.
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={1} alignItems="center" flexShrink={0}>
                  <Chip
                    size="small"
                    label={required ? "Mandatory" : "Optional"}
                    color={required ? "primary" : "default"}
                    variant="outlined"
                    sx={{ height: 22, fontSize: "0.7rem", fontWeight: 700 }}
                  />
                  <AppSwitch
                    checked={required}
                    onChange={(event) => setRequired(event.target.checked)}
                    inputProps={{ "aria-label": "Approval reference required" }}
                  />
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* SECTION 4: Live Policy Summary */}
        <Box
          sx={{
            p: { xs: 1.5, sm: 2 },
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.default",
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <ShieldOutlined sx={{ fontSize: 19, color: "primary.main" }} />
            <Typography variant="subtitle2" fontWeight={750}>
              Policy summary
            </Typography>
          </Stack>
          <Grid container spacing={{ xs: 1.25, sm: 2 }}>
            {[
              { label: "Approval trigger", value: threshold <= 0 ? "Every offer" : `CTC above ${formattedThreshold}` },
              { label: "Covered roles", value: `${legalEntityId || "All legal entities"} · ${selectedDeptName} · ${grade || "All job levels"}` },
              { label: "Approver", value: selectedApprover?.fullName || delegatedApproverUserId.trim() || "HR Leadership / Hiring Director" },
              { label: "Offer evidence", value: required ? "Approval reference required" : "Approval reference optional" },
            ].map((item) => (
              <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                <Box sx={{ minWidth: 0, height: "100%" }}>
                  <Typography variant="caption" color="text.secondary" fontWeight={650}>
                    {item.label}
                  </Typography>
                  <Typography variant="body2" fontWeight={650} sx={{ mt: 0.25, overflowWrap: "anywhere" }}>
                    {item.value}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Stack>
    </Box>
  );
}
