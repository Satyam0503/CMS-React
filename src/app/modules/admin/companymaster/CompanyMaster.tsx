import { useIntl } from "react-intl";
import { usePageData } from "../../../../_themes/layout/core";
import { useEffect, useState } from "react";
import {
  Box,
  Card,
  Stack,
  Tab,
  Tabs,
  Theme,
  useMediaQuery,
} from "@mui/material";
import { a11yProps, CustomTabPanel } from "../../users/components/BasicTabs";
import { colors } from "../../theme/MuiTheme";
import { Departments } from "./components/Department";
import { CorporateFare, Edit, Work } from "@mui/icons-material";
import { CompanyMasterTabModel } from "../models";
import { Navigate, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import { checkIsActive } from "../../../../_themes/helpers";
import clsx from "clsx";

const tabsRoutes: CompanyMasterTabModel[] = [
  {
    tabId: 1,
    to: "/admin/companymaster/department",
    title: "COMPANY_MASTER.TAB.DEPARTMENT",
    component: <Departments />,
    icon: <CorporateFare />,
  },
  {
    tabId: 2,
    to: "/admin/companymaster/jobtitle",
    component: <Edit />,
    title: "COMPANY_MASTER.TAB.JOBS",
    icon: <Work />,
  },
];

export const CompanyMasterTab = () => {
  return (
    <Routes>
      <Route element={<CompanyMaster />}>
        <Route index element={<Navigate to={"department"} />} />
        <Route path="department" element={<Departments />} />
        <Route path="jobtitle" element={<Edit />} />
      </Route>
      <Route path="*" element={<Navigate to={"/error"} />} />
    </Routes>
  );
};

const CompanyMaster = () => {
  const { setPageTitle } = usePageData();
  const { formatMessage } = useIntl();
  const navigate = useNavigate();

  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  useEffect(() => {
    setPageTitle(formatMessage({ id: "PAGE.COMPANY_MASTER" }));
  }, []);

  return (
    <Card className="d-flex flex-column flex-grow-1">
      <Stack direction={"row"} spacing={0.5} className="tab-container">
        {tabsRoutes.map((tab) => {
          return (
            <Box
              component={"div"}
              key={tab.tabId}
              className={clsx("tab-box",{tab_active: checkIsActive(location.pathname,tab.to) })}
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

export { CompanyMaster };
