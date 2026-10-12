import { useEffect } from "react";
import AssignmentLateOutlined from "@mui/icons-material/AssignmentLateOutlined";
import FactCheckOutlined from "@mui/icons-material/FactCheckOutlined";
import TuneRounded from "@mui/icons-material/TuneRounded";
import { Box, Card } from "@mui/material";
import clsx from "clsx";
import { useSearchParams } from "react-router-dom";
import { usePageData } from "../../Context/PageDataProvider";
import { EmployeeLifecycleCaseQueue } from "./components/EmployeeLifecycleCaseQueue";
import { EmployeeLifecyclePolicyConfig } from "./components/EmployeeLifecyclePolicyConfig";
import { EmployeeLifecycleReconciliationPanel } from "./components/EmployeeLifecycleReconciliationPanel";

type LifecycleView = "cases" | "policies" | "reconciliation";

const views: Array<{
  value: LifecycleView;
  label: string;
  icon: JSX.Element;
}> = [
  {
    value: "cases",
    label: "Lifecycle Cases",
    icon: <AssignmentLateOutlined fontSize="small" />,
  },
  {
    value: "policies",
    label: "Special Leaves & Policies",
    icon: <TuneRounded fontSize="small" />,
  },
  {
    value: "reconciliation",
    label: "Reconciliation Register",
    icon: <FactCheckOutlined fontSize="small" />,
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
    : "cases";

  useEffect(() => {
    setPageTitle("Employee Lifecycle");
  }, [setPageTitle]);

  const handleViewChange = (value: LifecycleView) => {
    setSearchParams({ view: value }, { replace: true });
  };

  return (
    <Box sx={{ width: "100%", maxWidth: "none", mx: 0, pb: { xs: 2, md: 3 } }}>
      {/* Codeji HRMS Consistent Theme Tab Container */}
      <Card
        role="tablist"
        aria-label="Employee lifecycle sections"
        className="tab-container d-flex flex-row"
        sx={{
          mb: 2.5,
          borderRadius: 3,
          p: 0.75,
          gap: 0.5,
          overflowX: "auto",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          "& .tab-box": {
            flex: { xs: "0 0 auto", sm: "1 1 0" },
            minWidth: { xs: 140, sm: 0 },
            justifyContent: "center",
            textAlign: "center",
          },
        }}
      >
        {views.map((tab) => {
          const isSelected = activeView === tab.value;
          return (
            <Box
              component="div"
              key={tab.value}
              role="tab"
              aria-selected={isSelected}
              className={clsx("tab-box", {
                tab_active: isSelected,
              })}
              onClick={() => handleViewChange(tab.value)}
            >
              {tab.icon}
              {tab.label}
            </Box>
          );
        })}
      </Card>

      {/* Tab Panels */}
      <Box
        role="tabpanel"
        id={`lifecycle-panel-${activeView}`}
        aria-labelledby={`lifecycle-tab-${activeView}`}
        sx={{ minWidth: 0 }}
      >
        {activeView === "cases" && <EmployeeLifecycleCaseQueue />}
        {activeView === "policies" && (
          <EmployeeLifecyclePolicyConfig canEdit showHeader={false} />
        )}
        {activeView === "reconciliation" && (
          <EmployeeLifecycleReconciliationPanel showHeader={false} />
        )}
      </Box>
    </Box>
  );
};

export default EmployeeLifecycleManagement;
