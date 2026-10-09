import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import HourglassEmptyRounded from "@mui/icons-material/HourglassEmptyRounded";
import ReceiptLongOutlined from "@mui/icons-material/ReceiptLongOutlined";
import { Box, Chip, Stack, Typography, alpha, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { AppButton } from "../../../shared/components/ui";
import type { StatutoryProfile } from "./PayrollConfigurationPanel";

export function PayrollPolicyProfileList({
  profiles,
  canEdit,
  canDelete,
  canApprove,
  busy,
  onEdit,
  onDelete,
  onSubmit,
  onApprove,
}: {
  profiles: StatutoryProfile[];
  canEdit: boolean;
  canDelete: boolean;
  canApprove: boolean;
  busy: boolean;
  onEdit: (profile: StatutoryProfile) => void;
  onDelete: (profile: StatutoryProfile) => void;
  onSubmit: (profile: StatutoryProfile) => void;
  onApprove: (profile: StatutoryProfile) => void;
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  if (!profiles.length) return null;

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        {["DRAFT", "SUBMITTED", "APPROVED"].map((status) => {
          const count = profiles.filter((p) => p.approvalStatus === status).length;
          const statusColor =
            status === "APPROVED"
              ? "#10B981"
              : status === "SUBMITTED"
              ? "#F59E0B"
              : isDark
              ? "#94A3B8"
              : "#64748B";

          return (
            <Chip
              key={status}
              size="small"
              variant="outlined"
              label={`${count} ${status.toLowerCase()}`}
              sx={{
                height: 24,
                fontWeight: 700,
                fontSize: "0.72rem",
                borderRadius: "6px",
                borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
                bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "#FFFFFF",
                "& .MuiChip-label": {
                  px: 1,
                },
              }}
            />
          );
        })}
      </Stack>

      {profiles.map((profile) => {
        const isApproved = profile.approvalStatus === "APPROVED";
        const isSubmitted = profile.approvalStatus === "SUBMITTED";
        const isDraft = profile.approvalStatus === "DRAFT";

        const accentColor = isApproved
          ? "#10B981"
          : isSubmitted
          ? "#F59E0B"
          : "#3B82F6";

        return (
          <Box
            key={profile.id}
            sx={{
              p: { xs: 2, sm: 2.25 },
              border: "1px solid",
              borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "#E2E8F0",
              borderLeft: "4px solid",
              borderLeftColor: accentColor,
              borderRadius: "14px",
              bgcolor: isDark ? "rgba(30, 41, 59, 0.35)" : "#FFFFFF",
              boxShadow: isDark
                ? "0 2px 10px rgba(0, 0, 0, 0.25)"
                : "0 2px 8px rgba(15, 23, 42, 0.03)",
              minWidth: 0,
              transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
              "&:hover": {
                transform: "translateY(-1px)",
                borderColor: isDark ? "rgba(255, 255, 255, 0.16)" : "#CBD5E1",
                boxShadow: isDark
                  ? "0 6px 18px rgba(0, 0, 0, 0.35)"
                  : "0 6px 18px rgba(15, 23, 42, 0.06)",
              },
            }}
          >
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              justifyContent="space-between"
              alignItems={{ xs: "stretch", md: "center" }}
            >
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
                  <Typography
                    variant="body2"
                    fontWeight={750}
                    sx={{
                      fontSize: "0.95rem",
                      letterSpacing: "-0.01em",
                      overflowWrap: "anywhere",
                      color: "text.primary",
                    }}
                  >
                    {profile.name}
                  </Typography>

                  <Chip
                    size="small"
                    label={profile.approvalStatus || "UNVERIFIED"}
                    color={isApproved ? "success" : isSubmitted ? "warning" : "default"}
                    sx={{
                      height: 22,
                      fontWeight: 750,
                      fontSize: "0.7rem",
                      borderRadius: "6px",
                    }}
                  />

                  <Chip
                    size="small"
                    variant="outlined"
                    label={profile.scope === "ASSIGNMENT_ONLY" ? "Linked groups or employees" : "Company default"}
                    sx={{
                      height: 22,
                      fontWeight: 650,
                      fontSize: "0.7rem",
                      borderRadius: "6px",
                      borderColor: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1",
                    }}
                  />

                  {!profile.isActive && (
                    <Chip
                      size="small"
                      variant="outlined"
                      label="Inactive"
                      sx={{
                        height: 22,
                        fontWeight: 650,
                        fontSize: "0.7rem",
                        borderRadius: "6px",
                        color: "text.disabled",
                        borderColor: "divider",
                      }}
                    />
                  )}
                </Stack>

                <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 1 }}>
                  <CalendarMonthOutlined sx={{ fontSize: 15, color: "text.secondary" }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.825rem" }}>
                    {profile.scope === "ASSIGNMENT_ONLY" ? "Linked groups or employees" : "Company default"}
                    {" · "}
                    {dayjs(profile.effectiveFrom).format("MMM YYYY")}
                    {profile.effectiveTo ? ` – ${dayjs(profile.effectiveTo).format("MMM YYYY")}` : " onward"}
                  </Typography>
                </Stack>

                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: "block",
                    mt: 0.5,
                    fontSize: "0.75rem",
                    overflowWrap: "anywhere",
                  }}
                >
                  {profile.statutoryJurisdiction || "Jurisdiction not recorded"} · {profile.financialYear || "Financial year not recorded"} · Rule {profile.statutoryRuleVersion || "not recorded"}
                  {profile.approvedAtUtc ? ` · Approved ${dayjs(profile.approvedAtUtc).format("D MMM YYYY")}` : ""}
                </Typography>
              </Box>

              <Stack
                direction="row"
                spacing={1}
                useFlexGap
                flexWrap="wrap"
                sx={{
                  flexShrink: 0,
                  justifyContent: { xs: "flex-start", md: "flex-end" },
                  maxWidth: { md: 420 },
                }}
              >
                {canEdit && profile.id && (
                  <AppButton
                    size="small"
                    variant="outlined"
                    disabled={busy}
                    onClick={() => onEdit(profile)}
                    sx={{
                      height: 32,
                      fontSize: "0.78rem",
                      fontWeight: 650,
                      borderRadius: "8px",
                      borderColor: isDark ? "rgba(255,255,255,0.14)" : "#CBD5E1",
                    }}
                  >
                    {profile.approvalStatus === "DRAFT" ? "Edit draft" : "Create revision"}
                  </AppButton>
                )}
                {canDelete && profile.id && profile.approvalStatus === "DRAFT" && (
                  <AppButton
                    size="small"
                    variant="outlined"
                    color="error"
                    disabled={busy}
                    onClick={() => onDelete(profile)}
                    sx={{
                      height: 32,
                      fontSize: "0.78rem",
                      fontWeight: 650,
                      borderRadius: "8px",
                    }}
                  >
                    Delete draft
                  </AppButton>
                )}
                {canEdit && profile.id && profile.approvalStatus === "DRAFT" && (
                  <AppButton
                    size="small"
                    variant="contained"
                    disabled={busy}
                    onClick={() => onSubmit(profile)}
                    sx={{
                      height: 32,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      borderRadius: "8px",
                    }}
                  >
                    Submit for approval
                  </AppButton>
                )}
                {canApprove && profile.id && profile.approvalStatus === "SUBMITTED" && (
                  <AppButton
                    size="small"
                    variant="contained"
                    color="success"
                    disabled={busy}
                    onClick={() => onApprove(profile)}
                    sx={{
                      height: 32,
                      fontSize: "0.78rem",
                      fontWeight: 700,
                      borderRadius: "8px",
                    }}
                  >
                    Approve policy
                  </AppButton>
                )}
              </Stack>
            </Stack>
          </Box>
        );
      })}
    </Stack>
  );
}
