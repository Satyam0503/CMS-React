import { useIntl } from "react-intl";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { Box, Stack, } from "@mui/material";
import { CorporateFare, Work } from "@mui/icons-material";
import { useEffect } from "react";
import { TabModel } from "../../../../utils/common_types";
import clsx from "clsx";
import { checkIsActive } from "../../../../_themes/helpers";
import { ApplicationModules } from "./components/ApplicationModules";
import { CompanyInfo } from "./components/CompanyInfo";
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
];

export const CompanyDetailsTab = () => {
  return (
    <Routes>
      <Route element={<CompanyDetails />}>
        <Route index element={<Navigate to={"companyinfo"} />} />
        <Route path="modules" element={<ApplicationModules />} />
        <Route path="companyinfo" element={<CompanyInfo />} />
      </Route>
      <Route path="*" element={<Navigate to={"/error"} />} />
    </Routes>
  );
};


const CompanyDetails = () => {
  const { setPageTitle } = usePageData();
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const { currentLanguage } = useAppLang();
  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.COMPANY_DETAILS" }));
  }, [currentLanguage, formatMessage, setPageTitle]);

  return (
    <Box className="d-flex flex-column flex-grow-1">
      <Stack direction="row" spacing={0.5} className="tab-container" sx={{ bgcolor: "background.card" }} >
        {tabsRoutes.map((tab) => {
          return (
            <Box
              component={"div"}
              key={tab.tabId}
              className={clsx("tab-box", {
                tab_active: checkIsActive(location.pathname, tab.to),
              })}
              onClick={() => navigate(tab.to)}
              sx={{
                color: "text.secondary",
              }}
            >
              {tab.icon}
              {formatMessage({ id: tab.title })}
            </Box>
          );
        })}
      </Stack>
      <Box component="div" className="d-flex flex-column flex-grow-1">
        <Outlet />
      </Box>
    </Box>
  );
};

export { CompanyDetails };
