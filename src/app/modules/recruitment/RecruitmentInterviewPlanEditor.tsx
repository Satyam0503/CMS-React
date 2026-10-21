import { useCallback, useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Card,
  Chip,
  Divider,
  Grid,
  InputAdornment,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import EventNoteOutlined from "@mui/icons-material/EventNoteOutlined";
import AddRounded from "@mui/icons-material/AddRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import SearchRounded from "@mui/icons-material/SearchRounded";
import { AppButton, AppSwitch, AppTextField } from "../../shared/components/ui";
import { toast } from "react-toastify";
import { getAllJobVacancies, getRecruitmentInterviewPlan, upsertRecruitmentInterviewPlan } from "./services";
import { JobModal, RecruitmentInterviewPlanStageCommand } from "./models";
import { useIsDark } from "../theme/useIsDark";

const key = () => `${Date.now()}-${Math.random().toString(36).slice(2)}-interview-plan`;
const initial: RecruitmentInterviewPlanStageCommand[] = [
  { order: 1, code: "technical", name: "Technical interview", type: "Technical", requiredPanelSize: 1, scorecardRequired: true, feedbackDueHours: 24 },
  { order: 2, code: "hr", name: "HR interview", type: "HR", requiredPanelSize: 1, scorecardRequired: true, feedbackDueHours: 24 },
];

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
  const [stages, setStages] = useState(initial);
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
      if (data.success && data.methodResult?.stages?.length) {
        setStages(
          data.methodResult.stages.map((stage) => ({
            order: stage.order,
            code: stage.code,
            name: stage.name,
            type: stage.type,
            requiredPanelSize: stage.requiredPanelSize,
            scorecardRequired: stage.scorecardRequired,
            feedbackDueHours: stage.feedbackDueHours,
          }))
        );
      } else {
        setStages(initial);
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

  const update = (index: number, patch: Partial<RecruitmentInterviewPlanStageCommand>) =>
    setStages((current) => current.map((stage, i) => (i === index ? { ...stage, ...patch } : stage)));

  const addRound = () => {
    const nextOrder = stages.length + 1;
    setStages((current) => [
      ...current,
      {
        order: nextOrder,
        code: `round-${nextOrder}-${Date.now().toString(36).slice(-4)}`,
        name: `Round ${nextOrder} interview`,
        type: "General",
        requiredPanelSize: 1,
        scorecardRequired: true,
        feedbackDueHours: 24,
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

  const save = async () => {
    setSaving(true);
    try {
      const scopedVacancy = vacancyId.trim() || null;
      const { data } = await upsertRecruitmentInterviewPlan({
        name: scopedVacancy ? `Interview plan · ${scopedVacancy}` : "Company default interview plan",
        vacancyId: scopedVacancy,
        isDefault: !scopedVacancy,
        stages,
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
              width: 38,
              height: 38,
              borderRadius: "10px",
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              flexShrink: 0,
            }}
          >
            <EventNoteOutlined sx={{ fontSize: 20 }} />
          </Box>
          <Box minWidth={0}>
            <Typography variant="subtitle1" fontWeight={800} sx={{ fontSize: "0.95rem" }}>
              {vacancyId.trim() ? "Vacancy interview plan" : "Default interview plan"}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
              Define rounds, feedback SLAs, and panel sizes. Enter a vacancy ID to override defaults for a specific job.
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
          <AppButton
            variant="outlined"
            size="small"
            onClick={() => void load()}
            disabled={saving || loading}
            sx={{ flex: { xs: 1, sm: "none" }, height: 34, fontSize: "0.78rem", fontWeight: 650, borderRadius: "8px" }}
          >
            Load plan
          </AppButton>
          <AppButton
            variant="contained"
            size="small"
            onClick={() => void save()}
            disabled={saving || loading}
            sx={{ flex: { xs: 1, sm: "none" }, height: 34, fontSize: "0.78rem", fontWeight: 700, borderRadius: "8px" }}
          >
            {loading ? "Loading…" : saving ? "Saving…" : "Save plan"}
          </AppButton>
        </Stack>
      </Stack>

      <Box
        sx={{
          mt: 2,
          p: 1.5,
          borderRadius: "10px",
          border: "1px solid",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
          bgcolor: isDark ? "rgba(15, 23, 42, 0.3)" : "#F8FAFC",
        }}
      >
        <Stack spacing={1.25}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Box>
              <Typography variant="body2" fontWeight={800} sx={{ fontSize: "0.82rem" }}>
                Plan Scope
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.74rem" }}>
                Apply this interview structure across all positions or customize stages for a specific vacancy.
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              <Chip
                label="Company Default"
                onClick={() => {
                  setScopeMode("GLOBAL");
                  setVacancyId("");
                  setSelectedVacancy(null);
                }}
                color={scopeMode === "GLOBAL" ? "primary" : "default"}
                variant={scopeMode === "GLOBAL" ? "filled" : "outlined"}
                size="small"
                sx={{ fontWeight: 700, borderRadius: "6px" }}
              />
              <Chip
                label="Vacancy-Specific"
                onClick={() => setScopeMode("VACANCY")}
                color={scopeMode === "VACANCY" ? "primary" : "default"}
                variant={scopeMode === "VACANCY" ? "filled" : "outlined"}
                size="small"
                sx={{ fontWeight: 700, borderRadius: "6px" }}
              />
            </Stack>
          </Stack>

          {scopeMode === "VACANCY" && (
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
                  helperText="Search active positions or type a custom vacancy code to tailor this interview plan."
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
              renderOption={(props, option) => (
                <Box component="li" {...props} key={typeof option === "string" ? option : option.jobId} sx={{ py: 0.75 }}>
                  {typeof option === "string" ? (
                    <Typography variant="body2">{option}</Typography>
                  ) : (
                    <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" width="100%">
                      <Box minWidth={0}>
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {option.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {option.jobId} {option.department ? `· ${option.department}` : ""}
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
                  )}
                </Box>
              )}
            />
          )}
        </Stack>
      </Box>

      <Divider sx={{ my: 2 }} />

      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={0.5}>
            Interview Stages ({stages.length} configured)
          </Typography>
          <AppButton
            size="small"
            variant="outlined"
            startIcon={<AddRounded sx={{ fontSize: 16 }} />}
            onClick={addRound}
            disabled={saving || loading}
            sx={{ height: 28, fontSize: "0.74rem", fontWeight: 700, borderRadius: "6px" }}
          >
            Add round
          </AppButton>
        </Stack>

        {stages.map((stage, index) => (
          <Box
            key={stage.code || index}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: "12px",
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
              bgcolor: isDark ? "rgba(15, 23, 42, 0.3)" : "#F8FAFC",
              transition: "border-color 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "#CBD5E1",
              },
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
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
              </Stack>
              {stages.length > 1 && (
                <AppButton
                  size="small"
                  variant="text"
                  color="error"
                  startIcon={<DeleteOutlineRounded sx={{ fontSize: 15 }} />}
                  onClick={() => removeRound(index)}
                  sx={{ height: 24, fontSize: "0.72rem", fontWeight: 650, p: 0.5 }}
                >
                  Remove
                </AppButton>
              )}
            </Stack>

            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <AppTextField
                  label="Stage / Round name"
                  value={stage.name}
                  onChange={(event) => update(index, { name: event.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <AppTextField
                  label="Interview type"
                  value={stage.type ?? ""}
                  placeholder="e.g., Technical, HR, Cultural"
                  onChange={(event) => update(index, { type: event.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
                <AppTextField
                  label="Panel size"
                  type="number"
                  value={stage.requiredPanelSize}
                  onChange={(event) =>
                    update(index, { requiredPanelSize: Math.max(1, Number(event.target.value) || 1) })
                  }
                  inputProps={{ min: 1, max: 20 }}
                  fullWidth
                />
              </Grid>
              <Grid size={{ xs: 6, sm: 6, md: 2.5 }}>
                <AppTextField
                  label="Feedback SLA (hours)"
                  type="number"
                  value={stage.feedbackDueHours}
                  onChange={(event) =>
                    update(index, { feedbackDueHours: Math.max(1, Number(event.target.value) || 1) })
                  }
                  inputProps={{ min: 1, max: 720 }}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 1.25 }}>
              <AppSwitch
                checked={stage.scorecardRequired}
                onChange={(event) => update(index, { scorecardRequired: event.target.checked })}
                inputProps={{ "aria-label": `Scorecard required for round ${stage.order}` }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                Scorecard required before debrief & progression
              </Typography>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}
