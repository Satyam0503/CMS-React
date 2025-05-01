import { usePageData } from "../../../../_themes/layout/core";
import { useIntl } from "react-intl";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { Box, Card, Stack, Theme, useMediaQuery } from "@mui/material";
import { CorporateFare, Edit, Work } from "@mui/icons-material";
import { useEffect } from "react";
import { TabModel } from "../../../../utils/common_types";
import clsx from "clsx";
import { checkIsActive } from "../../../../_themes/helpers";

import { ApplicationModules } from "./components/ApplicationModules";
import { CompanyInfo } from "./components/CompanyInfo";
import { AddUpdateCompanyInfo } from "./components/AddUpdateCompanyInfo"

const tabsRoutes: TabModel[] = [
  {
    tabId: 1,
    to: "/admin/companydetails/companyinfo",
    title: "COMPANY_DETAILS.TAB.COMPANY_DETAIL",
    icon: <Work />,
  },
  {
    tabId: 2,
    to: "/admin/companydetails/modules",
    title: "COMPANY_DETAILS.TAB.MODULES",
    icon: <CorporateFare />,
  },
];

export const CompanyDetailsTab = () => {
  return (
    <Routes>
      <Route element={<CompanyDetails />}>
        <Route index element={<Navigate to={"modules"} />} />
        <Route path="modules" element={<ApplicationModules />} />
        <Route path="companyinfo" element={<CompanyInfo />} />
        <Route path="companyinfo/editcompanydetails" element={<AddUpdateCompanyInfo />}></Route>
      </Route>
      <Route path="*" element={<Navigate to={"/error"} />} />
    </Routes>
  );
};


const CompanyDetails = () => {
  const { setPageTitle } = usePageData();
  const { formatMessage } = useIntl();
  const navigate = useNavigate();

  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.COMPANY_DETAILS" }));
  }, []);

  return (
    <Card className="d-flex flex-column flex-grow-1">
      <Stack direction={"row"} spacing={0.5} className="tab-container">
        {tabsRoutes.map((tab) => {
          return (
            <Box
              component={"div"}
              key={tab.tabId}
              className={clsx("tab-box", {
                tab_active: checkIsActive(location.pathname, tab.to),
              })}
              onClick={() => navigate(tab.to)}
            >
              {tab.icon}
              {formatMessage({ id: tab.title })}
            </Box>
          );
        })}
      </Stack>
      <Box component="div" className="flex-grow-1">
        <Outlet />
      </Box>
    </Card>
  );
};

export { CompanyDetails };
