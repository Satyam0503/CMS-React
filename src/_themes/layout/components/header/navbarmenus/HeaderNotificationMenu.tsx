import * as React from "react";
import Menu from "@mui/material/Menu";

import Typography from "@mui/material/Typography";

import {
  Badge,
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Popover,
  Stack,
  Tab,
  Tabs,
  Tooltip,
} from "@mui/material";
import { Close, NotificationsOutlined, Translate } from "@mui/icons-material";
import { useIntl } from "react-intl";
import Connector from "../../../../../server/SignalR";
import { NoticeModel } from "../../../../../app/modules/noticeboard/models";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

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


export default function HeaderNotificationMenu() {
  const { formatMessage } = useIntl();
  const [notificationList, setNotificationList] = React.useState<NoticeModel[]>([])
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);
  const id = open ? 'notification-popover' : undefined;
  const [value, setValue] = React.useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const connection = Connector.getInstance().getConnetion();

  React.useEffect(() => {
    if (connection) {
      connection.on("noticeNofity", (notice: NoticeModel) => {
        setNotificationList([...notificationList, notice]);
      })
    }
  }, [])

  return (
    <>
      <Tooltip title="Notifications" placement="bottom">
        <Badge badgeContent={1} color="primary">
          <IconButton
            onClick={handleClick}
            aria-describedby={id}
          >
            <NotificationsOutlined />
          </IconButton>
        </Badge>
      </Tooltip>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        slotProps={{
          paper: {
            sx: {
              minWidth: 250,
              padding: 2
            }
          }
        }}
      >
        <Typography variant="body1">{formatMessage({ id: "Notifications" })}</Typography>
        <Divider sx={{ mt: 1 }} />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} variant="fullWidth" aria-label="notifications tabs">
            <Tab label={formatMessage({ id: "Notifications.New" })} {...a11yProps(0)} />
            <Tab label={formatMessage({ id: "Notifications.Read" })} {...a11yProps(1)} />
            <Tab label={formatMessage({ id: "Notifications.All" })} {...a11yProps(2)} />
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          Item One
        </CustomTabPanel>
        <CustomTabPanel value={value} index={1}>
          Item Two
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          Item Three
        </CustomTabPanel>
      </Popover>
    </>
  );
}
