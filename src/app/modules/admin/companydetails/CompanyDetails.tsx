import { useIntl } from "react-intl";
import { Link as RouterLink, Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import { Box, ButtonBase, Stack, } from "@mui/material";
import { AccessTimeRounded, CorporateFare, Work } from "@mui/icons-material";
import { useEffect } from "react";
import { TabModel } from "../../../../utils/common_types";
import clsx from "clsx";
import { checkIsActive } from "../../../../_themes/helpers";
import { ApplicationModules } from "./components/ApplicationModules";
import { CompanyInfo } from "./components/CompanyInfo";
import { OfficeSchedule } from "../companymaster/components/OfficeSchedule";
import { useAppLang } from "../../../../_themes/i18n/Metronici18n";
import { usePageData } from "../../../Context/PageDataProvider";

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
];

export const CompanyDetailsTab = () => {
  return (
    <Routes>
      <Route element={<CompanyDetails />}>
        <Route index element={<Navigate to={"companyinfo"} />} />
        <Route path="modules" element={<ApplicationModules />} />
        <Route path="companyinfo" element={<CompanyInfo />} />
        <Route path="office-schedule" element={<OfficeSchedule />} />
      </Route>
      <Route path="*" element={<Navigate to={"/error"} />} />
    </Routes>
  );
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
    <Box className="d-flex flex-column flex-grow-1" sx={{ minWidth: 0 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={0.5}
        className="tab-container"
        sx={{
          bgcolor: "background.card",
          p: 0.5,
          minWidth: 0,
          "& .tab-box": {
            minHeight: 52,
            width: { xs: "100%", sm: "auto" },
            flex: { sm: 1 },
            minWidth: 0,
            px: { xs: 1.5, sm: 2 },
            py: { xs: 1, sm: 1.25 },
            fontSize: { xs: "0.875rem", sm: "0.92rem" },
            justifyContent: "center",
            textAlign: "center",
            gap: 1,
          },
        }}
      >
        {tabsRoutes.map((tab) => {
          return (
            <ButtonBase
              component={RouterLink}
              to={tab.to}
              key={tab.tabId}
              className={clsx("tab-box", {
                tab_active: checkIsActive(location.pathname, tab.to),
              })}
              role="tab"
              aria-selected={checkIsActive(location.pathname, tab.to)}
              sx={{
                color: "text.secondary",
                textDecoration: "none",
              }}
            >
              {tab.icon}
              {formatMessage({ id: tab.title })}
            </ButtonBase>
          );
        })}
      </Stack>
      <Box component="div" className="d-flex flex-column flex-grow-1" sx={{ minWidth: 0 }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export { CompanyDetails };
