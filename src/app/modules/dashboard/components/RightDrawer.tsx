import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Checkbox, Stack, Typography } from "@mui/material";
import { useIntl } from "react-intl";
import { CustomIconButton } from "../../../shared/components/CustomIconButton";
import { Close, DashboardCustomizeOutlined } from "@mui/icons-material";

export default function RightDrawer() {
  const [open, setOpen] = React.useState(false);
  const [checked, setChecked] = React.useState([0]);
  const intl = useIntl();

  const handleToggle = (value: any) => () => {
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    setChecked(newChecked);
  };

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box
      sx={{ width: 350, px: 2, py: 5 }}
      role="presentation"
      onClick={toggleDrawer(false)}
    >
      <Stack direction={"row"} justifyContent={"space-between"}>
        <Stack>
          <Typography variant="h6">
            {intl.formatMessage({ id: "SETTING.DASHBOARD" })}
          </Typography>
        </Stack>
        <Stack direction={"row"} spacing={1}>
          <CustomIconButton icon={<Close />} />
        </Stack>
      </Stack>

      <Stack>
        <Typography variant="body2">
          {intl.formatMessage({ id: "SETTING.DASHBOARD_FIELDS" })}
        </Typography>
      </Stack>
      <List>
        {[
          "Employees",
          "New employee joined",
          "Open positions",
          "Attendance",
          "Total Application",
          "Departments",
          "Notice Board",
          "Employees on leave ",
          "Top  Punctual",
          "Upcoming Birthdays",
          "Employee of the month",
          "Employee performance",
          "Help",
        ].map((value: any, index) => {
          const labelId = `checkbox-list-label-${value}`;
          return (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    edge="start"
                    checked={checked.includes(value)}
                    tabIndex={-1}
                    disableRipple
                    onClick={handleToggle(value)}
                    inputProps={{ "aria-labelledby": labelId }}
                  />
                </ListItemIcon>
                <ListItemText id={labelId} primary={`${value}`} />
              </ListItem>
              <Divider />
            </React.Fragment>
          );
        })}
      </List>
    </Box>
  );

  return (
    <>
      <CustomIconButton
        icon={<DashboardCustomizeOutlined />}
        handleClick={toggleDrawer(true)}
        tooltip="Customize Dashboard"
        size="large"
        style={{ border: "none" }}
      />

      <Drawer open={open} onClose={toggleDrawer(false)} anchor="right">
        {DrawerList}
      </Drawer>
    </>
  );
}
