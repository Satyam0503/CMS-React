import React from "react";
import {
  Avatar,
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Add from "@mui/icons-material/Add";
import Remove from "@mui/icons-material/Remove";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import WorkOutlineRounded from "@mui/icons-material/WorkOutlineRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import { useNavigate } from "react-router-dom";
import { OrgChartNode } from "./orgChartModel";
import { getAvatarGradient, getDepartmentTheme, resolveProfileImageUrl } from "./orgChartTheme";

interface OrgChartNodeCardProps {
  node: OrgChartNode;
  isExpanded: boolean;
  isSelected?: boolean;
  onToggleExpand: (userId: string) => void;
  onSelect: (node: OrgChartNode) => void;
}

export const OrgChartNodeCard: React.FC<OrgChartNodeCardProps> = ({
  node,
  isExpanded,
  isSelected,
  onToggleExpand,
  onSelect,
}) => {
  const navigate = useNavigate();
  const hasReports = Boolean(node.directReports && node.directReports.length > 0);
  const deptTheme = getDepartmentTheme(node.departmentName);
  const avatarBg = getAvatarGradient(node.fullName || node.firstName);
  const avatarSrc = resolveProfileImageUrl(node.profileUrl || node.fullProfileUrl);

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node);
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleExpand(node.userId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(node);
    } else if (e.key === "ArrowRight" && hasReports && !isExpanded) {
      e.preventDefault();
      onToggleExpand(node.userId);
    } else if (e.key === "ArrowLeft" && hasReports && isExpanded) {
      e.preventDefault();
      onToggleExpand(node.userId);
    }
  };

  return (
    <Box
      sx={{
        display: "inline-flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      <Card
        tabIndex={0}
        role="treeitem"
        aria-expanded={hasReports ? isExpanded : undefined}
        aria-label={`${node.fullName}, ${node.jobRoleTitle}, ${node.departmentName}`}
        onClick={handleCardClick}
        onKeyDown={handleKeyDown}
        sx={{
          width: 260,
          borderRadius: "14px",
          border: "1.5px solid",
          borderColor: isSelected ? "#3b82f6" : "#e2e8f0",
          bgcolor: "#ffffff",
          boxShadow: isSelected
            ? "0 10px 25px -5px rgba(59, 130, 246, 0.3), 0 8px 10px -6px rgba(59, 130, 246, 0.2)"
            : "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
          cursor: "pointer",
          position: "relative",
          overflow: "visible",
          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          outline: "none",
          "&:hover": {
            borderColor: "#3b82f6",
            transform: "translateY(-3px)",
            boxShadow: "0 12px 24px -4px rgba(15, 23, 42, 0.12)",
          },
          "&:focus-visible": {
            outline: "2px solid #3b82f6",
            outlineOffset: "2px",
          },
        }}
      >
        {/* Top Department Accent Stripe */}
        <Box
          sx={{
            height: "4px",
            bgcolor: deptTheme.accent,
            borderTopLeftRadius: "12px",
            borderTopRightRadius: "12px",
          }}
        />

        <Box sx={{ p: 2 }}>
          {/* Avatar and Identity */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar
              src={avatarSrc}
              alt={node.fullName}
              sx={{
                width: 44,
                height: 44,
                background: avatarBg,
                color: "#ffffff",
                fontWeight: 700,
                fontSize: "0.95rem",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
                border: "2px solid #ffffff",
              }}
            >
              {(node.firstName || node.fullName || "U").charAt(0).toUpperCase()}
            </Avatar>

            <Box sx={{ minWidth: 0, flex: 1, textAlign: "left" }}>
              <Typography
                variant="subtitle2"
                noWrap
                sx={{
                  fontWeight: 700,
                  fontSize: "0.92rem",
                  color: "#0f172a",
                  lineHeight: 1.25,
                }}
              >
                {node.fullName}
              </Typography>

              <Typography
                variant="caption"
                noWrap
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.5,
                  mt: 0.3,
                  fontSize: "0.76rem",
                  color: "#64748b",
                  fontWeight: 500,
                }}
              >
                <WorkOutlineRounded sx={{ fontSize: 13, color: "#94a3b8" }} />
                {node.jobRoleTitle || "Team Member"}
              </Typography>
            </Box>
          </Stack>

          {/* Department Badge & Team Indicator */}
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{
              mt: 1.5,
              pt: 1.2,
              borderTop: "1px dashed #e2e8f0",
            }}
          >
            {/* Custom Department Badge (Replaces unstyled Chip) */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 0.6,
                px: 1,
                py: 0.35,
                borderRadius: "6px",
                bgcolor: deptTheme.bg,
                border: `1px solid ${deptTheme.border}`,
                maxWidth: 160,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: deptTheme.dot,
                  flexShrink: 0,
                }}
              />
              <Typography
                noWrap
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  color: deptTheme.color,
                  lineHeight: 1,
                }}
              >
                {node.departmentName || "General"}
              </Typography>
            </Box>

            {/* Actions & Team Indicator */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              {node.directReportsCount > 0 && (
                <Tooltip title={`${node.directReportsCount} direct reports (${node.totalTeamCount || node.directReportsCount} total team)`}>
                  <Stack direction="row" spacing={0.4} alignItems="center" sx={{ color: "#64748b", mr: 0.5 }}>
                    <GroupsRounded sx={{ fontSize: 15 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: "0.75rem" }}>
                      {node.directReportsCount}
                    </Typography>
                  </Stack>
                </Tooltip>
              )}
              {node.email && (
                <Tooltip title={`Email ${node.fullName}`}>
                  <IconButton
                    size="small"
                    component="a"
                    href={`mailto:${node.email}`}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      p: 0.4,
                      color: "#94a3b8",
                      "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" },
                    }}
                    aria-label={`Email ${node.fullName}`}
                  >
                    <MailOutlineRounded sx={{ fontSize: 14 }} />
                  </IconButton>
                </Tooltip>
              )}
              <Tooltip title="View Employee Profile">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/employees/${node.userId}/about`);
                  }}
                  sx={{
                    p: 0.4,
                    color: "#94a3b8",
                    "&:hover": { color: "#3b82f6", bgcolor: "#eff6ff" },
                  }}
                  aria-label={`View profile for ${node.fullName}`}
                >
                  <OpenInNewRounded sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Card>

      {/* Expand/Collapse Toggle Pill on Bottom Connector */}
      {hasReports && (
        <Box
          sx={{
            position: "relative",
            mt: "-12px",
            zIndex: 3,
          }}
        >
          <Tooltip title={isExpanded ? "Collapse Team" : `Expand ${node.directReportsCount} Reports`}>
            <IconButton
              size="small"
              onClick={handleToggle}
              aria-label={
                isExpanded
                  ? `Collapse direct reports for ${node.fullName}`
                  : `Expand ${node.directReportsCount} direct reports for ${node.fullName}`
              }
              sx={{
                height: 24,
                minWidth: 24,
                px: 0.6,
                borderRadius: "12px",
                bgcolor: isExpanded ? "#ffffff" : "#2563eb",
                color: isExpanded ? "#2563eb" : "#ffffff",
                border: "1.5px solid #2563eb",
                boxShadow: "0 2px 6px rgba(0, 0, 0, 0.12)",
                transition: "all 0.15s ease",
                display: "inline-flex",
                alignItems: "center",
                gap: 0.3,
                "&:hover": {
                  bgcolor: isExpanded ? "#eff6ff" : "#1d4ed8",
                  transform: "scale(1.08)",
                },
              }}
            >
              {isExpanded ? (
                <Remove sx={{ fontSize: 14 }} />
              ) : (
                <>
                  <Add sx={{ fontSize: 14 }} />
                  <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, lineHeight: 1, pr: 0.2 }}>
                    {node.directReportsCount}
                  </Typography>
                </>
              )}
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Box>
  );
};
