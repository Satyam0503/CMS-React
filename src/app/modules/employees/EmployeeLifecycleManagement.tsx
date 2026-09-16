import { useEffect, useMemo } from "react";
import {
  AssignmentLateOutlined,
  FactCheckOutlined,
  TuneRounded,
} from "@mui/icons-material";
import { Box, Card, Paper, Tab, Tabs, Tooltip, Typography } from "@mui/material";
import { useSearchParams } from "react-router-dom";
import { usePageData } from "../../Context/PageDataProvider";
import { EmployeeLifecycleCaseQueue } from "./components/EmployeeLifecycleCaseQueue";
import { EmployeeLifecyclePolicyConfig } from "./components/EmployeeLifecyclePolicyConfig";
import { EmployeeLifecycleReconciliationPanel } from "./components/EmployeeLifecycleReconciliationPanel";

type LifecycleView = "policies" | "reconciliation" | "cases";

const views: Array<{
  value: LifecycleView;
  label: string;
  description: string;
  icon: JSX.Element;
}> = [
  {
    value: "policies",
    label: "Policy reference",
    description: "Read-only lifecycle rules sourced from Leave Management policies.",
    icon: <TuneRounded />,
  },
  {
    value: "reconciliation",
    label: "Reconciliation",
    description: "Review the read-only connection between approved leave and employment status.",
    icon: <FactCheckOutlined />,
  },
  {
    value: "cases",
    label: "Lifecycle cases",
    description: "Track documents, extensions, expected returns, and open HR actions.",
    icon: <AssignmentLateOutlined />,
  },
];

const isLifecycleView = (value: string | null): value is LifecycleView =>
  views.some((view) => view.value === value);

const EmployeeLifecycleManagement = () => {
  const { setPageTitle } = usePageData();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedView = searchParams.get("view");
  const activeView: LifecycleView = isLifecycleView(requestedView)
    ? requestedView
    : "policies";
  const activeDetails = useMemo(
    () => views.find((view) => view.value === activeView) ?? views[0],
    [activeView],
  );

  useEffect(() => {
    setPageTitle("Lifecycle Management");
  }, [setPageTitle]);

  const handleViewChange = (_event: React.SyntheticEvent, value: LifecycleView) => {
    setSearchParams({ view: value }, { replace: true });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "none", mx: 0, pb: { xs: 2, md: 3 } }}>
      <Paper
        variant="outlined"
        sx={{
          mb: 2,
          borderRadius: 3,
          overflow: "hidden",
          bgcolor: "background.paper",
        }}
      >
        <Tabs
          value={activeView}
          onChange={handleViewChange}
          variant="fullWidth"
          aria-label="Lifecycle management sections"
          sx={{
            px: { xs: 0.5, sm: 1 },
            minHeight: 58,
            "& .MuiTab-root": {
              minHeight: 58,
              minWidth: 0,
              flex: "1 1 0",
              px: { xs: 0.5, sm: 2 },
              fontWeight: 700,
              textTransform: "none",
              color: "text.secondary",
              borderRadius: 2,
              mx: 0.25,
              "&:hover": { bgcolor: "action.hover", color: "primary.main" },
              "&.Mui-selected": { color: "primary.main", bgcolor: "action.selected" },
              "@media (max-width: 1023px)": {
                minHeight: 52,
                px: 0.5,
                "& .lifecycle-tab-label": { display: "none" },
                "& .MuiSvgIcon-root": { fontSize: 23, marginBottom: 0 },
              },
            },
            "& .MuiTabs-indicator": { height: 3, borderRadius: 3, bgcolor: "primary.main" },
          }}
        >
          {views.map((view) => (
            <Tooltip key={view.value} title={view.label} placement="bottom">
              <Tab
                value={view.value}
                label={<Box component="span" className="lifecycle-tab-label">{view.label}</Box>}
                icon={view.icon}
                iconPosition="start"
                aria-label={view.label}
                aria-controls={`lifecycle-panel-${view.value}`}
                id={`lifecycle-tab-${view.value}`}
              />
            </Tooltip>
          ))}
        </Tabs>
      </Paper>

      <Box
        role="tabpanel"
        id={`lifecycle-panel-${activeView}`}
        aria-labelledby={`lifecycle-tab-${activeView}`}
        sx={{ minWidth: 0 }}
      >
        {activeView === "cases" ? (
          <EmployeeLifecycleCaseQueue />
        ) : (
          <Card
            sx={{
              borderRadius: 3,
              border: "1px solid",
              borderColor: "divider",
              boxShadow: "0 12px 30px rgba(33, 93, 110, .06)",
              overflow: "hidden",
            }}
          >
            <Box sx={{ p: { xs: 2, sm: 2.5 }, borderBottom: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {activeDetails.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {activeDetails.description}
              </Typography>
            </Box>
            <Box sx={{ p: { xs: 1.25, sm: 2.5 }, minWidth: 0, overflowX: "hidden" }}>
              {activeView === "policies" && (
                <EmployeeLifecyclePolicyConfig canEdit showHeader={false} />
              )}
              {activeView === "reconciliation" && (
                <EmployeeLifecycleReconciliationPanel showHeader={false} />
              )}
            </Box>
          </Card>
        )}
      </Box>
    </Box>
  );
};

export default EmployeeLifecycleManagement;
