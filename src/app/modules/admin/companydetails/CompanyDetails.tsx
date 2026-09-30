import { useIntl } from "react-intl";
import { Link as RouterLink, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Box, ButtonBase, Stack, Tooltip } from "@mui/material";
import { AccessTimeRounded, CorporateFare, Work, SettingsApplicationsRounded, NotificationsActiveRounded, FactCheckRounded } from "@mui/icons-material";
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
import { RecruitmentReadiness } from "./components/RecruitmentReadiness";
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
  { tabId: 6, to: "/admin/companydetails/recruitment-readiness", title: "Recruitment readiness", icon: <FactCheckRounded /> },
  { tabId: 7, to: "/admin/companydetails/payroll-configuration", title: "Payroll configuration", icon: <SettingsApplicationsRounded /> },
];

export const CompanyDetailsTab = () => {
  return (
    <Routes>
      <Route element={<CompanyDetails />}>
        <Route index element={<Navigate to={"companyinfo"} />} />
        <Route path="modules" element={<ApplicationModules />} />
        <Route path="companyinfo" element={<CompanyInfo />} />
        <Route path="office-schedule" element={<OfficeSchedule />} />
        <Route path="offboarding" element={<EmployeeExitPolicySettings />} />
        <Route path="notifications" element={<CompanyNotificationSettings />} />
        <Route path="recruitment-readiness" element={<RecruitmentReadiness />} />
        <Route path="payroll-configuration" element={<CompanyPayrollConfiguration />} />
      </Route>
      <Route path="*" element={<Navigate to={"/error"} />} />
    </Routes>
  );
};


const CompanyPayrollConfiguration = () => {
  const userData = useAppSelector((state) => state.user.userData);
  const permissions = userData?.modulePermission ?? [];
  const canEdit = userData?.roleType === Roles.Administrator || hasModuleFeaturePermission(ModulesName.PayrollSettings, Permission.Edit, permissions);
  const canApprove = userData?.roleType === Roles.Administrator || hasModuleFeaturePermission(ModulesName.PayrollSettings, Permission.Approve, permissions);
  return <PayrollConfigurationPanel canEdit={canEdit} canApprove={canApprove} />;
};

const CompanyDetails = () => {
  const { setPageTitle } = usePageData();
  const { formatMessage } = useIntl();
  const location = useLocation();
  const { currentLanguage } = useAppLang();
  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.COMPANY_DETAILS" }));
  }, [currentLanguage, formatMessage, setPageTitle]);

  return (
    <Box className="d-flex flex-column flex-grow-1" sx={{ minWidth: 0, width: "100%" }}>
      <Box
        role="tablist"
        sx={{
    bgcolor: "background.card",
    p: { xs: 0.75, sm: 0.9 },
    border: "1px solid",
    borderColor: "divider",
    borderRadius: { xs: 2.5, sm: 3 },
    minWidth: 0,
    maxWidth: "100%",
    display: "flex",
    overflowX: "hidden",
    flexWrap: "nowrap",
    gap: { xs: 0.5, sm: 0.75 },

    "& .tab-box": {
      minHeight: 54,
      minWidth: 0,
      flex: "1 1 0",
      px: 1.25,
      py: 1,
      justifyContent: "center",
      gap: 0.85,

      "& .MuiSvgIcon-root": {
        fontSize: 21,
        flexShrink: 0,
      },

      "@media (max-width: 1023px)": {
        px: 0.5,
        gap: 0,

        "& .tab-label": {
          display: "none",
        },

        "& .MuiSvgIcon-root": {
          fontSize: 23,
        },
      },

      "&:hover": {
        bgcolor: "action.hover",
        color: "primary.main",
      },

      "&.tab_active": {
        bgcolor: "primary.main",
        color: "primary.contrastText",
      },
    },
        }}
      >
        {tabsRoutes.map((tab) => {
          const active = checkIsActive(location.pathname, tab.to);
          return (
            <Tooltip
              key={tab.tabId}
              title={formatMessage({ id: tab.title })}
              placement="bottom"
            >
              <ButtonBase
                component={RouterLink}
                to={tab.to}
                className={clsx("tab-box", { tab_active: active })}
                role="tab"
                aria-selected={active}
              >
                {tab.icon}
                <Box component="span" className="tab-label">
                  {formatMessage({ id: tab.title })}
                </Box>
              </ButtonBase>
            </Tooltip>
          );
        })}
      </Box>
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



