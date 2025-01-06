import * as React from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import CommentIcon from "@mui/icons-material/Comment";

export default function NotificationSetting() {
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
    <List>
      {[
        "Birthday Notification",
        "New employee joined",
        "Leave status",
        "Low leave balance",
        "Announcements",
        "Work Anniversaries",
        "Holiday reminder",
        "Off Boardings",
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
  );
}
