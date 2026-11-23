import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import AccountTreeRounded from "@mui/icons-material/AccountTreeRounded";
import BusinessOutlined from "@mui/icons-material/BusinessOutlined";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import OpenInNewRounded from "@mui/icons-material/OpenInNewRounded";
import PeopleAltOutlined from "@mui/icons-material/PeopleAltOutlined";
import Search from "@mui/icons-material/Search";
import VisibilityOutlined from "@mui/icons-material/VisibilityOutlined";
import WorkOutlineRounded from "@mui/icons-material/WorkOutlineRounded";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageData } from "../../../Context/PageDataProvider";
import { OrgChartNode, OrgChartResponse } from "./orgChartModel";
import { getOrganizationChart } from "./orgChartService";
import { OrgChartControls } from "./OrgChartControls";
import { OrgChartTree } from "./OrgChartTree";
import { OrgChartNodeCard } from "./OrgChartNodeCard";
import { EmployeeQuickDrawer } from "./EmployeeQuickDrawer";
import { getAvatarGradient, getDepartmentTheme, resolveProfileImageUrl } from "./orgChartTheme";

export interface OrgChartPageProps {
  embedded?: boolean;
}

export const OrgChartPage: React.FC<OrgChartPageProps> = ({ embedded = false }) => {
  const { setPageTitle } = usePageData();
  const navigate = useNavigate();

  // Clear any stale module headers when viewed as standalone page
  useEffect(() => {
    if (!embedded) {
      setPageTitle("");
      return () => setPageTitle("");
    }
  }, [embedded, setPageTitle]);

  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [viewMode, setViewMode] = useState<"tree" | "list">("tree");

  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);

  const [search, setSearch] = useState<string>("");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("ALL");
  const [selectedNode, setSelectedNode] = useState<OrgChartNode | null>(null);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [expandedMap, setExpandedMap] = useState<Record<string, boolean>>({});
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync fullscreen state with document
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Reset pagination when search or department changes
  useEffect(() => {
    setPage(0);
  }, [search, selectedDepartment]);

  // Fetch organization chart data
  const {
    data: chartData,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<OrgChartResponse>({
    queryKey: ["orgChart", selectedDepartment, search],
    queryFn: () => getOrganizationChart(selectedDepartment, search),
    staleTime: 60_000,
  });

  const roots = chartData?.roots ?? [];

  // Partition roots into leadership trees (with teams) and unassigned individual contributors
  const { leadershipRoots, independentRoots } = useMemo(() => {
    const leaders: OrgChartNode[] = [];
    const independents: OrgChartNode[] = [];
    for (const r of roots) {
      if (r.directReports && r.directReports.length > 0) {
        leaders.push(r);
      } else {
        independents.push(r);
      }
    }
    return { leadershipRoots: leaders, independentRoots: independents };
  }, [roots]);

  // Initialize smart expansion: expand level 1 (roots) and level 2 (direct reports)
  useEffect(() => {
    if (!roots.length) return;
    const initialMap: Record<string, boolean> = {};
    for (const r of roots) {
      initialMap[r.userId] = true;
      if (r.directReports?.length) {
        for (const child of r.directReports) {
          // If child has children, expand Level 2, leave Level 3+ collapsed
          initialMap[child.userId] = true;
          if (child.directReports?.length) {
            for (const sub of child.directReports) {
              initialMap[sub.userId] = false;
            }
          }
        }
      }
    }
    setExpandedMap(initialMap);
  }, [chartData]);

  // Pan interaction handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only drag on canvas background
    if ((e.target as HTMLElement).closest("[role='treeitem']") || (e.target as HTMLElement).closest("button")) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.08 : -0.08;
      setZoom((prev) => Math.min(Math.max(Number((prev + delta).toFixed(2)), 0.35), 1.8));
    }
  };

  // Zoom & canvas actions
  const handleZoomIn = () => setZoom((prev) => Math.min(Number((prev + 0.1).toFixed(2)), 1.8));
  const handleZoomOut = () => setZoom((prev) => Math.max(Number((prev - 0.1).toFixed(2)), 0.35));
  const handleZoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleFitScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (containerRef.current) {
        containerRef.current.requestFullscreen().catch(() => {});
      }
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Node expand / collapse actions
  const handleToggleExpand = (userId: string) => {
    setExpandedMap((prev) => ({
      ...prev,
      [userId]: prev[userId] === false ? true : false,
    }));
  };

  const handleExpandAll = () => {
    if (!roots.length) return;
    const newMap: Record<string, boolean> = {};
    const traverse = (nodes: OrgChartNode[]) => {
      for (const n of nodes) {
        newMap[n.userId] = true;
        if (n.directReports?.length) traverse(n.directReports);
      }
    };
    traverse(roots);
    setExpandedMap(newMap);
  };

  const handleCollapseAll = () => {
    if (!roots.length) return;
    const newMap: Record<string, boolean> = {};
    const traverse = (nodes: OrgChartNode[]) => {
      for (const n of nodes) {
        newMap[n.userId] = false;
        if (n.directReports?.length) traverse(n.directReports);
      }
    };
    traverse(roots);
    setExpandedMap(newMap);
  };

  // Node selection for profile drawer
  const handleSelectNode = (node: OrgChartNode) => {
    setSelectedNode(node);
    setDrawerOpen(true);
  };

  // Find node by userId anywhere in tree to focus from drawer
  const findNodeById = useCallback(
    (nodes: OrgChartNode[], id: string): OrgChartNode | null => {
      for (const n of nodes) {
        if (n.userId === id) return n;
        if (n.directReports?.length) {
          const found = findNodeById(n.directReports, id);
          if (found) return found;
        }
      }
      return null;
    },
    [],
  );

  const handleFocusNode = (userId: string) => {
    if (!roots.length) return;
    const target = findNodeById(roots, userId);
    if (target) {
      setExpandedMap((prev) => ({ ...prev, [userId]: true }));
      setSelectedNode(target);
    }
  };

  // Flatten tree for Directory List view
  const flattenNodes = useCallback((nodes: OrgChartNode[], depth: number = 0): Array<{ node: OrgChartNode; depth: number }> => {
    const list: Array<{ node: OrgChartNode; depth: number }> = [];
    for (const n of nodes) {
      list.push({ node: n, depth });
      if (n.directReports?.length) {
        list.push(...flattenNodes(n.directReports, depth + 1));
      }
    }
    return list;
  }, []);

  const allDirectoryNodes = useMemo(() => flattenNodes(roots), [roots, flattenNodes]);

  // Client-side instant filter on flattened directory nodes
  const filteredDirectoryNodes = useMemo(() => {
    let nodes = allDirectoryNodes;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      nodes = nodes.filter(
        ({ node }) =>
          node.fullName?.toLowerCase().includes(q) ||
          node.employeeId?.toLowerCase().includes(q) ||
          node.email?.toLowerCase().includes(q) ||
          node.jobRoleTitle?.toLowerCase().includes(q) ||
          node.departmentName?.toLowerCase().includes(q)
      );
    }
    if (selectedDepartment && selectedDepartment !== "ALL") {
      const selectedDeptObj = chartData?.departments?.find(
        (d) => d.departmentId === selectedDepartment
      );
      const targetName = selectedDeptObj?.departmentName?.toLowerCase();
      nodes = nodes.filter(
        ({ node }) =>
          node.departmentId === selectedDepartment ||
          (targetName && node.departmentName?.toLowerCase() === targetName) ||
          node.departmentName?.toLowerCase() === selectedDepartment.toLowerCase()
      );
    }
    return nodes;
  }, [allDirectoryNodes, search, selectedDepartment]);

  const paginatedDirectoryNodes = useMemo(() => {
    return filteredDirectoryNodes.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage
    );
  }, [filteredDirectoryNodes, page, rowsPerPage]);

  return (
    <Box
      ref={containerRef}
      sx={{
        display: "flex",
        flexDirection: "column",
        height: isFullscreen
          ? "100vh"
          : viewMode === "tree"
            ? (embedded ? "calc(100vh - 180px)" : "calc(100vh - 110px)")
            : "auto",
        minHeight: isFullscreen
          ? "100vh"
          : embedded
            ? "calc(100vh - 180px)"
            : "calc(100vh - 110px)",
        bgcolor: isFullscreen ? "#ffffff" : "transparent",
        p: isFullscreen ? 2 : 0,
        gap: 2,
        overflow: viewMode === "tree" ? "hidden" : "visible",
        pb: viewMode === "list" ? 4 : 0,
      }}
    >
      {/* Header & Metrics */}
      {!embedded && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "10px",
                  bgcolor: "#eff6ff",
                  color: "#2563eb",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AccountTreeRounded sx={{ fontSize: 22 }} />
              </Box>
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a", fontSize: "1.25rem", lineHeight: 1.2 }}>
                  Organization Chart
                </Typography>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 500 }}>
                  Interactive hierarchy explorer and team reporting structure
                </Typography>
              </Box>
            </Stack>
          </Box>

          {chartData && (
            <Stack direction="row" spacing={1.5}>
              <Paper
                variant="outlined"
                sx={{
                  px: 2,
                  py: 0.8,
                  borderRadius: "12px",
                  bgcolor: "#ffffff",
                  borderColor: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <PeopleAltOutlined sx={{ fontSize: 20, color: "#2563eb" }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 600 }}>
                    Headcount
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1, color: "#0f172a" }}>
                    {chartData.totalEmployeesCount ?? 0}
                  </Typography>
                </Box>
              </Paper>

              <Paper
                variant="outlined"
                sx={{
                  px: 2,
                  py: 0.8,
                  borderRadius: "12px",
                  bgcolor: "#ffffff",
                  borderColor: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                }}
              >
                <BusinessOutlined sx={{ fontSize: 20, color: "#8b5cf6" }} />
                <Box>
                  <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.7rem", fontWeight: 600 }}>
                    Departments
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1, color: "#0f172a" }}>
                    {chartData.totalDepartmentsCount ?? 0}
                  </Typography>
                </Box>
              </Paper>
            </Stack>
          )}
        </Stack>
      )}

      {/* Control Bar */}
      <OrgChartControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        onFitScreen={handleFitScreen}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        onExpandAll={handleExpandAll}
        onCollapseAll={handleCollapseAll}
        search={search}
        onSearchChange={setSearch}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={setSelectedDepartment}
        departments={chartData?.departments || []}
        totalEmployees={chartData?.totalEmployeesCount || 0}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main View Area */}
      {viewMode === "tree" ? (
        /* Visual Canvas */
        <Box
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          sx={{
            flex: 1,
            bgcolor: "#f8fafc",
            backgroundImage: "radial-gradient(#cbd5e1 1.2px, transparent 1.2px)",
            backgroundSize: "24px 24px",
            borderRadius: "14px",
            border: "1px solid #e2e8f0",
            overflow: "auto",
            position: "relative",
            cursor: isDragging ? "grabbing" : "grab",
            userSelect: "none",
            p: 4,
            minHeight: 480,
          }}
        >
          {/* Loading Spinner */}
          {isLoading && (
            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", width: "100%" }} spacing={2}>
              <CircularProgress size={36} thickness={4} />
              <Typography variant="body2" sx={{ color: "#64748b", fontWeight: 500 }}>
                Rendering organization hierarchy...
              </Typography>
            </Stack>
          )}

          {/* Error Alert */}
          {isError && (
            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", width: "100%", p: 4 }}>
              <Alert severity="error" sx={{ maxWidth: 500, borderRadius: "12px" }}>
                {(error as Error)?.message || "Failed to load organizational chart"}
              </Alert>
            </Stack>
          )}

          {/* Empty State */}
          {!isLoading && !isError && roots.length === 0 && (
            <Stack alignItems="center" justifyContent="center" sx={{ height: "100%", width: "100%" }} spacing={1.5}>
              <AccountTreeRounded sx={{ fontSize: 48, color: "#94a3b8", opacity: 0.5 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#0f172a" }}>
                No Organization Nodes Found
              </Typography>
              <Typography variant="body2" sx={{ color: "#64748b" }}>
                Try adjusting your search query or department filter.
              </Typography>
            </Stack>
          )}

          {/* Tree Rendering: Clean hierarchy with separated unassigned tray */}
          {!isLoading && !isError && roots.length > 0 && (
            <Box
              role="tree"
              aria-label="Company Organization Hierarchy"
              sx={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                transformOrigin: "top center",
                transition: isDragging ? "none" : "transform 0.15s ease-out",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                py: 2,
                minWidth: "fit-content",
              }}
            >
              {/* Main Organization Hierarchy Tree */}
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  columnGap: 8,
                  rowGap: 8,
                  flexWrap: "wrap",
                  minWidth: "fit-content",
                }}
              >
                {(leadershipRoots.length > 0 ? leadershipRoots : roots).map((rootNode) => (
                  <OrgChartTree
                    key={rootNode.userId}
                    node={rootNode}
                    expandedMap={expandedMap}
                    selectedUserId={selectedNode?.userId}
                    onToggleExpand={handleToggleExpand}
                    onSelect={handleSelectNode}
                  />
                ))}
              </Box>

              {/* Unassigned Individual Contributors Section */}
              {leadershipRoots.length > 0 && independentRoots.length > 0 && (
                <Box sx={{ mt: 8, width: "100%", maxWidth: 1140, px: 2 }}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: "16px",
                      bgcolor: "rgba(255, 255, 255, 0.95)",
                      border: "1.5px dashed #cbd5e1",
                      boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
                    }}
                  >
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", sm: "center" }}
                      spacing={1}
                      sx={{ mb: 2 }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box
                          sx={{
                            width: 34,
                            height: 34,
                            borderRadius: "10px",
                            bgcolor: "#eff6ff",
                            color: "#2563eb",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PeopleAltOutlined sx={{ fontSize: 20 }} />
                        </Box>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                            Unassigned Contributors ({independentRoots.length})
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#64748b" }}>
                            These employees currently have no reporting manager assigned in their profile.
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: {
                          xs: "1fr",
                          sm: "repeat(2, minmax(240px, 1fr))",
                          md: "repeat(3, minmax(240px, 1fr))",
                          lg: "repeat(4, minmax(240px, 1fr))",
                        },
                        gap: 2,
                      }}
                    >
                      {independentRoots.map((node) => (
                        <OrgChartNodeCard
                          key={node.userId}
                          node={node}
                          isExpanded={false}
                          isSelected={selectedNode?.userId === node.userId}
                          onToggleExpand={handleToggleExpand}
                          onSelect={handleSelectNode}
                        />
                      ))}
                    </Box>
                  </Paper>
                </Box>
              )}
            </Box>
          )}
        </Box>
      ) : (
        /* Directory List View */
        <Paper
          variant="outlined"
          sx={{
            borderRadius: "14px",
            borderColor: "#e2e8f0",
            overflow: "hidden",
            bgcolor: "#ffffff",
            boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            mb: 3,
          }}
        >
          <TableContainer sx={{ overflowX: "auto", overflowY: "auto", maxHeight: "calc(100vh - 300px)", minHeight: 380 }}>
            <Table stickyHeader sx={{ minWidth: 800 }}>
              <TableHead>
                <TableRow
                  sx={{
                    "& th": {
                      bgcolor: "#f8fafc",
                      fontWeight: 700,
                      color: "#475569",
                      fontSize: "0.82rem",
                      py: 1.2,
                      borderBottom: "1px solid #e2e8f0",
                    },
                  }}
                >
                  <TableCell sx={{ width: "30%", minWidth: 260 }}>Employee</TableCell>
                  <TableCell sx={{ width: "22%", minWidth: 200 }}>Role & Hierarchy</TableCell>
                  <TableCell sx={{ width: "16%", minWidth: 150 }}>Department</TableCell>
                  <TableCell sx={{ width: "18%", minWidth: 170 }}>Reporting Manager</TableCell>
                  <TableCell align="center" sx={{ width: "12%", minWidth: 120 }}>Direct Reports</TableCell>
                  <TableCell align="right" sx={{ width: "8%", minWidth: 80 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDirectoryNodes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                      <Stack alignItems="center" spacing={1.5}>
                        <Search sx={{ fontSize: 36, color: "#94a3b8", opacity: 0.7 }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#334155" }}>
                          No employees found
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#64748b" }}>
                          {search ? `No matches found for "${search}"` : "No employees in this department"}
                        </Typography>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedDirectoryNodes.map(({ node, depth }) => {
                    const deptTheme = getDepartmentTheme(node.departmentName);
                    const avatarBg = getAvatarGradient(node.fullName || node.firstName);
                    const avatarSrc = resolveProfileImageUrl(node.profileUrl || node.fullProfileUrl);

                    return (
                      <TableRow
                        key={node.userId}
                        hover
                        onClick={() => handleSelectNode(node)}
                        sx={{
                          cursor: "pointer",
                          transition: "background-color 0.15s ease",
                          "&:hover": { bgcolor: "#f8fafc" },
                        }}
                      >
                      {/* Employee Column: Aligned Avatar, Name, Employee ID & Email */}
                      <TableCell sx={{ py: 1 }}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Badge
                            overlap="circular"
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            variant="dot"
                            sx={{
                              "& .MuiBadge-badge": {
                                bgcolor: "#10b981",
                                color: "#10b981",
                                boxShadow: "0 0 0 2px #fff",
                              },
                            }}
                          >
                            <Avatar
                              src={avatarSrc}
                              alt={node.fullName}
                              sx={{
                                width: 36,
                                height: 36,
                                background: avatarBg,
                                fontSize: "0.88rem",
                                fontWeight: 700,
                                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                              }}
                            >
                              {(node.firstName || node.fullName || "U").charAt(0).toUpperCase()}
                            </Avatar>
                          </Badge>
                          <Box sx={{ minWidth: 0 }}>
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Typography
                                variant="body2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/employees/${node.userId}/about`);
                                }}
                                sx={{
                                  fontWeight: 700,
                                  color: "#0f172a",
                                  cursor: "pointer",
                                  "&:hover": { color: "#2563eb", textDecoration: "underline" },
                                }}
                              >
                                {node.fullName}
                              </Typography>
                              {node.employeeId && (
                                <Chip
                                  label={node.employeeId}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.68rem",
                                    fontWeight: 600,
                                    bgcolor: "#f1f5f9",
                                    color: "#475569",
                                    borderRadius: "4px",
                                  }}
                                />
                              )}
                            </Stack>
                            <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mt: 0.3 }}>
                              <MailOutlineRounded sx={{ fontSize: 13, color: "#94a3b8" }} />
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "#64748b",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                  maxWidth: 220,
                                }}
                              >
                                {node.email}
                              </Typography>
                            </Stack>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Role & Hierarchy Level */}
                      <TableCell sx={{ py: 1 }}>
                        <Stack spacing={0.5} alignItems="flex-start">
                          <Typography variant="body2" sx={{ color: "#1e293b", fontWeight: 600 }}>
                            {node.jobRoleTitle || "Team Member"}
                          </Typography>
                          {depth === 0 ? (
                            <Chip
                              size="small"
                              label="Level 1 • Head of Org"
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                fontWeight: 700,
                                bgcolor: "#eff6ff",
                                color: "#1d4ed8",
                                border: "1px solid #bfdbfe",
                                borderRadius: "5px",
                              }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              label={`Level ${depth + 1} • Direct Report`}
                              sx={{
                                height: 20,
                                fontSize: "0.68rem",
                                fontWeight: 600,
                                bgcolor: "#f8fafc",
                                color: "#475569",
                                border: "1px solid #e2e8f0",
                                borderRadius: "5px",
                              }}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      {/* Department */}
                      <TableCell sx={{ py: 1 }}>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 0.8,
                            px: 1.2,
                            py: 0.4,
                            borderRadius: "6px",
                            bgcolor: deptTheme.bg,
                            border: `1px solid ${deptTheme.border}`,
                          }}
                        >
                          <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: deptTheme.dot }} />
                          <Typography sx={{ fontSize: "0.75rem", fontWeight: 600, color: deptTheme.color }}>
                            {node.departmentName || "General"}
                          </Typography>
                        </Box>
                      </TableCell>

                      {/* Reporting Manager */}
                      <TableCell sx={{ py: 1 }}>
                        {(() => {
                          const isSelfOrTopLevel =
                            !node.reportingManagerName ||
                            !node.reportingManagerUserId ||
                            node.reportingManagerUserId === node.userId ||
                            node.reportingManagerName.trim().toLowerCase() === (node.fullName || "").trim().toLowerCase();

                          if (isSelfOrTopLevel) {
                            return (
                              <Chip
                                size="small"
                                label={depth === 0 ? "Head of Organization" : "Top-Level / Independent"}
                                sx={{
                                  height: 20,
                                  fontSize: "0.68rem",
                                  fontWeight: 700,
                                  bgcolor: "#eff6ff",
                                  color: "#1d4ed8",
                                  border: "1px solid #bfdbfe",
                                  borderRadius: "5px",
                                }}
                              />
                            );
                          }

                          const managerName = node.reportingManagerName || "Manager";

                          return (
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              onClick={(e) => {
                                if (node.reportingManagerUserId) {
                                  e.stopPropagation();
                                  navigate(`/employees/${node.reportingManagerUserId}/about`);
                                }
                              }}
                              sx={{
                                cursor: node.reportingManagerUserId ? "pointer" : "default",
                                width: "fit-content",
                                "&:hover .manager-name": node.reportingManagerUserId
                                  ? { color: "#2563eb", textDecoration: "underline" }
                                  : {},
                              }}
                            >
                              <Avatar
                                sx={{
                                  width: 26,
                                  height: 26,
                                  fontSize: "0.72rem",
                                  fontWeight: 700,
                                  bgcolor: "#eff6ff",
                                  color: "#2563eb",
                                  border: "1px solid #dbeafe",
                                }}
                              >
                                {managerName.charAt(0).toUpperCase()}
                              </Avatar>
                              <Typography
                                className="manager-name"
                                variant="body2"
                                sx={{ color: "#334155", fontWeight: 600, fontSize: "0.82rem", transition: "color 0.15s" }}
                              >
                                {managerName}
                              </Typography>
                            </Stack>
                          );
                        })()}
                      </TableCell>

                      {/* Direct Reports Badge */}
                      <TableCell align="center" sx={{ py: 1 }}>
                        {node.directReportsCount > 0 ? (
                          <Tooltip title={`${node.directReportsCount} direct reports (${node.totalTeamCount} total in team hierarchy)`}>
                            <Chip
                              icon={<PeopleAltOutlined style={{ fontSize: 14, color: "#1d4ed8" }} />}
                              label={`${node.directReportsCount} Direct`}
                              size="small"
                              sx={{
                                height: 24,
                                fontSize: "0.72rem",
                                fontWeight: 700,
                                bgcolor: "#eff6ff",
                                color: "#1e40af",
                                border: "1px solid #bfdbfe",
                                borderRadius: "12px",
                                cursor: "default",
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <Typography variant="body2" sx={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.85rem" }}>
                            —
                          </Typography>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right" sx={{ py: 1 }}>
                        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                          <Tooltip title="Quick Overview">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectNode(node);
                              }}
                              aria-label={`View quick details for ${node.fullName}`}
                              sx={{
                                color: "#64748b",
                                "&:hover": { color: "#2563eb", bgcolor: "#eff6ff" },
                              }}
                            >
                              <VisibilityOutlined sx={{ fontSize: 18 }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="View Full Profile">
                            <IconButton
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/employees/${node.userId}/about`);
                              }}
                              aria-label={`View full profile for ${node.fullName}`}
                              sx={{
                                color: "#2563eb",
                                "&:hover": { color: "#1d4ed8", bgcolor: "#eff6ff" },
                              }}
                            >
                              <OpenInNewRounded sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                }))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Directory List Pagination */}
          <TablePagination
            rowsPerPageOptions={[10, 25, 50, 100]}
            component="div"
            count={filteredDirectoryNodes.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            sx={{
              borderTop: "1px solid #e2e8f0",
              bgcolor: "#f8fafc",
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
                fontSize: "0.85rem",
                color: "#475569",
                fontWeight: 500,
              },
            }}
          />
        </Paper>
      )}

      {/* Slide-over Profile Drawer */}
      <EmployeeQuickDrawer
        node={selectedNode}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onFocusNode={handleFocusNode}
      />
    </Box>
  );
};

export default OrgChartPage;
