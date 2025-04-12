import { Box, Card, CardContent, Grid, Stack, Typography } from "@mui/material";

import {
  Build,
  CalendarMonth,
  CorporateFareOutlined,
  Person,
  Settings,
  Today,
  WorkHistory,
} from "@mui/icons-material";

import { useIntl } from "react-intl";
import { useAppSelector } from "../../../Redux/hooks";
import { colors } from "../../theme/MuiTheme";
import IconStat from "../../../shared/components/IconStat";
import { getDateDiffInYears } from "../../../../utils/common";
import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";
import { EmployeeProfileCard } from "./components/EmployeeProfileCard";
import { EmployeeModel, TabModel } from "../../../../utils/common_types";
import { useEffect, useState } from "react";
import { getEmployeeById, getEmployeeSkills } from "../userservices";
import LeaveAllowences from "../components/LeaveAllowences";
import BasicTabs from "./components/BasicTabs";
import { usePageData } from "../../../../_themes/layout/core";
import { Breadcrumb, useBreadcrumbs } from "react-breadcrumble";
import { UserDetailsProvider } from "../UserDataProvider";
import ProfileCard from "../components/ProfileCard";
import { ProfileHeader } from "../about/components/ProfileHeader";
import { checkIsActive } from "../../../../_themes/helpers";
import clsx from "clsx";

const tabsRoutes: TabModel[] = [
  {
    tabId: 1,
    to: "/employee/about",
    title: "PROFILE.TAB.ABOUT",
    icon: <Person />,
  },
  {
    tabId: 2,
    to: "/myprofile/leave",
    title: "PROFILE.TAB.LEAVE",
    icon: <Person />,
  },
  {
    tabId: 3,
    to: "/myprofile/performance",
    title: "PROFILE.TAB.PERFORMANCE",
    icon: <Today />,
  },
  {
    tabId: 4,
    to: "/myprofile/workhistory",
    title: "PROFILE.TAB.WORK",
    icon: <WorkHistory />,
  },
  {
    tabId: 5,
    to: "/myprofile/setting",
    title: "PROFILE.TAB.SETTING",
    icon: <Settings />,
  },
];


const employeeBreadCrumbs: Array<Breadcrumb> = [
  {
    label: "PAGE.EMPLOYEES",
    path: "/employees",
    parent: "/",
  },
  {
    label: "PAGE.PROFILE",
    path: "/employees/{employeeid}",
    parent: "/employees",
  },
];

const EmployeeProfile = () => {
  const intl = useIntl();
  const { setPageTitle } = usePageData();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [employeeDetails, setEmployeeDetails] = useState<EmployeeModel>(
    {} as EmployeeModel
  );
  const [employeeSkills, setEmployeeSkills] = useState<string>("");

  const companyName = useAppSelector(
    (state) => state.user.userData?.companyName
  );
  const param = useParams();
  const navigate = useNavigate();

  if (Object.keys(param).length === 0 || !param.employeeid) {
    navigate("/error", { replace: true });
  }
  const employeeId = param.employeeid;

  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.PROFILE" }));
    const getEmployeeDetails = async () => {
      try {
        const response = await Promise.allSettled([
          getEmployeeById(employeeId),
          getEmployeeSkills(employeeId),
        ]);
        const empData =
          response[0].status === "fulfilled"
            ? response[0].value.data.methodResult
            : ({} as EmployeeModel);
        setEmployeeDetails(empData);
        const empSkills =
          response[1].status === "fulfilled"
            ? response[1].value.data.methodResult.skills
            : "";
        setEmployeeSkills(empSkills);
      } catch (error) {
        console.log(error);
      }
    };
    getEmployeeDetails();
  }, []);

  useEffect(() => {
    setBreadcrumbs(employeeBreadCrumbs);
  }, []);

  return (
    <UserDetailsProvider>
      <Grid container spacing={4} zIndex={0}>
        <Grid
          item
          xs={12}
          lg={3.8}
          xl={3}
          display={"flex"}
          flexDirection={{ xs: "column", sm: "row", lg: "column" }}
          gap={{ xs: 4, sm: 2, md: 4 }}
          justifyContent={{ lg: "flex-start" }}
        >
          <Stack width={"100%"}>
            <ProfileCard />
          </Stack>
          <Stack width={"100%"}>
            <LeaveAllowences />
          </Stack>
        </Grid>
        <Grid
          item
          xs={12}
          md={12}
          lg={8.2}
          xl={9}
          className="d-flex flex-column gap-4"
        >
          <ProfileHeader />
          <Card className="tab-container d-flex flex-row">
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
                  {intl.formatMessage({ id: tab.title })}
                </Box>
              );
            })}
          </Card>
          <Box component="div" className="flex-grow-1">
            <Outlet />
          </Box>
        </Grid>
      </Grid>
    </UserDetailsProvider>
  );
};

export default EmployeeProfile;
