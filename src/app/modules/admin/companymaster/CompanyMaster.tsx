import { useIntl } from "react-intl";
import { usePageData } from "../../../../_themes/layout/core";
import { useEffect, useState } from "react";
import { Box, Card, Tab, Tabs, Theme, useMediaQuery } from "@mui/material";
import { a11yProps, CustomTabPanel } from "../../users/components/BasicTabs";
import { colors } from "../../theme/MuiTheme";
import { Departments } from "./components/Department";
import { CorporateFare } from "@mui/icons-material";

const CompanyMaster = () => {
  const { setPageTitle } = usePageData();
  const intl = useIntl();
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (e: React.SyntheticEvent, value: any) => {
    setTabIndex(value);
  };
  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  useEffect(() => {
    setPageTitle(intl.formatMessage({ id: "PAGE.COMPANY_MASTER" }));
  }, []);

  return (
    <Card className="flex-grow-1">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          aria-label="company-master-tabs"
          variant={isSmallScreen ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          allowScrollButtonsMobile={true}
          sx={{ borderRadius: ".5rem" }}
        >
          <Tab
            icon={<CorporateFare />}
            iconPosition="start"
            label={intl.formatMessage({ id: "COMPANY_MASTER.TAB.DEPARTMENT" })}
            {...a11yProps(0)}
            sx={{
              "&:focus, &.Mui-selected, &.Mui-selected:hover": {
                borderBottom: " 2px solid " + colors.alpha.primary[500],
              },
            }}
          />
          <Tab
            label={intl.formatMessage({ id: "COMPANY_MASTER.TAB.DEPARTMENT" })}
            {...a11yProps(1)}
            sx={{
              flexShrink: 0,
              "&:focus, &.Mui-selected, &.Mui-selected:hover": {
                borderBottom: " 2px solid " + colors.alpha.primary[500],
              },
            }}
          />
        </Tabs>

        <CustomTabPanel value={tabIndex} index={0}>
          <Departments />
        </CustomTabPanel>
        <CustomTabPanel value={tabIndex} index={1}>
          Job TItle
        </CustomTabPanel>
    </Card>
  );
};

export { CompanyMaster };
