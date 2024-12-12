import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import AboutUser from "./AboutUser";
import { LeaveTracker } from "./leavetracker/LeaveTracker";
import { Grid } from "@mui/material";
import { UserPerformance } from "./performance/UserPerformance";

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
      {value === index && <Box sx={{ p: 0 }}>{children}</Box>}
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
        >
          <Tab label="About" {...a11yProps(0)} className="px-12" />
          <Tab label="Leave Tracker" {...a11yProps(1)} className="px-13" />
          <Tab label="Performance" {...a11yProps(2)} className="px-12" />
          <Tab label="Work History" {...a11yProps(3)} className="px-13" />
          <Tab label="Documents" {...a11yProps(4)} className="px-12" />
          <Tab label="Settings" {...a11yProps(5)} className="px-12" />
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
        Item One
      </CustomTabPanel>
      <CustomTabPanel value={value} index={4}>
        Item Two
      </CustomTabPanel>
      <CustomTabPanel value={value} index={5}>
        Item Three
      </CustomTabPanel>
    </Box>
  );
}
