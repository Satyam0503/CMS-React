import React from "react";
import {
  Box,
  Button,
  ButtonGroup,
  Chip,
  FormControl,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountTreeRounded from "@mui/icons-material/AccountTreeRounded";
import Add from "@mui/icons-material/Add";
import CenterFocusStrongRounded from "@mui/icons-material/CenterFocusStrongRounded";
import Clear from "@mui/icons-material/Clear";
import FilterAltOutlined from "@mui/icons-material/FilterAltOutlined";
import FormatListBulletedRounded from "@mui/icons-material/FormatListBulletedRounded";
import FullscreenExitRounded from "@mui/icons-material/FullscreenExitRounded";
import FullscreenRounded from "@mui/icons-material/FullscreenRounded";
import Remove from "@mui/icons-material/Remove";
import RestartAlt from "@mui/icons-material/RestartAlt";
import Search from "@mui/icons-material/Search";
import UnfoldLess from "@mui/icons-material/UnfoldLess";
import UnfoldMore from "@mui/icons-material/UnfoldMore";
import { OrgChartDepartmentSummary } from "./orgChartModel";
import { getDepartmentTheme } from "./orgChartTheme";

interface OrgChartControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  onFitScreen?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  onExpandAll: () => void;
  onCollapseAll: () => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (deptId: string) => void;
  departments: OrgChartDepartmentSummary[];
  totalEmployees: number;
  viewMode?: "tree" | "list";
  onViewModeChange?: (mode: "tree" | "list") => void;
}

