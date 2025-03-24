import { Link } from "react-router-dom";
import { KTIcon } from "../../../helpers";
import {
  Checkbox,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import React from "react";
import { Close } from "@mui/icons-material";

const CustomDashboardDrawer = () => {
  const [checked, setChecked] = React.useState([0]);

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
  return (
    <div
      id="kt_help"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="help"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'300px', 'md': '525px'}"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#kt_help_toggle"
      data-kt-drawer-close="#kt_help_close"
    >
      <Grid container p={5}>
        <Typography variant="h4">Dashboard Settings</Typography>
        <Stack
          direction="row"
          display={"flex"}
          alignItems={"center"}
          justifyContent={"space-between"}
        >
          <Stack>
            <Typography variant="h5">
              Select the fileds, you want to display
            </Typography>
          </Stack>
          <Stack>
            <Close />
          </Stack>
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
          ].map((value: any) => {
            const labelId = `checkbox-list-label-${value}`;

            return (
              <ListItem key={value}>
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
            );
          })}
        </List>
      </Grid>
    </div>
  );
};

export { CustomDashboardDrawer };
