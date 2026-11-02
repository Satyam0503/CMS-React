import { useState } from "react";
import {
  Box,
  Button,
  Card,
  Chip,
  Collapse,
  Grid,
  Stack,
  Typography,
  alpha,
  useTheme,
} from "@mui/material";
import AccountBalanceOutlined from "@mui/icons-material/AccountBalanceOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import LightbulbOutlined from "@mui/icons-material/LightbulbOutlined";
import PaymentsOutlined from "@mui/icons-material/PaymentsOutlined";
import PlayCircleOutlineRounded from "@mui/icons-material/PlayCircleOutlineRounded";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import TuneRounded from "@mui/icons-material/TuneRounded";
import { useIsDark } from "../../theme/useIsDark";
import type { StatutoryProfile } from "./PayrollConfigurationPanel";

type Props = {
  activeTab: "policy" | "components" | "groups" | "templates" | "assignments";
  onTabChange: (tab: "policy" | "components" | "groups" | "templates" | "assignments") => void;
  activeApprovedProfile: StatutoryProfile | null;
  componentsCount: number;
  activeComponentsCount: number;
  groupsCount: number;
  templatesCount: number;
  assignmentsCount: number;
};

export function PayrollWorkflowBlueprint({
  activeTab,
  onTabChange,
  activeApprovedProfile,
  componentsCount,
  activeComponentsCount,
  groupsCount,
  templatesCount,
  assignmentsCount,
}: Props) {
  const theme = useTheme();
  const isDark = useIsDark();
  const [expanded, setExpanded] = useState(true);

  const steps = [
    {
      id: "policy" as const,
      stepNumber: "1",
      title: "Statutory & Divisor Rules",
      shortLabel: "1. Statutory Rules",
      icon: <AccountBalanceOutlined sx={{ fontSize: 18 }} />,
      tag: "Legal Foundation",
      description: "EPF (12%), ESIC (0.75%), TDS tax regime, daily rate divisor, & attendance freeze lock.",
      status: activeApprovedProfile ? `Active: v${activeApprovedProfile.version || 1}` : "Drafting required",
      statusColor: activeApprovedProfile ? ("success" as const) : ("warning" as const),
      badgeText: activeApprovedProfile ? "Configured" : "Action Needed",
    },
    {
      id: "components" as const,
      stepNumber: "2",
      title: "Salary Components",
      shortLabel: "2. Salary Components",
      icon: <PaymentsOutlined sx={{ fontSize: 18 }} />,
      tag: "Pay Building Blocks",
      description: "Basic Pay, HRA, Conveyance, Allowances, & Deductions (Fixed, % Gross, or % Base).",
      status: `${activeComponentsCount} Active (${componentsCount} Total)`,
      statusColor: activeComponentsCount > 0 ? ("primary" as const) : ("default" as const),
      badgeText: `${activeComponentsCount} heads`,
    },
    {
      id: "groups" as const,
      stepNumber: "3A",
      title: "Pay Groups",
      shortLabel: "3A. Pay Groups",
      icon: <GroupsOutlined sx={{ fontSize: 18 }} />,
      tag: "Employee Cohorts",
      description: "Group staff with shared payroll schedules, working hours, and compliance overrides.",
      status: `${groupsCount} Configured`,
      statusColor: groupsCount > 0 ? ("info" as const) : ("default" as const),
      badgeText: `${groupsCount} groups`,
    },
    {
      id: "templates" as const,
      stepNumber: "3B",
      title: "Salary Templates",
      shortLabel: "3B. Salary Templates",
      icon: <ReceiptLongOutlined sx={{ fontSize: 18 }} />,
      tag: "Packaged Structures",
      description: "Package components into reusable compensation structures for easy assignment.",
      status: `${templatesCount} Configured`,
      statusColor: templatesCount > 0 ? ("info" as const) : ("default" as const),
      badgeText: `${templatesCount} packages`,
    },
    {
      id: "assignments" as const,
      stepNumber: "4",
      title: "Employee Assignments",
      shortLabel: "4. Staff Assignment",
      icon: <BadgeOutlined sx={{ fontSize: 18 }} />,
      tag: "Live Mapping",
      description: "Bind employees to a Pay Group, Template, and Policy. Ready for monthly execution.",
      status: `${assignmentsCount} Assigned`,
      statusColor: assignmentsCount > 0 ? ("success" as const) : ("default" as const),
      badgeText: `${assignmentsCount} staff`,
    },
  ];

  return (
    <Card
      elevation={0}
      sx={{
        mb: 2.5,
        borderRadius: "16px",
        border: "1px solid",
        borderColor: isDark ? "rgba(11, 92, 171, 0.3)" : "rgba(11, 92, 171, 0.18)",
        bgcolor: isDark
          ? "linear-gradient(180deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.7) 100%)"
          : "linear-gradient(180deg, rgba(240, 249, 255, 0.6) 0%, #FFFFFF 100%)",
        boxShadow: isDark
          ? "0 4px 20px rgba(0, 0, 0, 0.25)"
          : "0 2px 12px rgba(11, 92, 171, 0.05)",
        overflow: "hidden",
      }}
    >
      {/* Blueprint Header */}
      <Box
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1.5,
          borderBottom: expanded ? "1px solid" : "none",
          borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(226, 232, 240, 0.9)",
          bgcolor: isDark ? "rgba(11, 92, 171, 0.08)" : "rgba(11, 92, 171, 0.03)",
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 30,
              height: 30,
              borderRadius: "8px",
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: "primary.main",
            }}
          >
            <LightbulbOutlined sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={750} sx={{ fontSize: "0.9rem", color: "text.primary" }}>
              How Payroll Configuration Connects Together
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.76rem" }}>
              Interactive Architecture · Click any module step to configure or jump to its settings
            </Typography>
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center">
          <Button
            size="small"
            variant="text"
            onClick={() => setExpanded(!expanded)}
            endIcon={expanded ? <ExpandLessRounded /> : <ExpandMoreRounded />}
            sx={{
              textTransform: "none",
              fontSize: "0.78rem",
              fontWeight: 700,
              color: "primary.main",
              px: 1.25,
              py: 0.5,
              borderRadius: "8px",
            }}
          >
            {expanded ? "Hide Architecture Flow" : "Show Architecture Flow"}
          </Button>
        </Stack>
      </Box>

      {/* Blueprint Steps Content */}
      <Collapse in={expanded}>
        <Box sx={{ p: { xs: 1.75, sm: 2.25 } }}>
          <Grid container spacing={1.5} alignItems="stretch">
            {steps.map((step) => {
              const isSelected = activeTab === step.id;
              return (
                <Grid key={step.id} size={{ xs: 12, sm: 6, md: 4, lg: 2.4 }}>
                  <Box
                    onClick={() => onTabChange(step.id)}
                    sx={{
                      p: 1.75,
                      height: "100%",
                      borderRadius: "12px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      border: isSelected ? "2px solid" : "1px solid",
                      borderColor: isSelected
                        ? "primary.main"
                        : isDark
                        ? "rgba(255, 255, 255, 0.08)"
                        : "rgba(226, 232, 240, 0.85)",
                      bgcolor: isSelected
                        ? isDark
                          ? "rgba(11, 92, 171, 0.16)"
                          : "rgba(11, 92, 171, 0.05)"
                        : isDark
                        ? "rgba(15, 23, 42, 0.4)"
                        : "#FFFFFF",
                      boxShadow: isSelected
                        ? isDark
                          ? "0 4px 16px rgba(11, 92, 171, 0.25)"
                          : "0 4px 14px rgba(11, 92, 171, 0.12)"
                        : isDark
                        ? "none"
                        : "0 1px 3px rgba(0, 0, 0, 0.02)",
                      transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        borderColor: isSelected ? "primary.main" : "primary.light",
                        boxShadow: isDark
                          ? "0 6px 18px rgba(0, 0, 0, 0.35)"
                          : "0 6px 18px rgba(15, 23, 42, 0.06)",
                      },
                    }}
                  >
                    <Box>
                      {/* Step Header with Number & Status */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.25 }}>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: "6px",
                              display: "grid",
                              placeItems: "center",
                              bgcolor: isSelected ? "primary.main" : alpha(theme.palette.primary.main, 0.1),
                              color: isSelected ? "#FFFFFF" : "primary.main",
                              fontWeight: 800,
                              fontSize: "0.7rem",
                            }}
                          >
                            {step.stepNumber}
                          </Box>
                          <Typography
                            variant="caption"
                            sx={{
                              fontSize: "0.68rem",
                              fontWeight: 750,
                              textTransform: "uppercase",
                              letterSpacing: "0.04em",
                              color: isSelected ? "primary.main" : "text.secondary",
                            }}
                          >
                            {step.tag}
                          </Typography>
                        </Stack>
                        <Chip
                          size="small"
                          color={step.statusColor}
                          variant={isSelected ? "filled" : "outlined"}
                          label={step.badgeText}
                          sx={{
                            height: 19,
                            fontSize: "0.65rem",
                            fontWeight: 750,
                            borderRadius: "4px",
                            "& .MuiChip-label": { px: 0.6 },
                          }}
                        />
                      </Stack>

                      {/* Title & Icon */}
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                        <Box sx={{ color: isSelected ? "primary.main" : "text.secondary", display: "grid", placeItems: "center" }}>
                          {step.icon}
                        </Box>
                        <Typography
                          variant="subtitle2"
                          fontWeight={750}
                          sx={{
                            fontSize: "0.85rem",
                            lineHeight: 1.25,
                            color: isSelected ? "primary.main" : "text.primary",
                          }}
                        >
                          {step.title}
                        </Typography>
                      </Stack>

                      {/* Detail description */}
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                          display: "block",
                          fontSize: "0.72rem",
                          lineHeight: 1.4,
                          mb: 1.25,
                        }}
                      >
                        {step.description}
                      </Typography>
                    </Box>

                    {/* Footer live status badge */}
                    <Box
                      sx={{
                        pt: 1,
                        borderTop: "1px dashed",
                        borderColor: isSelected
                          ? alpha(theme.palette.primary.main, 0.25)
                          : isDark
                          ? "rgba(255, 255, 255, 0.06)"
                          : "rgba(226, 232, 240, 0.8)",
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: isSelected ? "primary.main" : "text.secondary",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Status: {step.status}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              );
            })}
          </Grid>

          {/* Connected Flow Pipeline Bar */}
          <Box
            sx={{
              mt: 1.75,
              p: 1.25,
              borderRadius: "10px",
              bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "#F8FAFC",
              border: "1px dashed",
              borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
              <Typography variant="caption" fontWeight={750} color="text.secondary" sx={{ fontSize: "0.74rem" }}>
                Execution Pipeline:
              </Typography>
              <Typography variant="caption" sx={{ fontSize: "0.74rem", fontWeight: 650, color: "text.primary" }}>
                1. Statutory Policy ➔ 2. Salary Components ➔ 3. Templates & Groups ➔ 4. Employee Assignment ➔
              </Typography>
              <Chip
                size="small"
                icon={<PlayCircleOutlineRounded sx={{ fontSize: 14 }} />}
                label="5. Monthly Payroll Run (Payroll Settings)"
                sx={{
                  height: 22,
                  fontSize: "0.68rem",
                  fontWeight: 750,
                  borderRadius: "5px",
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  color: "success.main",
                  border: "1px solid",
                  borderColor: (theme) => alpha(theme.palette.success.main, 0.25),
                }}
              />
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              Runs freeze employee assignments and audit calculations.
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Card>
  );
}
