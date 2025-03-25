import { Link } from "react-router-dom";
import { KTIcon } from "../../../helpers";
import {
  Box,
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
import { Circle, Close, MoreHoriz } from "@mui/icons-material";
import { colors } from "../../../../app/modules/theme/MuiTheme";
import { end } from "@popperjs/core";
import { CustomIconButton } from "../../../../app/shared/components/CustomIconButton";

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
    <Box
      id="kt_help"
      className="bg-body"
      data-kt-drawer="true"
      data-kt-drawer-name="help"
      data-kt-drawer-activate="true"
      data-kt-drawer-overlay="true"
      data-kt-drawer-width="{default:'350px' }"
      data-kt-drawer-direction="end"
      data-kt-drawer-toggle="#kt_help_toggle"
      data-kt-drawer-close="#kt_help_close"
    >
      <Stack p={2}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <Stack>
            <Typography variant="h6">Dashboard Settings</Typography>
          </Stack>
          <Stack direction={"row"} spacing={1}>
            <CustomIconButton icon={<Close />} />
          </Stack>
        </Stack>

        <Stack>
          <Typography variant="body2" color={colors.alpha.primary[500]}>
            Select the fields, you want on dashboard
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
      </Stack>
    </Box>
  );
};

export { CustomDashboardDrawer };
