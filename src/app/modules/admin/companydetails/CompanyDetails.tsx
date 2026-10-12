import { useIntl } from "react-intl";
import { Link as RouterLink, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { alpha, Box, ButtonBase, Card, Stack, Tooltip, Typography } from "@mui/material";
import { AccessTimeRounded, CorporateFare, Work, SettingsApplicationsRounded, NotificationsActiveRounded, FactCheckRounded, TuneRounded } from "@mui/icons-material";
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
  { tabId: 7, to: "/admin/companydetails/payroll-configuration", title: "Payroll configuration", icon: <TuneRounded /> },
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

  return (
    <Box className="d-flex flex-column flex-grow-1" sx={{ minWidth: 0, width: "100%" }}>
      <Card
        variant="outlined"
        role="tablist"
        sx={{
          borderRadius: 3,
          p: 0.75,
          bgcolor: "background.card",
          border: "1px solid",
          borderColor: "divider",
          overflow: "hidden",
          mb: 0.5,
        }}
      >
        <Stack
          direction="row"
          spacing={0.75}
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            overflowX: "auto",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            "&::-webkit-scrollbar": { display: "none" },
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
                  sx={{
                    flex: { xs: "0 0 auto", lg: "1 1 0" },
                    minWidth: { xs: "auto", lg: 0 },
                    minHeight: 46,
                    px: { xs: 1.5, sm: 1.75 },
                    py: 1,
                    borderRadius: 2,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                    color: active ? "primary.main" : "text.secondary",
                    fontWeight: active ? 750 : 650,
                    fontSize: "0.84rem",
                    bgcolor: active ? (theme) => alpha(theme.palette.primary.main, 0.12) : "transparent",
                    border: "1px solid",
                    borderColor: active ? (theme) => alpha(theme.palette.primary.main, 0.35) : "transparent",
                    boxShadow: active
                      ? (theme) => (theme.palette.mode === "dark" ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(11, 92, 171, 0.08)")
                      : "none",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    "&:hover": {
                      bgcolor: (theme) => alpha(theme.palette.primary.main, 0.07),
                      color: "text.primary",
                    },
                    "& .MuiSvgIcon-root": {
                      fontSize: 20,
                      flexShrink: 0,
                      color: active ? "primary.main" : "inherit",
                    },
                    "& .tab-label": {
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "0.835rem",
                    },
                  }}
                >
                  {tab.icon}
                  <Box component="span" className="tab-label">
                    {formatMessage({ id: tab.title })}
                  </Box>
                </ButtonBase>
              </Tooltip>
            );
          })}
        </Stack>
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



