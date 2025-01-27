import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AboutUser from "./about/AboutUser";
import { LeaveTracker } from "./leavetracker/LeaveTracker";
import { Grid, Theme, useMediaQuery } from "@mui/material";
import { UserPerformance } from "./performance/UserPerformance";
import { WorkHistory } from "./workhistory/WorkHistory";
import { colors } from "../theme/MuiTheme";
import Setting from "./usersetting/Setting";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <Grid
      container
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 0, width: "100%" }}>{children}</Box>}
    </Grid>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const isSmallScreen = useMediaQuery((theme: Theme) =>
    theme.breakpoints.down("sm")
  );

  return (
    <Box sx={{ borderRadius: "8px" }}>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          marginTop: "15px",
          background: "white",
          marginBottom: "6px",
        }}
      >
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          variant={isSmallScreen ? "scrollable" : "fullWidth"}
          scrollButtons="auto"
          allowScrollButtonsMobile={true}
        >
          <Tab
            label="About"
            {...a11yProps(0)}
            sx={{
              width: "150px",
              flexShrink: 0,
              "&:focus, &.Mui-selected, &.Mui-selected:hover": {
                borderBottom: " 2px solid " + colors.alpha.primary[500],
              },
            }}
          />
          <Tab
            label="Leave Tracker"
            {...a11yProps(1)}
            sx={{
              width: "150px",
              flexShrink: 0,
              "&:focus, &.Mui-selected, &.Mui-selected:hover": {
                borderBottom: " 2px solid " + colors.alpha.primary[500],
              },
            }}
          />
          <Tab
            label="Performance"
            {...a11yProps(2)}
            sx={{
              width: "150px",
              flexShrink: 0,
              "&:focus, &.Mui-selected, &.Mui-selected:hover": {
                borderBottom: " 2px solid " + colors.alpha.primary[500],
              },
            }}
          />
          <Tab
            label="Work History"
            {...a11yProps(3)}
            sx={{
              width: "150px",
              "&:focus, &.Mui-selected, &.Mui-selected:hover": {
                borderBottom: " 2px solid " + colors.alpha.primary[500],
              },
            }}
          />
          <Tab
            label="Settings"
            {...a11yProps(4)}
            sx={{
              width: "150px",
              "&:focus, &.Mui-selected, &.Mui-selected:hover": {
                borderBottom: " 2px solid " + colors.alpha.primary[500],
              },
            }}
          />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <AboutUser />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        <LeaveTracker />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        <UserPerformance />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <WorkHistory />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        <Setting />
      </CustomTabPanel>
    </Box>
  );
}
