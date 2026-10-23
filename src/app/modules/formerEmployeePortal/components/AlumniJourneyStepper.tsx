import {
  AssignmentTurnedInRounded,
  CheckCircleRounded,
  DescriptionRounded,
  EngineeringRounded,
  PaidRounded,
  RadioButtonUncheckedRounded,
} from "@mui/icons-material";
import {
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

type Props = {
  status: string;
  lastWorkingDate: string;
};

const formatDate = (value?: string) =>
  value
    ? new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "Completed";

export const AlumniJourneyStepper = ({ status, lastWorkingDate }: Props) => {
  const isCompleted = status.toLowerCase() === "completed";
  const progressPercent = isCompleted ? 100 : 75;

  const steps = [
    {
      label: "Separation Formalities",
      description: "Notice period & handover initiated",
      status: "completed",
      icon: <AssignmentTurnedInRounded fontSize="small" />,
      date: "Completed",
    },
    {
      label: "Department Clearances",
      description: "IT assets, library, and admin sign-offs",
      status: "completed",
      icon: <EngineeringRounded fontSize="small" />,
      date: "Approved",
    },
    {
      label: "Full & Final Settlement",
      description: "Payroll, gratuity, and final dues",
      status: isCompleted ? "completed" : "current",
      icon: <PaidRounded fontSize="small" />,
      date: isCompleted ? "Settled" : "In Review",
    },
    {
      label: "Alumni Document Vault",
      description: "Official letters issued & digital portal access",
      status: "completed",
      icon: <DescriptionRounded fontSize="small" />,
      date: formatDate(lastWorkingDate),
    },
  ];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2.5, sm: 3 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={1}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography variant="h6" fontWeight={800} sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}>
            Offboarding & Transition Journey
          </Typography>
          <Typography variant="body2" color="text.secondary">
            End-to-end timeline of your transition into the alumni network
          </Typography>
        </Box>
        <Chip
          label={isCompleted ? "All Steps Finalized" : "Settlement in Progress"}
          color={isCompleted ? "success" : "info"}
          size="small"
          sx={{ fontWeight: 750, alignSelf: { xs: "flex-start", sm: "center" } }}
        />
      </Stack>

      <Box sx={{ mb: 3 }}>
        <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.75 }}>
          <Typography variant="caption" fontWeight={700} color="text.secondary">
            Journey Completion
          </Typography>
          <Typography variant="caption" fontWeight={800} color="primary.main">
            {progressPercent}% Complete
          </Typography>
        </Stack>
        <LinearProgress
          variant="determinate"
          value={progressPercent}
          sx={{
            height: 8,
            borderRadius: 4,
            bgcolor: "action.hover",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              background: "linear-gradient(90deg, #0d9488, #10b981)",
            },
          }}
        />
      </Box>

      {/* Steps layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" },
          gap: 2,
          position: "relative",
        }}
      >
        {steps.map((step, index) => {
          const isDone = step.status === "completed";
          return (
            <Box
              key={step.label}
              sx={{
                p: 2,
                borderRadius: 3,
                border: "1px solid",
                borderColor: isDone ? "rgba(13, 148, 136, 0.25)" : "divider",
                bgcolor: isDone
                  ? "color-mix(in srgb, var(--mui-palette-success-main, #10b981) 4%, var(--mui-palette-background-paper))"
                  : "action.hover",
                position: "relative",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    display: "grid",
                    placeItems: "center",
                    bgcolor: isDone ? "#0d9488" : "action.disabledBackground",
                    color: isDone ? "white" : "text.secondary",
                  }}
                >
                  {isDone ? <CheckCircleRounded sx={{ fontSize: 18 }} /> : <RadioButtonUncheckedRounded sx={{ fontSize: 18 }} />}
                </Box>
                <Chip
                  size="small"
                  label={step.date}
                  sx={{
                    fontSize: "0.7rem",
                    height: 20,
                    fontWeight: 700,
                    bgcolor: isDone ? "rgba(13, 148, 136, 0.12)" : "action.selected",
                    color: isDone ? "#0f766e" : "text.secondary",
                  }}
                />
              </Stack>

              <Box>
                <Typography variant="subtitle2" fontWeight={800} sx={{ lineHeight: 1.3 }}>
                  {index + 1}. {step.label}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", lineHeight: 1.35 }}>
                  {step.description}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Paper>
  );
};
