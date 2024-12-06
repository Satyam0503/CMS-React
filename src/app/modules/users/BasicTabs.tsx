import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import AboutUser from './AboutUser';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', marginTop:"15px", background:"white", }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Item One" {...a11yProps(0)} className='px-14' />
          <Tab label="Item Two" {...a11yProps(1)}  className='px-13' />
          <Tab label="Item Three" {...a11yProps(2)}  className='px-13' />
          <Tab label="Item One" {...a11yProps(3)}  className='px-14' />
          <Tab label="Item Two" {...a11yProps(4)}  className='px-13'  />
          <Tab label="Item Three" {...a11yProps(5)}   className='px-14' />
        </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <AboutUser/>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
    
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
   
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
