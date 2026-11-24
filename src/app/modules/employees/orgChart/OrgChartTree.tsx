import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import GroupsRounded from "@mui/icons-material/GroupsRounded";
import { OrgChartNode } from "./orgChartModel";
import { OrgChartNodeCard } from "./OrgChartNodeCard";

interface OrgChartTreeProps {
  node: OrgChartNode;
  expandedMap: Record<string, boolean>;
  selectedUserId?: string | null;
  onToggleExpand: (userId: string) => void;
  onSelect: (node: OrgChartNode) => void;
}

export const OrgChartTree: React.FC<OrgChartTreeProps> = ({
  node,
  expandedMap,
  selectedUserId,
  onToggleExpand,
  onSelect,
}) => {
  const isExpanded = expandedMap[node.userId] !== false; // expanded unless explicitly false
  const hasChildren = Boolean(node.directReports && node.directReports.length > 0);
  const isSelected = selectedUserId === node.userId;
  const GAP_PX = 32;
  const HALF_GAP = GAP_PX / 2;
  const LINE_HEIGHT = 28;
  const LINE_COLOR = "#94a3b8";

  // When a manager has a large direct team (> 5) and none of the direct reports have children of their own,
  // arrange them in a clean multi-column team grid rather than sprawling 44 cards across 13,000 horizontal pixels!
  const allReportsAreLeaves = hasChildren && node.directReports.every((c) => !c.directReports || c.directReports.length === 0);
  const useTeamCluster = hasChildren && node.directReports.length > 5 && allReportsAreLeaves;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Node Card */}
      <OrgChartNodeCard
        node={node}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onToggleExpand={onToggleExpand}
        onSelect={onSelect}
      />

      {/* Children branches and connector lines */}
      {hasChildren && isExpanded && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            position: "relative",
            pt: `${LINE_HEIGHT}px`,
          }}
        >
          {/* Vertical stem dropping from parent */}
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: "50%",
              width: "2px",
              height: `${LINE_HEIGHT}px`,
              bgcolor: LINE_COLOR,
              transform: "translateX(-50%)",
            }}
          />

          {useTeamCluster ? (
            /* Responsive Team Cluster Grid for large leaf teams (e.g. 44 direct reports) */
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: "16px",
                bgcolor: "rgba(255, 255, 255, 0.95)",
                border: "1.5px solid #e2e8f0",
                boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
                maxWidth: 1160,
                width: "100%",
                mt: 0.5,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, px: 0.5 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <GroupsRounded sx={{ fontSize: 20, color: "#2563eb" }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "#0f172a" }}>
                    Direct Reports Team ({node.directReports.length} Members)
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                  Reporting directly to {node.fullName}
                </Typography>
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
                {node.directReports.map((child) => (
                  <OrgChartNodeCard
                    key={child.userId}
                    node={child}
                    isExpanded={false}
                    isSelected={selectedUserId === child.userId}
                    onToggleExpand={onToggleExpand}
                    onSelect={onSelect}
                  />
                ))}
              </Box>
            </Paper>
          ) : (
            /* Children container with seamless crossbar */
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                columnGap: `${GAP_PX}px`,
                position: "relative",
                width: "100%",
              }}
            >
              {node.directReports.map((child, idx) => {
                const isOnlyChild = node.directReports.length === 1;
                const isFirstChild = idx === 0;
                const isLastChild = idx === node.directReports.length - 1;

                return (
                  <Box
                    key={child.userId}
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    {/* Horizontal crossbar segment */}
                    {!isOnlyChild && (
                      <Box
                        sx={{
                          position: "absolute",
                          top: 0,
                          height: "2px",
                          bgcolor: LINE_COLOR,
                          left: isFirstChild ? "50%" : `-${HALF_GAP}px`,
                          right: isLastChild ? "50%" : `-${HALF_GAP}px`,
                        }}
                      />
                    )}

                    {/* Vertical line dropping into child card */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: "50%",
                        width: "2px",
                        height: `${LINE_HEIGHT}px`,
                        bgcolor: LINE_COLOR,
                        transform: "translateX(-50%)",
                      }}
                    />

                    {/* Child offset to match line height */}
                    <Box sx={{ pt: `${LINE_HEIGHT}px` }}>
                      <OrgChartTree
                        node={child}
                        expandedMap={expandedMap}
                        selectedUserId={selectedUserId}
                        onToggleExpand={onToggleExpand}
                        onSelect={onSelect}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};
