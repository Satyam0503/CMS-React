import { useMemo, useState } from "react";
import CalendarMonthOutlined from "@mui/icons-material/CalendarMonthOutlined";
import CheckCircleRounded from "@mui/icons-material/CheckCircleRounded";
import DeleteOutlineRounded from "@mui/icons-material/DeleteOutlineRounded";
import EditOutlined from "@mui/icons-material/EditOutlined";
import ExpandLessRounded from "@mui/icons-material/ExpandLessRounded";
import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import PauseCircleOutlineRounded from "@mui/icons-material/PauseCircleOutlineRounded";
import UndoOutlined from "@mui/icons-material/UndoOutlined";
import { Box, Button, Chip, Collapse, Grid, Stack, Typography, alpha, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { AppButton } from "../../../shared/components/ui";
import type { StatutoryProfile } from "./PayrollConfigurationPanel";
import { useIsDark } from "../../theme/useIsDark";

const cleanProfileDisplayName = (name: string): string => {
  if (!name) return "";
  return name.replace(/(\s*\((?:revision|revised)(?:\s+\d+)?\)){2,}/gi, " (revision)").trim();
};

const formatAuditUser = (user?: string) => {
  if (!user) return "Admin";
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(user)) {
    return `Admin (${user.slice(0, 8)})`;
  }
  return user;
};

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
  onCancelSubmission,
  onRetire,
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
  onCancelSubmission?: (profile: StatutoryProfile) => void;
  onRetire?: (profile: StatutoryProfile) => void;
}) {
  const theme = useTheme();
  const isDark = useIsDark();
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "DRAFT" | "SUBMITTED" | "ARCHIVED">("ALL");

  const toggleDetails = (id?: string) => {
    if (!id) return;
    setExpandedDetails((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const now = useMemo(() => dayjs().startOf("day"), []);

  const counts = useMemo(() => {
    let active = 0;
    let draft = 0;
    let submitted = 0;
    let archived = 0;

    for (const p of profiles) {
      if (p.approvalStatus === "DRAFT") {
        draft++;
      } else if (p.approvalStatus === "SUBMITTED") {
        submitted++;
      } else if (!p.isActive) {
        archived++;
      } else {
        const end = p.effectiveTo ? dayjs(p.effectiveTo).endOf("day") : null;
        if (end && end.valueOf() < now.valueOf()) {
          archived++;
        } else {
          active++;
        }
      }
    }
    return { all: profiles.length, active, draft, submitted, archived };
  }, [profiles, now]);

  const sortedProfiles = useMemo(() => {
    return [...profiles].sort((a, b) => {
      const aStart = dayjs(a.effectiveFrom).startOf("day");
      const bStart = dayjs(b.effectiveFrom).startOf("day");
      const aEnd = a.effectiveTo ? dayjs(a.effectiveTo).endOf("day") : null;
      const bEnd = b.effectiveTo ? dayjs(b.effectiveTo).endOf("day") : null;

      const aIsCurrent = a.isActive && a.approvalStatus === "APPROVED" && a.scope !== "ASSIGNMENT_ONLY" && aStart.valueOf() <= now.valueOf() && (!aEnd || aEnd.valueOf() >= now.valueOf());
      const bIsCurrent = b.isActive && b.approvalStatus === "APPROVED" && b.scope !== "ASSIGNMENT_ONLY" && bStart.valueOf() <= now.valueOf() && (!bEnd || bEnd.valueOf() >= now.valueOf());
      if (aIsCurrent && !bIsCurrent) return -1;
      if (!aIsCurrent && bIsCurrent) return 1;

      const aIsUpcoming = a.isActive && a.approvalStatus === "APPROVED" && aStart.valueOf() > now.valueOf();
      const bIsUpcoming = b.isActive && b.approvalStatus === "APPROVED" && bStart.valueOf() > now.valueOf();
      if (aIsUpcoming && !bIsUpcoming) return -1;
      if (!aIsUpcoming && bIsUpcoming) return 1;

      const aIsPending = a.approvalStatus === "DRAFT" || a.approvalStatus === "SUBMITTED";
      const bIsPending = b.approvalStatus === "DRAFT" || b.approvalStatus === "SUBMITTED";
      if (aIsPending && !bIsPending) return -1;
      if (!aIsPending && bIsPending) return 1;

      if (a.isActive && !b.isActive) return -1;
      if (!a.isActive && b.isActive) return 1;

      return (b.version || 1) - (a.version || 1);
    });
  }, [profiles, now]);

  const displayedProfiles = useMemo(() => {
    if (filter === "ALL") return sortedProfiles;
    return sortedProfiles.filter((p) => {
      if (filter === "DRAFT") return p.approvalStatus === "DRAFT";
      if (filter === "SUBMITTED") return p.approvalStatus === "SUBMITTED";
      if (filter === "ARCHIVED") {
        if (!p.isActive) return true;
        const end = p.effectiveTo ? dayjs(p.effectiveTo).endOf("day") : null;
        return end ? end.valueOf() < now.valueOf() : false;
      }
      if (filter === "ACTIVE") {
        if (!p.isActive || p.approvalStatus !== "APPROVED") return false;
        const end = p.effectiveTo ? dayjs(p.effectiveTo).endOf("day") : null;
        return !end || end.valueOf() >= now.valueOf();
      }
      return true;
    });
  }, [sortedProfiles, filter, now]);

  if (!profiles.length) return null;

  return (
    <Stack spacing={2}>
      {/* Interactive Filter Pills */}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" alignItems="center">
        <Chip
          size="small"
          clickable
          variant={filter === "ALL" ? "filled" : "outlined"}
          color={filter === "ALL" ? "primary" : "default"}
          onClick={() => setFilter("ALL")}
          label={`All (${counts.all})`}
          sx={{ height: 26, fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px" }}
        />
        <Chip
          size="small"
          clickable
          variant={filter === "ACTIVE" ? "filled" : "outlined"}
          color="success"
          onClick={() => setFilter("ACTIVE")}
          label={`🟢 Active & Scheduled (${counts.active})`}
          sx={{ height: 26, fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px" }}
        />
        {counts.draft > 0 && (
          <Chip
            size="small"
            clickable
            variant={filter === "DRAFT" ? "filled" : "outlined"}
            color="default"
            onClick={() => setFilter("DRAFT")}
            label={`📝 Drafts (${counts.draft})`}
            sx={{ height: 26, fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px" }}
          />
        )}
        {counts.submitted > 0 && (
          <Chip
            size="small"
            clickable
            variant={filter === "SUBMITTED" ? "filled" : "outlined"}
            color="warning"
            onClick={() => setFilter("SUBMITTED")}
            label={`⏳ In Review (${counts.submitted})`}
            sx={{ height: 26, fontWeight: 700, fontSize: "0.72rem", borderRadius: "6px" }}
          />
        )}
        {counts.archived > 0 && (
          <Chip
            size="small"
            clickable
            variant={filter === "ARCHIVED" ? "filled" : "outlined"}
            color="default"
            onClick={() => setFilter("ARCHIVED")}
            label={`🗄️ Archived & Inactive (${counts.archived})`}
            sx={{
              height: 26,
              fontWeight: 700,
              fontSize: "0.72rem",
              borderRadius: "6px",
              opacity: filter === "ARCHIVED" ? 1 : 0.85,
            }}
          />
        )}
      </Stack>

      {displayedProfiles.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            borderRadius: "12px",
            border: "1px dashed",
            borderColor: isDark ? "rgba(255, 255, 255, 0.12)" : "#CBD5E1",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            No policies found under the &quot;{filter}&quot; filter.
          </Typography>
          <Button size="small" sx={{ mt: 1 }} onClick={() => setFilter("ALL")}>
            Show all policies
          </Button>
        </Box>
      ) : (
        displayedProfiles.map((profile) => {
          const isApproved = profile.approvalStatus === "APPROVED";
          const isSubmitted = profile.approvalStatus === "SUBMITTED";
          const isDraft = profile.approvalStatus === "DRAFT";

          const start = dayjs(profile.effectiveFrom).startOf("day");
          const end = profile.effectiveTo ? dayjs(profile.effectiveTo).endOf("day") : null;
          const isCurrentActive = profile.isActive && isApproved && profile.scope !== "ASSIGNMENT_ONLY" && start.valueOf() <= now.valueOf() && (!end || end.valueOf() >= now.valueOf());
          const isUpcoming = profile.isActive && isApproved && start.valueOf() > now.valueOf();
          const isPast = (profile.isActive && isApproved && end && end.valueOf() < now.valueOf()) || (!profile.isActive && isApproved);
          const isExpanded = Boolean(expandedDetails[profile.id || profile.name]);

          const accentColor = !profile.isActive
            ? isDark
              ? "#475569"
              : "#94A3B8"
            : isCurrentActive
            ? "#10B981"
            : isUpcoming
            ? "#3B82F6"
            : isSubmitted
            ? "#F59E0B"
            : isDraft
            ? "#6366F1"
            : "#64748B";

          return (
            <Box
              key={profile.id || profile.name}
              sx={{
                p: { xs: 2, sm: 2.25 },
                border: "1px solid",
                borderColor: !profile.isActive
                  ? isDark
                    ? "rgba(255, 255, 255, 0.05)"
                    : "#E2E8F0"
                  : isDark
                  ? "rgba(255, 255, 255, 0.08)"
                  : "#E2E8F0",
                borderLeft: "4px solid",
                borderLeftColor: accentColor,
                borderRadius: "14px",
                bgcolor: !profile.isActive
                  ? isDark
                    ? "rgba(15, 23, 42, 0.2)"
                    : "#F8FAFC"
                  : isDark
                  ? "rgba(30, 41, 59, 0.35)"
                  : "#FFFFFF",
                opacity: !profile.isActive ? 0.85 : 1,
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
                direction={{ xs: "column", lg: "row" }}
                spacing={2}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", lg: "center" }}
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
                        color: !profile.isActive ? "text.secondary" : "text.primary",
                      }}
                    >
                      {cleanProfileDisplayName(profile.name)}
                    </Typography>

                    {/* Active / Timeline Status */}
                    {isCurrentActive && (
                      <Chip
                        size="small"
                        color="success"
                        label="🟢 Active Current Default"
                        sx={{ height: 22, fontWeight: 750, fontSize: "0.7rem", borderRadius: "6px" }}
                      />
                    )}
                    {isUpcoming && (
                      <Chip
                        size="small"
                        color="info"
                        label={`⏳ Upcoming (${dayjs(profile.effectiveFrom).format("MMM YYYY")})`}
                        sx={{ height: 22, fontWeight: 750, fontSize: "0.7rem", borderRadius: "6px" }}
                      />
                    )}
                    {isPast && profile.isActive && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label="📜 Historical / Closed"
                        sx={{ height: 22, fontWeight: 650, fontSize: "0.7rem", borderRadius: "6px" }}
                      />
                    )}

                    {!profile.isActive ? (
                      <Chip
                        size="small"
                        variant="outlined"
                        label="Archived / Inactive"
                        sx={{
                          height: 22,
                          fontWeight: 700,
                          fontSize: "0.7rem",
                          borderRadius: "6px",
                          color: "text.disabled",
                          borderColor: "divider",
                        }}
                      />
                    ) : (
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
                    )}

                    <Chip
                      size="small"
                      variant="outlined"
                      label={`v${profile.version || 1}`}
                      sx={{
                        height: 22,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        borderRadius: "6px",
                        borderColor: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1",
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
                  </Stack>

                  <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.75 }}>
                    <CalendarMonthOutlined sx={{ fontSize: 14, color: "text.secondary" }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.8rem", fontWeight: 500 }}>
                      {(() => {
                        const startMonth = dayjs(profile.effectiveFrom);
                        const endMonth = profile.effectiveTo ? dayjs(profile.effectiveTo) : null;
                        if (!profile.isActive) {
                          if (endMonth && endMonth.valueOf() <= startMonth.valueOf()) {
                            return `Deactivated prior to start (was scheduled for ${startMonth.format("MMM YYYY")})`;
                          }
                          return `${startMonth.format("MMM YYYY")}${endMonth ? ` – ${endMonth.format("MMM YYYY")}` : ""} (Deactivated)`;
                        }
                        if (endMonth && endMonth.valueOf() < startMonth.valueOf()) {
                          return `${startMonth.format("MMM YYYY")} onward`;
                        }
                        return `${startMonth.format("MMM YYYY")}${endMonth ? ` – ${endMonth.format("MMM YYYY")}` : " onward"}`;
                      })()}
                    </Typography>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.35, fontSize: "0.72rem" }}>
                    Created by: <strong>{formatAuditUser(profile.createdBy)}</strong>
                    {profile.approvedBy ? ` · Authorized by: ${formatAuditUser(profile.approvedBy)}` : ""}
                    {!profile.isActive ? " · Retained for statutory audit trail (inactive)" : ""}
                  </Typography>

                  

                  {/* Visible Payroll Features Pills */}
                  <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" alignItems="center" sx={{ mt: 1.25 }}>
                    <Chip
                      size="small"
                      variant="outlined"
                      label={`⚙️ ${
                        profile.divisorPolicy === "CALENDAR_DAYS"
                          ? "Calendar Days"
                          : profile.divisorPolicy === "FIXED_30_DAYS"
                          ? "Fixed 30 Days"
                          : "Working Days"
                      }`}
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px", borderColor: isDark ? "rgba(255,255,255,0.12)" : "#CBD5E1" }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color={profile.epfMode !== "EXEMPT" ? "primary" : "default"}
                      label={`🛡️ EPF: ${
                        profile.epfMode === "CAPPED_CEILING"
                          ? `Capped ₹${(profile.epfWageCeiling || 15000).toLocaleString()} (${profile.epfEmployeeRatePercent ?? 12}%/${profile.epfEmployerRatePercent ?? 12}%)`
                          : profile.epfMode === "ACTUAL_BASIC_12"
                          ? `Actual Basic (${profile.epfEmployeeRatePercent ?? 12}%)`
                          : "Exempt"
                      }`}
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px" }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color={profile.esicMode !== "EXEMPT" ? "success" : "default"}
                      label={`🏥 ESIC: ${
                        profile.esicMode === "STATUTORY"
                          ? `Statutory ₹${(profile.esicWageCeiling || 21000).toLocaleString()} (${profile.esicEmployeeRatePercent ?? 0.75}%/${profile.esicEmployerRatePercent ?? 3.25}%)`
                          : "Exempt"
                      }`}
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px" }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color={profile.tdsMode !== "MANUAL_ONLY" ? "warning" : "default"}
                      label={`💼 TDS: ${
                        profile.tdsMode === "AUTO_NEW_REGIME"
                          ? "Auto New Regime"
                          : profile.tdsMode === "AUTO_OLD_REGIME"
                          ? "Auto Old Regime"
                          : "Manual"
                      }`}
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px" }}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color={profile.requireAttendanceLock ? "secondary" : "default"}
                      label={`🔒 Attendance Lock: ${profile.requireAttendanceLock ? "Enforced" : "Off"}`}
                      sx={{ height: 22, fontSize: "0.7rem", fontWeight: 650, borderRadius: "5px" }}
                    />
                  </Stack>
                </Box>

                <Stack
                  direction="row"
                  spacing={1}
                  useFlexGap
                  flexWrap="wrap"
                  sx={{
                    flexShrink: 0,
                    justifyContent: { xs: "flex-start", lg: "flex-end" },
                    width: { xs: "100%", lg: "auto" },
                    pt: { xs: 1.5, lg: 0 },
                    borderTop: { xs: isDark ? "1px dashed rgba(255,255,255,0.08)" : "1px dashed rgba(0,0,0,0.08)", lg: "none" },
                    maxWidth: { md: 520 },
                  }}
                >
                  {/* 1. Edit / Revise Action */}
                  {canEdit && profile.id && (
                    <AppButton
                      size="small"
                      variant="outlined"
                      startIcon={<EditOutlined sx={{ fontSize: 15 }} />}
                      disabled={busy}
                      onClick={() => onEdit(profile)}
                      sx={{
                        height: 32,
                        fontSize: "0.78rem",
                        fontWeight: 650,
                        borderRadius: "8px",
                        borderColor: isDark ? "rgba(255,255,255,0.14)" : "#CBD5E1",
                        flex: { xs: "1 1 auto", sm: "none" },
                      }}
                    >
                      {profile.approvalStatus === "DRAFT"
                        ? "Edit draft"
                        : profile.approvalStatus === "SUBMITTED"
                        ? "Edit submission"
                        : "Create revision"}
                    </AppButton>
                  )}

                  {/* 2. DRAFT Actions: Delete draft & Submit for approval */}
                  {profile.approvalStatus === "DRAFT" && profile.id && (
                    <>
                      {canDelete && (
                        <AppButton
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlineRounded sx={{ fontSize: 15 }} />}
                          disabled={busy}
                          onClick={() => onDelete(profile)}
                          sx={{
                            height: 32,
                            fontSize: "0.78rem",
                            fontWeight: 650,
                            borderRadius: "8px",
                            flex: { xs: "1 1 auto", sm: "none" },
                          }}
                        >
                          Delete draft
                        </AppButton>
                      )}
                      {canEdit && (
                        <AppButton
                          size="small"
                          variant="contained"
                          startIcon={<CheckCircleRounded sx={{ fontSize: 15 }} />}
                          disabled={busy}
                          onClick={() => onSubmit(profile)}
                          sx={{
                            height: 32,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            borderRadius: "8px",
                            flex: { xs: "1 1 auto", sm: "none" },
                          }}
                        >
                          Submit for approval
                        </AppButton>
                      )}
                    </>
                  )}

                  {/* 3. SUBMITTED Actions: Withdraw to draft & Approve */}
                  {profile.approvalStatus === "SUBMITTED" && profile.id && (
                    <>
                      {canEdit && onCancelSubmission && (
                        <AppButton
                          size="small"
                          variant="outlined"
                          color="warning"
                          startIcon={<UndoOutlined sx={{ fontSize: 15 }} />}
                          disabled={busy}
                          onClick={() => onCancelSubmission(profile)}
                          sx={{
                            height: 32,
                            fontSize: "0.78rem",
                            fontWeight: 650,
                            borderRadius: "8px",
                            flex: { xs: "1 1 auto", sm: "none" },
                          }}
                        >
                          Withdraw to draft
                        </AppButton>
                      )}
                      {canDelete && (
                        <AppButton
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlineRounded sx={{ fontSize: 15 }} />}
                          disabled={busy}
                          onClick={() => onDelete(profile)}
                          sx={{
                            height: 32,
                            fontSize: "0.78rem",
                            fontWeight: 650,
                            borderRadius: "8px",
                            flex: { xs: "1 1 auto", sm: "none" },
                          }}
                        >
                          Delete
                        </AppButton>
                      )}
                      {canApprove && (
                        <AppButton
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckCircleRounded sx={{ fontSize: 15 }} />}
                          disabled={busy}
                          onClick={() => onApprove(profile)}
                          sx={{
                            height: 32,
                            fontSize: "0.78rem",
                            fontWeight: 700,
                            borderRadius: "8px",
                            flex: { xs: "1 1 auto", sm: "none" },
                          }}
                        >
                          Approve policy
                        </AppButton>
                      )}
                    </>
                  )}

                  {/* 4. APPROVED Actions: Deactivate (Active only) */}
                  {profile.approvalStatus === "APPROVED" && profile.id && profile.isActive && canEdit && onRetire && (
                    <AppButton
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<PauseCircleOutlineRounded sx={{ fontSize: 15 }} />}
                      disabled={busy}
                      onClick={() => onRetire(profile)}
                      sx={{
                        height: 32,
                        fontSize: "0.78rem",
                        fontWeight: 650,
                        borderRadius: "8px",
                        flex: { xs: "1 1 auto", sm: "none" },
                      }}
                    >
                      Deactivate
                    </AppButton>
                  )}
                </Stack>
              </Stack>

              {/* Expandable Breakdown Drawer */}
              <Box sx={{ mt: 1.25, pt: 1, borderTop: "1px dashed", borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)" }}>
                <Button
                  size="small"
                  variant="text"
                  onClick={() => toggleDetails(profile.id || profile.name)}
                  startIcon={isExpanded ? <ExpandLessRounded sx={{ fontSize: 16 }} /> : <ExpandMoreRounded sx={{ fontSize: 16 }} />}
                  sx={{
                    fontSize: "0.74rem",
                    textTransform: "none",
                    fontWeight: 650,
                    color: isExpanded ? "primary.main" : "text.secondary",
                    p: 0,
                    "&:hover": { bgcolor: "transparent", color: "primary.main" },
                  }}
                >
                  {isExpanded ? "Hide calculation rules" : "View complete calculation & statutory breakdown"}
                </Button>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Box
                    sx={{
                      mt: 1.25,
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: "10px",
                      bgcolor: isDark ? "rgba(15, 23, 42, 0.5)" : "#F8FAFC",
                      border: "1px solid",
                      borderColor: isDark ? "rgba(255, 255, 255, 0.06)" : "#E2E8F0",
                    }}
                  >
                    <Grid container spacing={2}>
                      {/* Divisor & LOP */}
                      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                        
                      </Grid>

                      {/* Audit Trail Note */}
                      <Grid size={{ xs: 12 }}>
                        <Box
                          sx={{
                            pt: 1,
                            borderTop: "1px dashed",
                            borderColor: isDark ? "rgba(255, 255, 255, 0.08)" : "rgba(0, 0, 0, 0.06)",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            flexWrap: "wrap",
                            gap: 1,
                          }}
                        >
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                            Created by: <strong>{formatAuditUser(profile.createdBy)}</strong>
                            {profile.submittedBy ? ` · Submitted by: ${formatAuditUser(profile.submittedBy)}` : ""}
                            {profile.approvedBy ? ` · Authorized by: ${formatAuditUser(profile.approvedBy)}` : ""}
                            {profile.approvedAtUtc ? ` on ${dayjs(profile.approvedAtUtc).format("D MMM YYYY, h:mm A")}` : ""}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", fontStyle: "italic" }}>
                            Version {profile.version} · {profile.scope === "ASSIGNMENT_ONLY" ? "Assignment-linked only" : "Company-wide fallback"}
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </Box>
                </Collapse>
              </Box>
            </Box>
          );
        })
      )}
    </Stack>
  );
}
