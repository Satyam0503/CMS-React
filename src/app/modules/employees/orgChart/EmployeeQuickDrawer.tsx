import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import Close from "@mui/icons-material/Close";
import EmailOutlined from "@mui/icons-material/EmailOutlined";
import BadgeOutlined from "@mui/icons-material/BadgeOutlined";
import CorporateFareOutlined from "@mui/icons-material/CorporateFareOutlined";
import GroupsOutlined from "@mui/icons-material/GroupsOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import SupervisorAccountOutlined from "@mui/icons-material/SupervisorAccountOutlined";
import AccountTreeRounded from "@mui/icons-material/AccountTreeRounded";
import Check from "@mui/icons-material/Check";
import Clear from "@mui/icons-material/Clear";
import ContentCopy from "@mui/icons-material/ContentCopy";
import Search from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";
import { OrgChartNode } from "./orgChartModel";
import { getAvatarGradient, getDepartmentTheme, resolveProfileImageUrl } from "./orgChartTheme";

interface EmployeeQuickDrawerProps {
  node: OrgChartNode | null;
  open: boolean;
  onClose: () => void;
  onFocusNode: (userId: string) => void;
}

export const EmployeeQuickDrawer: React.FC<EmployeeQuickDrawerProps> = ({
  node,
  open,
  onClose,
  onFocusNode,
}) => {
  const navigate = useNavigate();
  const [reportSearch, setReportSearch] = useState("");
  const [copied, setCopied] = useState(false);

  const filteredReports = useMemo(() => {
    if (!node?.directReports) return [];
    if (!reportSearch.trim()) return node.directReports;
    const q = reportSearch.trim().toLowerCase();
    return node.directReports.filter(
      (r) =>
        r.fullName?.toLowerCase().includes(q) ||
        r.jobRoleTitle?.toLowerCase().includes(q) ||
        r.departmentName?.toLowerCase().includes(q),
    );
  }, [node?.directReports, reportSearch]);

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (node?.email) {
      navigator.clipboard.writeText(node.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!node) return null;

  const handleOpenFullProfile = () => {
    navigate(`/employees/${node.userId}/about`);
  };

  const deptTheme = getDepartmentTheme(node.departmentName);
  const avatarBg = getAvatarGradient(node.fullName || node.firstName);
  const avatarSrc = resolveProfileImageUrl(node.profileUrl || node.fullProfileUrl);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 400 },
          p: 3,
          boxShadow: "-8px 0 32px rgba(0, 0, 0, 0.12)",
        },
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Employee Profile
        </Typography>
        <IconButton onClick={onClose} aria-label="Close details drawer" size="small">
          <Close />
        </IconButton>
      </Stack>

      <Divider sx={{ mb: 3 }} />

      {/* Main Avatar & Identity */}
      <Stack alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
        <Avatar
          src={avatarSrc}
          alt={node.fullName}
          sx={{
            width: 80,
            height: 80,
            background: avatarBg,
            fontSize: "2rem",
            fontWeight: 700,
            boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
            border: "3px solid #ffffff",
          }}
        >
          {(node.firstName || node.fullName || "U").charAt(0).toUpperCase()}
        </Avatar>

        <Typography variant="h6" sx={{ fontWeight: 800, textAlign: "center" }}>
          {node.fullName}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontWeight: 600, textAlign: "center" }}
        >
          {node.jobRoleTitle || "Team Member"}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
          {node.employeeId && (
            <Chip
              icon={<BadgeOutlined sx={{ fontSize: 16 }} />}
              label={node.employeeId}
              size="small"
              variant="outlined"
            />
          )}
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.6,
              px: 1.2,
              py: 0.4,
              borderRadius: "6px",
              bgcolor: deptTheme.bg,
              border: `1px solid ${deptTheme.border}`,
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
              sx={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: deptTheme.color,
                lineHeight: 1,
              }}
            >
              {node.departmentName || "General"}
            </Typography>
          </Box>
        </Stack>
      </Stack>

      {/* Contact & Structure Summary */}
      <Box
        sx={{
          p: 2,
          borderRadius: "12px",
          bgcolor: "background.default",
          border: "1px solid",
          borderColor: "divider",
          mb: 3,
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
              <EmailOutlined sx={{ color: "text.secondary", fontSize: 18, flexShrink: 0 }} />
              <Typography
                component="a"
                href={node.email ? `mailto:${node.email}` : undefined}
                variant="body2"
                noWrap
                sx={{
                  fontWeight: 600,
                  color: node.email ? "primary.main" : "text.secondary",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                {node.email || "No email listed"}
              </Typography>
            </Stack>
            {node.email && (
              <Tooltip title={copied ? "Copied!" : "Copy email"}>
                <IconButton size="small" onClick={handleCopyEmail} sx={{ p: 0.5 }}>
                  {copied ? <Check sx={{ fontSize: 16, color: "success.main" }} /> : <ContentCopy sx={{ fontSize: 16 }} />}
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <GroupsOutlined sx={{ color: "text.secondary", fontSize: 18, flexShrink: 0 }} />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {node.directReportsCount} Direct Reports • {node.totalTeamCount || node.directReportsCount} Total Team Span
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Reporting Manager */}
      {node.reportingManagerName &&
      node.reportingManagerUserId &&
      node.reportingManagerUserId !== node.userId &&
      node.reportingManagerName.trim().toLowerCase() !== (node.fullName || "").trim().toLowerCase() ? (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
            REPORTS TO
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ width: 36, height: 36, bgcolor: "secondary.main", fontSize: "0.85rem" }}>
                <SupervisorAccountOutlined sx={{ fontSize: 20 }} />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {node.reportingManagerName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Direct Manager
                </Typography>
              </Box>
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <Button
                size="small"
                variant="outlined"
                onClick={() => onFocusNode(node.reportingManagerUserId!)}
                sx={{ textTransform: "none", fontSize: "0.75rem", borderRadius: "8px" }}
              >
                Focus
              </Button>
              <Button
                size="small"
                variant="text"
                onClick={() => navigate(`/employees/${node.reportingManagerUserId}/about`)}
                sx={{ textTransform: "none", fontSize: "0.75rem" }}
              >
                Profile
              </Button>
            </Stack>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.secondary" }}>
            ORGANIZATION HIERARCHY
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: "12px",
              bgcolor: "action.hover",
              border: "1px dashed",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              gap: 1.5,
            }}
          >
            <Avatar sx={{ width: 36, height: 36, bgcolor: "primary.main", fontSize: "0.85rem" }}>
              <AccountTreeRounded sx={{ fontSize: 20, color: "#ffffff" }} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                {node.directReportsCount > 0 ? "Head of Organization / Top Level" : "Root (No Manager Assigned)"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {node.directReportsCount > 0
                  ? "Top-level leader managing direct branches"
                  : "No reporting manager is currently assigned"}
              </Typography>
            </Box>
          </Box>
        </Box>
      )}

      {/* Direct Reports */}
      {node.directReports && node.directReports.length > 0 && (
        <Box sx={{ mb: 3, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.secondary" }}>
              DIRECT REPORTS ({node.directReports.length})
            </Typography>
            {node.directReports.length > 5 && (
              <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 600 }}>
                {filteredReports.length} matching
              </Typography>
            )}
          </Stack>

          {node.directReports.length > 5 && (
            <TextField
              size="small"
              placeholder={`Search ${node.directReports.length} reports...`}
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ fontSize: 16, color: "text.secondary" }} />
                  </InputAdornment>
                ),
                endAdornment: reportSearch ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setReportSearch("")} sx={{ p: 0.2 }}>
                      <Clear sx={{ fontSize: 14 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
                sx: { borderRadius: "8px", fontSize: "0.8rem", height: 34, bgcolor: "background.paper", mb: 1.5 },
              }}
            />
          )}

          <Box sx={{ flex: 1, overflowY: "auto", pr: 0.5 }}>
            <List disablePadding>
              {filteredReports.map((report) => {
                const repAvatar = resolveProfileImageUrl(report.profileUrl || report.fullProfileUrl);
                const repGradient = getAvatarGradient(report.fullName || report.firstName);
                const repDept = getDepartmentTheme(report.departmentName);
                return (
                  <ListItem
                    key={report.userId}
                    disablePadding
                    sx={{ mb: 0.8 }}
                    secondaryAction={
                      <Tooltip title="View Profile">
                        <IconButton
                          size="small"
                          edge="end"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/employees/${report.userId}/about`);
                          }}
                          aria-label={`View profile for ${report.fullName}`}
                        >
                          <OpenInNewRounded sx={{ fontSize: 16, color: "#64748b" }} />
                        </IconButton>
                      </Tooltip>
                    }
                  >
                    <ListItemButton
                      onClick={() => onFocusNode(report.userId)}
                      sx={{
                        borderRadius: "10px",
                        border: "1px solid",
                        borderColor: "divider",
                        py: 0.8,
                        pr: 5,
                        "&:hover": { borderColor: "primary.main", bgcolor: "action.hover" },
                      }}
                    >
                      <ListItemAvatar sx={{ minWidth: 42 }}>
                        <Avatar
                          src={repAvatar}
                          sx={{
                            width: 32,
                            height: 32,
                            background: repGradient,
                            fontSize: "0.8rem",
                            fontWeight: 700,
                          }}
                        >
                          {(report.firstName || report.fullName || "U").charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={report.fullName}
                        secondary={
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.2 }}>
                            <Typography variant="caption" sx={{ color: "text.secondary", fontWeight: 500 }} noWrap>
                              {report.jobRoleTitle || "Team Member"}
                            </Typography>
                            {report.departmentName && (
                              <Box
                                component="span"
                                sx={{
                                  fontSize: "0.68rem",
                                  px: 0.6,
                                  py: 0.1,
                                  borderRadius: "4px",
                                  bgcolor: repDept.bg,
                                  color: repDept.color,
                                  fontWeight: 600,
                                }}
                              >
                                {report.departmentName}
                              </Box>
                            )}
                          </Stack>
                        }
                        primaryTypographyProps={{ variant: "body2", fontWeight: 700 }}
                      />
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>
        </Box>
      )}

      {/* Footer Actions */}
      <Stack direction="row" spacing={1.5} sx={{ mt: "auto", pt: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => onFocusNode(node.userId)}
          startIcon={<AccountTreeRounded sx={{ fontSize: 18 }} />}
          sx={{
            py: 1,
            borderRadius: "10px",
            fontWeight: 700,
            textTransform: "none",
          }}
        >
          Focus in Chart
        </Button>
        <Button
          fullWidth
          variant="contained"
          endIcon={<OpenInNewRounded sx={{ fontSize: 18 }} />}
          onClick={handleOpenFullProfile}
          sx={{
            py: 1,
            borderRadius: "10px",
            fontWeight: 700,
            textTransform: "none",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.25)",
          }}
        >
          View Full Profile
        </Button>
      </Stack>
    </Drawer>
  );
};
