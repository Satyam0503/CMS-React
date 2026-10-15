import { useIntl } from "react-intl";
import { Link as RouterLink, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { alpha, Box, Card, Tab, Tabs } from "@mui/material";
import { AccessTimeRounded, CorporateFare, Work, SettingsApplicationsRounded, NotificationsActiveRounded, TuneRounded } from "@mui/icons-material";
import { useEffect } from "react";
import { TabModel } from "../../../../utils/common_types";
import clsx from "clsx";
import { checkIsActive } from "../../../../_themes/helpers";
import { ApplicationModules } from "./components/ApplicationModules";
import { CompanyInfo } from "./components/CompanyInfo";
import { OfficeSchedule } from "../companymaster/components/OfficeSchedule";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { usePageData } from "../../../Context/PageDataProvider";
import { EmployeeExitPolicySettings } from "../../users/components/EmployeeExitPolicySettings";
import { CompanyNotificationSettings } from "./components/CompanyNotificationSettings";
import { PayrollConfigurationPanel } from "../../payrollsettings/components/PayrollConfigurationPanel";
import { useAppSelector } from "../../../Redux/hooks";
import { hasModuleFeaturePermission } from "../../../../utils/common";
import { ModulesName, Permission, Roles } from "../../../../utils/enums";

const tabsRoutes: TabModel[] = [
  {
    tabId: 1,
    to: "/admin/companydetails/companyinfo",
    title: "COMPANY_DETAILS.TABS.COMPANY_DETAIL",
    icon: <Work />,
  },
  {
    tabId: 2,
    to: "/admin/companydetails/modules",
    title: "COMPANY_DETAILS.TABS.APPLICATIONS_MODULE",
    icon: <CorporateFare />,
  },
  {
    tabId: 3,
    to: "/admin/companydetails/office-schedule",
    title: "Office Schedule",
    icon: <AccessTimeRounded />,
  },
  {
    tabId: 4,
    to: "/admin/companydetails/offboarding",
    title: "Offboarding",
    icon: <SettingsApplicationsRounded />,
  },
  {
    tabId: 5,
    to: "/admin/companydetails/notifications",
    title: "Notification defaults",
    icon: <NotificationsActiveRounded />,
  },
  { tabId: 6, to: "/admin/companydetails/payroll-configuration", title: "Payroll configuration", icon: <TuneRounded /> },
];

export const CompanyDetailsTab = () => {
  return (
    <Routes>
      <Route element={<CompanyDetails />}>
        <Route index element={<Navigate to={"companyinfo"} replace />} />
        <Route path="modules" element={<ApplicationModules />} />
        <Route path="companyinfo" element={<CompanyInfo />} />
        <Route path="office-schedule" element={<OfficeSchedule />} />
        <Route path="offboarding" element={<EmployeeExitPolicySettings />} />
        <Route path="notifications" element={<CompanyNotificationSettings />} />
        {/* Recruitment readiness is managed separately under Recruitment Settings */}
        <Route path="recruitment-readiness" element={<Navigate to="/recruitment-settings" replace />} />
        <Route path="payroll-configuration" element={<CompanyPayrollConfiguration />} />
      </Route>
      <Route path="*" element={<Navigate to={"/error"} />} />
    </Routes>
  );
};


const CompanyPayrollConfiguration = () => {
  const userData = useAppSelector((state) => state.user.userData);
  const permissions = userData?.modulePermission ?? [];
  const isAdministrator = userData?.roleType === Roles.Administrator;
  const canEdit = isAdministrator || hasModuleFeaturePermission(ModulesName.PayrollSettings, Permission.Edit, permissions);
  const canApprove = isAdministrator || hasModuleFeaturePermission(ModulesName.PayrollSettings, Permission.Approve, permissions);
  const canDelete = isAdministrator || hasModuleFeaturePermission(ModulesName.PayrollSettings, Permission.Delete, permissions);
  return <PayrollConfigurationPanel canEdit={canEdit} canApprove={canApprove} canApproveEmployeeSalary={isAdministrator} canApprovePolicy={isAdministrator} canDeletePolicy={canDelete} />;
};

const CompanyDetails = () => {
  const { setPageTitle } = usePageData();
  const { formatMessage } = useIntl();
  const location = useLocation();
  const { currentLanguage } = useAppLang();
  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.COMPANY_DETAILS" }));
  }, [currentLanguage, formatMessage, setPageTitle]);

  const activeTabIndex = tabsRoutes.findIndex((tab) => checkIsActive(location.pathname, tab.to));
  const currentTabValue = activeTabIndex !== -1 ? activeTabIndex : 0;

  return (
    <Box className="d-flex flex-column flex-grow-1" sx={{ minWidth: 0, width: "100%" }}>
      <Card
        variant="outlined"
        sx={{
          borderRadius: 3,
          p: { xs: 0.5, sm: 0.75 },
          bgcolor: "background.card",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          mb: 0.5,
        }}
      >
        <Tabs
          value={currentTabValue}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{
            minHeight: { xs: 42, sm: 46 },
            "& .MuiTabs-indicator": { display: "none" },
            "& .MuiTabs-flexContainer": {
              gap: { xs: 0.5, sm: 0.75 },
              alignItems: "center",
            },
            "& .MuiTabs-scrollButtons": {
              width: { xs: 28, sm: 36 },
              height: { xs: 28, sm: 36 },
              borderRadius: 2,
              alignSelf: "center",
              color: "text.primary",
              transition: "all 0.2s ease",
              "&:hover": {
                bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
              },
              "&.Mui-disabled": {
                opacity: 0.25,
              },
            },
          }}
        >
          {tabsRoutes.map((tab, idx) => {
            const active = checkIsActive(location.pathname, tab.to);
            const labelText = tab.title.startsWith("COMPANY_DETAILS.")
              ? formatMessage({ id: tab.title })
              : tab.title;
            return (
              <Tab
                key={tab.tabId}
                component={RouterLink}
                to={tab.to}
                value={idx}
                icon={tab.icon as React.ReactElement | undefined}
                iconPosition="start"
                label={labelText}
                className={clsx("tab-box", { tab_active: active })}
                sx={{
                  flex: { xs: "0 0 auto", xl: "1 1 0" },
                  minWidth: "auto",
                  minHeight: { xs: 38, sm: 44 },
                  px: { xs: 1.25, sm: 1.75 },
                  py: { xs: 0.75, sm: 1 },
                  borderRadius: 2,
                  textTransform: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: active ? "primary.main" : "text.secondary",
                  fontWeight: active ? 750 : 650,
                  fontSize: { xs: "0.8rem", sm: "0.84rem" },
                  bgcolor: active ? (theme) => alpha(theme.palette.primary.main, 0.12) : "transparent",
                  border: "1px solid",
                  borderColor: active ? (theme) => alpha(theme.palette.primary.main, 0.35) : "transparent",
                  boxShadow: active
                    ? "0 2px 8px rgba(0, 0, 0, 0.12)"
                    : "none",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                    color: "text.primary",
                  },
                  "& .MuiTab-iconWrapper": {
                    mr: { xs: 0.75, sm: 1 },
                    mb: "0 !important",
                    "& .MuiSvgIcon-root": {
                      fontSize: { xs: 18, sm: 20 },
                      color: active ? "primary.main" : "inherit",
                    },
                  },
                }}
              />
            );
          })}
        </Tabs>
      </Card>
      <Box
        component="div"
        className="d-flex flex-column flex-grow-1"
        sx={{
          minWidth: 0,
          width: "100%",
          pt: { xs: 1.5, sm: 2 },
          "& > *": { minWidth: 0, animation: "companyDetailsEnter 240ms ease-out both" },
          "@keyframes companyDetailsEnter": {
            from: { opacity: 0, transform: "translateY(6px)" },
            to: { opacity: 1, transform: "translateY(0)" },
          },
          "@media (prefers-reduced-motion: reduce)": { "& > *": { animation: "none" } },
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export { CompanyDetails };