export const OrgChartControls: React.FC<OrgChartControlsProps> = ({
  zoom,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onFitScreen,
  isFullscreen,
  onToggleFullscreen,
  onExpandAll,
  onCollapseAll,
  search,
  onSearchChange,
  selectedDepartment,
  onDepartmentChange,
  departments,
  totalEmployees,
  viewMode = "tree",
  onViewModeChange,
}) => {
  return (
    <Box
      sx={{
        p: 1.8,
        borderRadius: "14px",
        bgcolor: "#ffffff",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 8px rgba(15, 23, 42, 0.04)",
      }}
    >
      <Stack
        direction={{ xs: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", lg: "center" }}
        spacing={2}
      >
        {/* Search & Department Filters */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ xs: "stretch", sm: "center" }} flex={1}>
          <TextField
            size="small"
            placeholder="Search employee, title, ID..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ fontSize: 18, color: "#94a3b8" }} />
                </InputAdornment>
              ),
              endAdornment: search ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => onSearchChange("")} aria-label="Clear search">
                    <Clear sx={{ fontSize: 16 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
              sx: { borderRadius: "10px", fontSize: "0.85rem", bgcolor: "#f8fafc" },
            }}
            sx={{ minWidth: { xs: "100%", sm: 260 } }}
          />

          <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 200 } }}>
            <Select
              value={selectedDepartment}
              onChange={(e) => onDepartmentChange(e.target.value)}
              displayEmpty
              startAdornment={
                <InputAdornment position="start">
                  <FilterAltOutlined sx={{ fontSize: 18, color: "#94a3b8", ml: 0.5 }} />
                </InputAdornment>
              }
              sx={{ borderRadius: "10px", fontSize: "0.85rem", bgcolor: "#f8fafc" }}
            >
              <MenuItem value="ALL">All Departments</MenuItem>
              {departments.map((dept) => {
                const theme = getDepartmentTheme(dept.departmentName);
                return (
                  <MenuItem key={dept.departmentId} value={dept.departmentId}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: theme.dot }} />
                      <Typography sx={{ fontSize: "0.85rem" }}>
                        {dept.departmentName} ({dept.employeeCount})
                      </Typography>
                    </Box>
                  </MenuItem>
                );
              })}
            </Select>
          </FormControl>

          <Typography
            variant="caption"
            sx={{
              display: { xs: "none", xl: "inline-block" },
              color: "#64748b",
              fontWeight: 600,
              px: 1,
            }}
          >
            {totalEmployees} Employees in Organization
          </Typography>
        </Stack>

        {/* View Mode Toggle, Expand/Collapse & Zoom Controls */}
        <Stack direction="row" spacing={1.5} rowGap={1} alignItems="center" justifyContent={{ xs: "flex-start", sm: "flex-end" }} flexWrap="wrap">
          {/* View Mode Switch */}
          {onViewModeChange && (
            <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: "10px", bgcolor: "#f8fafc" }}>
              <Tooltip title="Visual Tree Diagram — Explore reporting structure interactively">
                <Button
                  onClick={() => onViewModeChange("tree")}
                  variant={viewMode === "tree" ? "contained" : "outlined"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    boxShadow: "none",
                  }}
                  startIcon={<AccountTreeRounded sx={{ fontSize: 16 }} />}
                >
                  Chart
                </Button>
              </Tooltip>
              <Tooltip title="Hierarchy Directory List — View reporting chains and levels in tabular format">
                <Button
                  onClick={() => onViewModeChange("list")}
                  variant={viewMode === "list" ? "contained" : "outlined"}
                  sx={{
                    fontWeight: 600,
                    fontSize: "0.78rem",
                    boxShadow: "none",
                  }}
                  startIcon={<FormatListBulletedRounded sx={{ fontSize: 16 }} />}
                >
                  List
                </Button>
              </Tooltip>
            </ButtonGroup>
          )}

          {/* Tree Expand/Collapse Controls (Only in Tree Mode) */}
          {viewMode === "tree" && (
            <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: "10px" }}>
              <Tooltip title="Expand All Nodes">
                <Button onClick={onExpandAll} startIcon={<UnfoldMore sx={{ fontSize: 16 }} />} sx={{ fontWeight: 600, fontSize: "0.78rem" }}>
                  Expand
                </Button>
              </Tooltip>
              <Tooltip title="Collapse All Nodes">
                <Button onClick={onCollapseAll} startIcon={<UnfoldLess sx={{ fontSize: 16 }} />} sx={{ fontWeight: 600, fontSize: "0.78rem" }}>
                  Collapse
                </Button>
              </Tooltip>
            </ButtonGroup>
          )}

          {/* Zoom & Canvas Actions */}
          {viewMode === "tree" && (
            <ButtonGroup size="small" variant="outlined" sx={{ borderRadius: "10px" }}>
              <Tooltip title="Zoom Out">
                <IconButton onClick={onZoomOut} size="small" sx={{ p: 0.7 }} aria-label="Zoom out">
                  <Remove sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Reset Zoom to 100%">
                <Button onClick={onZoomReset} sx={{ minWidth: 50, fontWeight: 700, fontSize: "0.75rem" }}>
                  {Math.round(zoom * 100)}%
                </Button>
              </Tooltip>
              <Tooltip title="Zoom In">
                <IconButton onClick={onZoomIn} size="small" sx={{ p: 0.7 }} aria-label="Zoom in">
                  <Add sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
              {onFitScreen && (
                <Tooltip title="Center & Fit Canvas">
                  <IconButton onClick={onFitScreen} size="small" sx={{ p: 0.7 }} aria-label="Fit chart to screen">
                    <CenterFocusStrongRounded sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
              {onToggleFullscreen && (
                <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Canvas"}>
                  <IconButton onClick={onToggleFullscreen} size="small" sx={{ p: 0.7 }} aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen canvas"}>
                    {isFullscreen ? <FullscreenExitRounded sx={{ fontSize: 17 }} /> : <FullscreenRounded sx={{ fontSize: 17 }} />}
                  </IconButton>
                </Tooltip>
              )}
            </ButtonGroup>
          )}
        </Stack>
      </Stack>

      {/* Quick Department Filter Pills */}
      {departments && departments.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{
            mt: 1.5,
            pt: 1.2,
            borderTop: "1px dashed #e2e8f0",
            overflowX: "auto",
            pb: 0.5,
            "&::-webkit-scrollbar": { height: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#cbd5e1", borderRadius: 4 },
          }}
        >
          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, whiteSpace: "nowrap", mr: 0.5 }}>
            Departments:
          </Typography>
          <Chip
            label={`All (${totalEmployees})`}
            size="small"
            clickable
            onClick={() => onDepartmentChange("ALL")}
            variant={selectedDepartment === "ALL" ? "filled" : "outlined"}
            color={selectedDepartment === "ALL" ? "primary" : "default"}
            sx={{ fontWeight: 600, fontSize: "0.75rem", borderRadius: "8px" }}
          />
          {departments.map((dept) => {
            const theme = getDepartmentTheme(dept.departmentName);
            const isSelected = selectedDepartment === dept.departmentId;
            return (
              <Chip
                key={dept.departmentId}
                label={`${dept.departmentName} (${dept.employeeCount})`}
                size="small"
                clickable
                onClick={() => onDepartmentChange(dept.departmentId)}
                sx={{
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: "0.75rem",
                  borderRadius: "8px",
                  bgcolor: isSelected ? theme.bg : "#ffffff",
                  borderColor: isSelected ? theme.border : "#e2e8f0",
                  color: isSelected ? theme.color : "#475569",
                  border: "1px solid",
                  "&:hover": {
                    bgcolor: theme.bg,
                    borderColor: theme.border,
                  },
                }}
                icon={<Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: theme.dot, ml: 0.8 }} />}
              />
            );
          })}
        </Stack>
      )}
    </Box>
  );
};
