import { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Box,
  ButtonBase,
  Card,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import EventNoteOutlined from "@mui/icons-material/EventNoteOutlined";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import TuneRounded from "@mui/icons-material/TuneRounded";
import PsychologyRounded from "@mui/icons-material/PsychologyRounded";
import LayersRounded from "@mui/icons-material/LayersRounded";
import CheckCircleOutlineRounded from "@mui/icons-material/CheckCircleOutlineRounded";
import { AppButton, AppSwitch, AppTextField } from "../../shared/components/ui";
import { toast } from "react-toastify";
import { getAllJobVacancies, getRecruitmentInterviewPlan, upsertRecruitmentInterviewPlan } from "./services";
import {
  JobModal,
  RecruitmentCompetencyConfig,
  RecruitmentInterviewPlanStageCommand,
  RecruitmentRatingScaleConfig,
} from "./models";
import { useIsDark } from "../theme/useIsDark";

const key = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-interview-plan`;

const initialStages: RecruitmentInterviewPlanStageCommand[] = [
  { order: 1, code: "technical", name: "Technical interview", type: "Technical", requiredPanelSize: 1, scorecardRequired: true, feedbackDueHours: 24, passThreshold: 70, isMandatory: true },
  { order: 2, code: "hr", name: "HR interview", type: "HR", requiredPanelSize: 1, scorecardRequired: true, feedbackDueHours: 24, passThreshold: 50, isMandatory: false },
];

const defaultRatingScale: RecruitmentRatingScaleConfig = {
  scaleType: "Numeric1To5",
  minRating: 1,
  maxRating: 5,
  step: 1,
  normalizationMethod: "PercentageOfMax",
  levels: [],
};

const initialCompetencies: RecruitmentCompetencyConfig[] = [
  { code: "CORE_SKILLS", name: "Role Specific Technical Skills", weight: 50, isMandatory: true, minScore: 60, description: "Core competencies and execution efficiency required for role" },
  { code: "PROBLEM_SOLVING", name: "Analytical Problem Solving", weight: 30, isMandatory: false, minScore: 50, description: "System design, logic, and debugging approach" },
  { code: "COMM_CULTURE", name: "Communication & Collaboration", weight: 20, isMandatory: false, minScore: 50, description: "Clarity of articulation, empathy, team fit" },
];

const fadeInSlideUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(8px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

interface VacancyOption {
  jobId: string;
  title: string;
  department?: string;
  location?: string;
  status: boolean;
}

export default function RecruitmentInterviewPlanEditor() {
  const theme = useTheme();
  const isDark = useIsDark();
  const [activeSection, setActiveSection] = useState<"scale" | "competencies" | "stages" | "all">("scale");
  const [stages, setStages] = useState<RecruitmentInterviewPlanStageCommand[]>(initialStages);
  const [ratingScale, setRatingScale] = useState<RecruitmentRatingScaleConfig>(defaultRatingScale);
  const [competencies, setCompetencies] = useState<RecruitmentCompetencyConfig[]>(initialCompetencies);
  const [hiringTargetScore, setHiringTargetScore] = useState<number>(70);
  const [missingScorePolicy, setMissingScorePolicy] = useState<string>("Exclude");

  const [scopeMode, setScopeMode] = useState<"GLOBAL" | "VACANCY">("GLOBAL");
  const [vacancyId, setVacancyId] = useState("");
  const [selectedVacancy, setSelectedVacancy] = useState<VacancyOption | null>(null);
  const [vacancies, setVacancies] = useState<VacancyOption[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch active vacancies for the search bar
  useEffect(() => {
    void getAllJobVacancies({ jobTypes: [], status: null, pageNo: 1, records: 100, search: "" })
      .then(({ data }) => {
        if (data.success) {
          const vList = (((data as any).methodResults ?? []) as JobModal[]).map((v) => ({
            jobId: v.jobId,
            title: v.title,
            department: v.department,
            location: v.location,
            status: v.status,
          }));
          setVacancies(vList);
        }
      })
      .catch(() => setVacancies([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getRecruitmentInterviewPlan(vacancyId.trim() || undefined);
      if (data.success && data.methodResult) {
        const plan = data.methodResult;
        if (plan.stages?.length) {
          setStages(
            plan.stages.map((stage) => ({
              order: stage.order,
              code: stage.code,
              name: stage.name,
              type: stage.type,
              requiredPanelSize: stage.requiredPanelSize,
              scorecardRequired: stage.scorecardRequired,
              feedbackDueHours: stage.feedbackDueHours,
              weight: stage.weight,
              passThreshold: stage.passThreshold,
              isMandatory: stage.isMandatory ?? false,
            }))
          );
        } else {
          setStages(initialStages);
        }

        if (plan.ratingScale) {
          setRatingScale({
            scaleType: plan.ratingScale.scaleType || "Numeric1To5",
            minRating: plan.ratingScale.minRating ?? 1,
            maxRating: plan.ratingScale.maxRating ?? 5,
            step: plan.ratingScale.step ?? 1,
            normalizationMethod: plan.ratingScale.normalizationMethod || "PercentageOfMax",
            levels: plan.ratingScale.levels || [],
          });
        } else {
          setRatingScale(defaultRatingScale);
        }

        if (plan.competencies?.length) {
          setCompetencies(plan.competencies);
        } else {
          setCompetencies(initialCompetencies);
        }

        setHiringTargetScore(plan.hiringTargetScore ?? 70);
        setMissingScorePolicy(plan.missingScorePolicy || "Exclude");
      } else {
        setStages(initialStages);
        setRatingScale(defaultRatingScale);
        setCompetencies(initialCompetencies);
      }
    } catch {
      toast.info("Using system interview-plan defaults.");
    } finally {
      setLoading(false);
    }
  }, [vacancyId]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateStage = (index: number, patch: Partial<RecruitmentInterviewPlanStageCommand>) =>
    setStages((current) => current.map((stage, i) => (i === index ? { ...stage, ...patch } : stage)));

  const addRound = () => {
    const nextOrder = stages.length + 1;
    setStages((current) => [
      ...current,
      {
        order: nextOrder,
        code: `round-${nextOrder}-${Date.now().toString(36).slice(-4)}`,
        name: `Round ${nextOrder} interview`,
        type: "Technical",
        requiredPanelSize: 1,
        scorecardRequired: true,
        feedbackDueHours: 24,
        passThreshold: 70,
        isMandatory: false,
      },
    ]);
  };

  const removeRound = (index: number) => {
    if (stages.length <= 1) {
      toast.warn("At least one interview round is required.");
      return;
    }
    setStages((current) =>
      current
        .filter((_, i) => i !== index)
        .map((stage, i) => ({ ...stage, order: i + 1 }))
    );
  };

  const handleScalePresetChange = (preset: string) => {
    switch (preset) {
      case "Numeric1To5":
        setRatingScale({
          scaleType: "Numeric1To5",
          minRating: 1,
          maxRating: 5,
          step: 1,
          normalizationMethod: "PercentageOfMax",
          levels: [],
        });
        break;
      case "Numeric1To10":
        setRatingScale({
          scaleType: "Numeric1To10",
          minRating: 1,
          maxRating: 10,
          step: 0.5,
          normalizationMethod: "PercentageOfMax",
          levels: [],
        });
        break;
      case "Numeric0To100":
        setRatingScale({
          scaleType: "Numeric0To100",
          minRating: 0,
          maxRating: 100,
          step: 1,
          normalizationMethod: "PercentageOfMax",
          levels: [],
        });
        break;
      case "Qualitative":
        setRatingScale({
          scaleType: "Qualitative",
          minRating: 1,
          maxRating: 5,
          step: 1,
          normalizationMethod: "PercentageOfMax",
          levels: [
            { label: "Poor", value: 1, description: "Fails to meet basic expectations" },
            { label: "Developing", value: 2, description: "Shows potential but requires mentorship" },
            { label: "Meets Expectations", value: 3, description: "Consistent and solid performer" },
            { label: "Strong", value: 4, description: "Exceeds standard requirements consistently" },
            { label: "Excellent", value: 5, description: "Mastery level, sets team benchmark" },
          ],
        });
        break;
      default:
        setRatingScale((prev) => ({ ...prev, scaleType: "CustomNumeric" }));
        break;
    }
  };

  const addCompetency = () => {
    const nextIdx = competencies.length + 1;
    setCompetencies((current) => [
      ...current,
      {
        code: `COMP_${nextIdx}_${Date.now().toString(36).slice(-3).toUpperCase()}`,
        name: `Competency ${nextIdx}`,
        weight: 0,
        isMandatory: false,
        minScore: 60,
        description: "",
      },
    ]);
  };

  const updateCompetency = (index: number, patch: Partial<RecruitmentCompetencyConfig>) =>
    setCompetencies((current) => current.map((comp, i) => (i === index ? { ...comp, ...patch } : comp)));

  const removeCompetency = (index: number) =>
    setCompetencies((current) => current.filter((_, i) => i !== index));

  const totalCompWeight = competencies.reduce((acc, c) => acc + (Number(c.weight) || 0), 0);
  const hasCompWeights = competencies.some((c) => (Number(c.weight) || 0) > 0);
  const compWeightValid = !hasCompWeights || Math.abs(totalCompWeight - 100) < 0.01;

  const save = async () => {
    if (hasCompWeights && !compWeightValid) {
      toast.error(`Competency weights sum to ${totalCompWeight}%. Total must equal 100%.`);
      return;
    }

    setSaving(true);
    try {
      const scopedVacancy = vacancyId.trim() || null;
      const { data } = await upsertRecruitmentInterviewPlan({
        name: scopedVacancy ? `Interview plan · ${scopedVacancy}` : "Company default interview plan",
        vacancyId: scopedVacancy,
        isDefault: !scopedVacancy,
        stages,
        ratingScale,
        competencies,
        hiringTargetScore,
        missingScorePolicy,
        idempotencyKey: key(),
      });
      if (!data.success) throw new Error(data.message || "Unable to save interview plan.");
      toast.success(scopedVacancy ? "Vacancy interview plan saved." : "Default interview plan saved.");
    } catch (error) {
      toast.error((error as Error).message || "Unable to save interview plan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 2.5 },
        border: "1px solid",
        borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
        borderRadius: "14px",
        bgcolor: isDark ? "rgba(30, 41, 59, 0.3)" : "background.paper",
        boxShadow: isDark ? "0 2px 10px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.02)",
        minWidth: 0,
        maxWidth: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Header bar with Scope Switcher and Actions */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        spacing={2}
        sx={{ mb: 2.5 }}
        flexWrap="wrap"
        useFlexGap
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: "12px",
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <EventNoteOutlined sx={{ fontSize: 24 }} />
          </Box>
          <Box minWidth={0}>
            <Typography variant="subtitle1" fontWeight={850} sx={{ fontSize: "1rem" }}>
              {vacancyId.trim() ? "Vacancy Interview Plan" : "Default Interview Plan"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.8rem", display: "block", mt: 0.25 }}>
              Configure rating scales, competency rubrics, passing benchmarks, and interview round gates.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1.25} alignItems="center" flexWrap="wrap" useFlexGap sx={{ width: { xs: "100%", sm: "auto" } }}>
          {/* Scope Segmented Pill Switcher */}
          <Box
            sx={{
              display: "flex",
              p: 0.5,
              borderRadius: "10px",
              bgcolor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9",
              border: "1px solid",
              borderColor: isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0",
            }}
          >
            <ButtonBase
              onClick={() => {
                setScopeMode("GLOBAL");
                setVacancyId("");
                setSelectedVacancy(null);
              }}
              sx={{
                px: 1.5,
                py: 0.65,
                borderRadius: "7px",
                fontSize: "0.76rem",
                fontWeight: 750,
                bgcolor: scopeMode === "GLOBAL" ? (isDark ? "primary.main" : "#FFFFFF") : "transparent",
                color: scopeMode === "GLOBAL" ? (isDark ? "#FFFFFF" : "primary.main") : "text.secondary",
                boxShadow: scopeMode === "GLOBAL" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              Company Default
            </ButtonBase>
            <ButtonBase
              onClick={() => setScopeMode("VACANCY")}
              sx={{
                px: 1.5,
                py: 0.65,
                borderRadius: "7px",
                fontSize: "0.76rem",
                fontWeight: 750,
                bgcolor: scopeMode === "VACANCY" ? (isDark ? "primary.main" : "#FFFFFF") : "transparent",
                color: scopeMode === "VACANCY" ? (isDark ? "#FFFFFF" : "primary.main") : "text.secondary",
                boxShadow: scopeMode === "VACANCY" ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              Vacancy-Specific
            </ButtonBase>
          </Box>

          <AppButton
            variant="outlined"
            size="small"
            onClick={() => void load()}
            disabled={saving || loading}
            sx={{ flex: { xs: 1, sm: "none" }, height: 36, px: 2, fontSize: "0.8rem", fontWeight: 650, borderRadius: "9px" }}
          >
            Load plan
          </AppButton>
          <AppButton
            variant="contained"
            size="small"
            onClick={() => void save()}
            disabled={saving || loading || (hasCompWeights && !compWeightValid)}
            sx={{ flex: { xs: 1, sm: "none" }, height: 36, px: 2.25, fontSize: "0.8rem", fontWeight: 750, borderRadius: "9px" }}
          >
            {loading ? "Loading…" : saving ? "Saving…" : "Save plan"}
          </AppButton>
        </Stack>
      </Stack>

      {/* Vacancy Search Bar (Displayed when Vacancy-Specific is chosen) */}
      {scopeMode === "VACANCY" && (
        <Box
          sx={{
            mb: 2.5,
            p: 2,
            borderRadius: "12px",
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0",
            bgcolor: isDark ? "rgba(15,23,42,0.3)" : "#F8FAFC",
          }}
        >
          <Autocomplete
            freeSolo
            size="small"
            options={vacancies}
            value={selectedVacancy || (vacancyId ? { jobId: vacancyId, title: vacancyId, status: true } : null)}
            onChange={(_, newValue) => {
              if (!newValue) {
                setSelectedVacancy(null);
                setVacancyId("");
              } else if (typeof newValue === "string") {
                setSelectedVacancy(null);
                setVacancyId(newValue);
              } else {
                setSelectedVacancy(newValue);
                setVacancyId(newValue.jobId);
              }
            }}
            getOptionLabel={(option) =>
              typeof option === "string"
                ? option
                : `${option.title} (${option.jobId})${option.department ? ` · ${option.department}` : ""}`
            }
            renderInput={(params) => (
              <AppTextField
                {...params}
                label="Search Job Vacancy"
                placeholder="Search by job title, position code, or department..."
                helperText="Select a job vacancy to create or edit its dedicated evaluation plan."
                fullWidth
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
              />
            )}
          />
        </Box>
      )}

      {/* Clean Secondary Navigation Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={activeSection}
          onChange={(_, val) => setActiveSection(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 750,
              fontSize: "0.84rem",
              minHeight: 44,
              py: 1,
              px: { xs: 1.5, sm: 2.25 },
              gap: 1,
              color: "text.secondary",
              "&.Mui-selected": {
                color: "primary.main",
              },
            },
            "& .MuiTabs-indicator": {
              height: 3,
              borderRadius: "3px 3px 0 0",
            },
          }}
        >
          <Tab value="scale" icon={<TuneRounded sx={{ fontSize: 18 }} />} iconPosition="start" label="1. Rating Scale & Benchmark" />
          <Tab value="competencies" icon={<PsychologyRounded sx={{ fontSize: 18 }} />} iconPosition="start" label={`2. Competencies (${competencies.length})`} />
          <Tab value="stages" icon={<LayersRounded sx={{ fontSize: 18 }} />} iconPosition="start" label={`3. Interview Stages (${stages.length})`} />
          <Tab value="all" label={activeSection === "all" ? "Single View" : "View All Sections"} sx={{ ml: "auto" }} />
        </Tabs>
      </Box>

      {/* Section 1: Rating Scale & Scoring Engine Settings */}
      {(activeSection === "scale" || activeSection === "all") && (
        <Box sx={{ mb: 4, animation: `${fadeInSlideUp} 0.3s ease` }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2 }}>
            <TuneRounded sx={{ fontSize: 20, color: "primary.main" }} />
            <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.96rem" }}>
              Rating Scale & Benchmark Scoring Engine
            </Typography>
            <Chip
              size="small"
              label={`${ratingScale.minRating}–${ratingScale.maxRating} (${ratingScale.scaleType})`}
              color="primary"
              variant="outlined"
              sx={{ height: 22, fontSize: "0.7rem", fontWeight: 750, borderRadius: "6px" }}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2.5, fontSize: "0.78rem" }}>
            Configure standard numerical or qualitative rubrics, normalization formulas, and minimum benchmark passing targets.
          </Typography>

          <Grid container spacing={2.5}>
            {/* Row 1: Scale Type & Normalization Formula */}
            <Grid size={{ xs: 12, md: 6 }}>
              <AppTextField
                select
                label="Scale Type / Preset"
                value={ratingScale.scaleType}
                onChange={(e) => handleScalePresetChange(e.target.value)}
                fullWidth
              >
                <MenuItem value="Numeric1To5">Numeric 1–5 (Standard HRMS)</MenuItem>
                <MenuItem value="Numeric1To10">Numeric 1–10 (Granular)</MenuItem>
                <MenuItem value="Numeric0To100">Percentage 0–100 (Direct)</MenuItem>
                <MenuItem value="Qualitative">Qualitative Labels (Mapped)</MenuItem>
                <MenuItem value="CustomNumeric">Custom Range & Step</MenuItem>
              </AppTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AppTextField
                select
                label="Normalization Formula"
                value={ratingScale.normalizationMethod}
                onChange={(e) => setRatingScale((s) => ({ ...s, normalizationMethod: e.target.value as any }))}
                helperText={ratingScale.normalizationMethod === "PercentageOfMax" ? "Formula: (Rating / Max) × 100" : "Formula: ((Rating - Min) / Range) × 100"}
                fullWidth
              >
                <MenuItem value="PercentageOfMax">Percentage of Max</MenuItem>
                <MenuItem value="MinMaxPercentage">Min-Max Percentage</MenuItem>
              </AppTextField>
            </Grid>

            {/* Row 2: Missing Score Policy & Benchmark Target */}
            <Grid size={{ xs: 12, md: 6 }}>
              <AppTextField
                select
                label="Missing Score Policy"
                value={missingScorePolicy}
                helperText="How unassessed competencies are treated in candidate debrief."
                onChange={(e) => setMissingScorePolicy(e.target.value)}
                fullWidth
              >
                <MenuItem value="Exclude">Exclude from denominator</MenuItem>
                <MenuItem value="Zero">Score as Zero (Mandatory failure)</MenuItem>
                <MenuItem value="Block">Block debrief until complete</MenuItem>
              </AppTextField>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <AppTextField
                label="Hiring Target Benchmark (%)"
                type="number"
                value={hiringTargetScore}
                inputProps={{ min: 1, max: 100 }}
                helperText="Minimum overall benchmark score required to recommend Hire."
                onChange={(e) => setHiringTargetScore(Math.max(1, Math.min(100, Number(e.target.value) || 70)))}
                fullWidth
              >
              </AppTextField>
            </Grid>

            {/* Row 3: Numerical Bounds */}
            <Grid size={{ xs: 12, sm: 4 }}>
              <AppTextField
                label="Min Rating"
                type="number"
                value={ratingScale.minRating}
                disabled={ratingScale.scaleType !== "CustomNumeric"}
                onChange={(e) => setRatingScale((s) => ({ ...s, minRating: Number(e.target.value) }))}
                helperText={ratingScale.scaleType === "CustomNumeric" ? "Custom minimum score" : "Preset-locked"}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <AppTextField
                label="Max Rating"
                type="number"
                value={ratingScale.maxRating}
                disabled={ratingScale.scaleType !== "CustomNumeric"}
                onChange={(e) => setRatingScale((s) => ({ ...s, maxRating: Number(e.target.value) }))}
                helperText={ratingScale.scaleType === "CustomNumeric" ? "Custom maximum score" : "Preset-locked"}
                fullWidth
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <AppTextField
                label="Increment Step"
                type="number"
                value={ratingScale.step}
                disabled={ratingScale.scaleType !== "CustomNumeric"}
                inputProps={{ step: "0.1", min: "0.1" }}
                onChange={(e) => setRatingScale((s) => ({ ...s, step: Number(e.target.value) }))}
                helperText={ratingScale.scaleType === "CustomNumeric" ? "Custom increment step" : "Preset-locked"}
                fullWidth
              />
            </Grid>
          </Grid>
        </Box>
      )}

      {/* Section 2: Competency Framework */}
      {(activeSection === "competencies" || activeSection === "all") && (
        <Box sx={{ mb: 4, animation: `${fadeInSlideUp} 0.3s ease` }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }} flexWrap="wrap" gap={1}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <PsychologyRounded sx={{ fontSize: 20, color: "primary.main" }} />
              <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.96rem" }}>
                Competency Framework ({competencies.length} configured)
              </Typography>
              {hasCompWeights && (
                <Chip
                  size="small"
                  label={`Weights Total: ${totalCompWeight}%`}
                  color={compWeightValid ? "success" : "error"}
                  sx={{ height: 22, fontSize: "0.7rem", fontWeight: 800, borderRadius: "6px" }}
                />
              )}
            </Stack>
            <AppButton
              size="small"
              variant="outlined"
              startIcon={<AddRounded sx={{ fontSize: 16 }} />}
              onClick={addCompetency}
              sx={{ height: 32, fontSize: "0.78rem", fontWeight: 700, borderRadius: "8px" }}
            >
              Add Competency
            </AppButton>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, fontSize: "0.78rem" }}>
            Assign skill evaluation criteria with individual percentage weights and minimum passing cutoffs.
          </Typography>

          {/* Visual Weight Progress Bar */}
          {hasCompWeights && (
            <Box sx={{ mb: 2.5, p: 1.75, borderRadius: "10px", bgcolor: isDark ? "rgba(15, 23, 42, 0.3)" : "#F1F5F9" }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={750} sx={{ fontSize: "0.76rem" }}>
                  Total Competency Weight Allocation (Must Equal 100%):
                </Typography>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color={compWeightValid ? "success.main" : "error.main"}
                  sx={{ fontSize: "0.78rem" }}
                >
                  {totalCompWeight}% / 100%
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, totalCompWeight)}
                color={compWeightValid ? "success" : totalCompWeight > 100 ? "error" : "warning"}
                sx={{ height: 7, borderRadius: 3.5 }}
              />
            </Box>
          )}

          {hasCompWeights && !compWeightValid && (
            <Alert severity="warning" sx={{ mb: 2, py: 0.5, fontSize: "0.78rem", borderRadius: "8px" }}>
              Competency weights currently sum to <strong>{totalCompWeight}%</strong>. Total must equal 100% to save.
            </Alert>
          )}

          <Stack spacing={2}>
            {competencies.map((comp, idx) => (
              <Box
                key={comp.code || idx}
                sx={{
                  p: { xs: 1.75, sm: 2.25 },
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  bgcolor: isDark ? "rgba(15, 23, 42, 0.2)" : "#F8FAFC",
                  transition: "all 0.2s ease",
                  "&:hover": { borderColor: "primary.main" },
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  {/* Row 1: Competency Name, Code, and Remove Action */}
                  <Grid size={{ xs: 12, sm: 7, md: 8 }}>
                    <AppTextField
                      label="Competency Name *"
                      size="small"
                      value={comp.name}
                      onChange={(e) => updateCompetency(idx, { name: e.target.value })}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 9, sm: 4, md: 3 }}>
                    <AppTextField
                      label="Code *"
                      size="small"
                      value={comp.code}
                      onChange={(e) => updateCompetency(idx, { code: e.target.value.toUpperCase() })}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 3, sm: 1, md: 1 }} textAlign="right">
                    <IconButton size="small" color="error" onClick={() => removeCompetency(idx)} sx={{ p: 0.75 }}>
                      <DeleteOutlineRounded sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Grid>

                  {/* Row 2: Weight, Min Passing Score, and Mandatory Gate */}
                  <Grid size={{ xs: 6, sm: 3, md: 3 }}>
                    <AppTextField
                      label="Weight (%)"
                      type="number"
                      size="small"
                      value={comp.weight}
                      onChange={(e) => updateCompetency(idx, { weight: Number(e.target.value) || 0 })}
                      inputProps={{ min: 0, max: 100 }}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 6, sm: 3, md: 3 }}>
                    <AppTextField
                      label="Min Passing Score (%)"
                      type="number"
                      size="small"
                      value={comp.minScore ?? 60}
                      onChange={(e) => updateCompetency(idx, { minScore: Number(e.target.value) || 0 })}
                      inputProps={{ min: 0, max: 100 }}
                      fullWidth
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6, md: 6 }}>
                    <Stack direction="row" alignItems="center" spacing={1.25} sx={{ height: "100%", pt: { xs: 0.5, sm: 0 } }}>
                      <AppSwitch
                        checked={comp.isMandatory}
                        onChange={(e) => updateCompetency(idx, { isMandatory: e.target.checked })}
                      />
                      <Typography variant="caption" fontWeight={750} color={comp.isMandatory ? "error.main" : "text.secondary"} sx={{ fontSize: "0.78rem" }}>
                        {comp.isMandatory ? "Mandatory Gate (failure blocks Hire recommendation)" : "Optional Competency (weighted towards average)"}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Section 3: Interview Stages & Round Gates */}
      {(activeSection === "stages" || activeSection === "all") && (
        <Box sx={{ animation: `${fadeInSlideUp} 0.3s ease` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }} flexWrap="wrap" gap={1}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <LayersRounded sx={{ fontSize: 20, color: "primary.main" }} />
              <Typography variant="subtitle2" fontWeight={850} sx={{ fontSize: "0.96rem" }}>
                Interview Stages & Round Gates ({stages.length} configured)
              </Typography>
            </Stack>
            <AppButton
              size="small"
              variant="outlined"
              startIcon={<AddRounded sx={{ fontSize: 16 }} />}
              onClick={addRound}
              disabled={saving || loading}
              sx={{ height: 32, fontSize: "0.78rem", fontWeight: 700, borderRadius: "8px" }}
            >
              Add Round
            </AppButton>
          </Stack>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2, fontSize: "0.78rem" }}>
            Sequential interview rounds, required panel quorum sizes, passing score thresholds, and SLA feedback turnaround deadlines.
          </Typography>

          <Stack spacing={2}>
            {stages.map((stage, index) => (
              <Box
                key={stage.code || index}
                sx={{
                  p: { xs: 1.75, sm: 2.25 },
                  borderRadius: "12px",
                  border: "1px solid",
                  borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
                  bgcolor: isDark ? "rgba(15, 23, 42, 0.2)" : "#F8FAFC",
                  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    borderColor: theme.palette.primary.main,
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      label={`Round ${stage.order}`}
                      color="primary"
                      sx={{ height: 22, fontWeight: 750, fontSize: "0.7rem", borderRadius: "5px" }}
                    />
                    <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.86rem" }}>
                      {stage.name || `Round ${stage.order}`}
                    </Typography>
                    {stage.isMandatory && (
                      <Chip
                        size="small"
                        label="Mandatory Gate"
                        color="error"
                        variant="outlined"
                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 750 }}
                      />
                    )}
                  </Stack>
                  {stages.length > 1 && (
                    <AppButton
                      size="small"
                      variant="text"
                      color="error"
                      startIcon={<DeleteOutlineRounded sx={{ fontSize: 15 }} />}
                      onClick={() => removeRound(index)}
                      sx={{ height: 26, fontSize: "0.74rem", fontWeight: 650, p: 0.5 }}
                    >
                      Remove
                    </AppButton>
                  )}
                </Stack>

                <Grid container spacing={2}>
                  {/* Row 1: Stage Name & Interview Type */}
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <AppTextField
                      label="Stage / Round Name"
                      value={stage.name}
                      onChange={(event) => updateStage(index, { name: event.target.value })}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <AppTextField
                      label="Interview Type"
                      value={stage.type ?? ""}
                      placeholder="e.g., Technical, HR, Cultural"
                      onChange={(event) => updateStage(index, { type: event.target.value })}
                      fullWidth
                    />
                  </Grid>

                  {/* Row 2: Four Balanced Metric Inputs */}
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <AppTextField
                      label="Panel Size"
                      type="number"
                      value={stage.requiredPanelSize}
                      onChange={(event) =>
                        updateStage(index, { requiredPanelSize: Math.max(1, Number(event.target.value) || 1) })
                      }
                      inputProps={{ min: 1, max: 20 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <AppTextField
                      label="Pass Score (%)"
                      type="number"
                      value={stage.passThreshold ?? 70}
                      onChange={(event) =>
                        updateStage(index, { passThreshold: Math.max(0, Math.min(100, Number(event.target.value) || 0)) })
                      }
                      inputProps={{ min: 0, max: 100 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <AppTextField
                      label="Weight (%)"
                      type="number"
                      value={stage.weight ?? ""}
                      placeholder="Optional"
                      onChange={(event) =>
                        updateStage(index, { weight: event.target.value ? Number(event.target.value) : null })
                      }
                      inputProps={{ min: 0, max: 100 }}
                      fullWidth
                    />
                  </Grid>
                  <Grid size={{ xs: 6, sm: 3 }}>
                    <AppTextField
                      label="Feedback SLA (hrs)"
                      type="number"
                      value={stage.feedbackDueHours}
                      onChange={(event) =>
                        updateStage(index, { feedbackDueHours: Math.max(1, Number(event.target.value) || 1) })
                      }
                      inputProps={{ min: 1, max: 720 }}
                      fullWidth
                    />
                  </Grid>
                </Grid>

                <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "flex-start", sm: "center" }} spacing={{ xs: 1.25, sm: 3 }} sx={{ mt: 1.5 }}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AppSwitch
                      checked={stage.scorecardRequired}
                      onChange={(event) => updateStage(index, { scorecardRequired: event.target.checked })}
                      inputProps={{ "aria-label": `Scorecard required for round ${stage.order}` }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, fontSize: "0.78rem" }}>
                      Scorecard required before debrief & progression
                    </Typography>
                  </Stack>

                  <Stack direction="row" alignItems="center" spacing={1}>
                    <AppSwitch
                      checked={stage.isMandatory ?? false}
                      onChange={(event) => updateStage(index, { isMandatory: event.target.checked })}
                      inputProps={{ "aria-label": `Mandatory round ${stage.order}` }}
                    />
                    <Typography variant="caption" color={stage.isMandatory ? "error.main" : "text.secondary"} sx={{ fontWeight: 650, fontSize: "0.78rem" }}>
                      Mandatory Gate (failure blocks Hire recommendation)
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            ))}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
