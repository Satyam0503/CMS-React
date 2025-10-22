import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import IconButton from "@mui/material/IconButton";
import CommentIcon from "@mui/icons-material/Comment";
import { Stack } from "@mui/material";
import { NotificationPreferences } from "../../models";
import { useEffect, useState } from "react";
import { getNotificationPreferences } from "../../userservices";

export const NotificationSetting = () => {
  const [notificatioPreferences, setNotificationPreferences] = useState<NotificationPreferences>({} as NotificationPreferences);
  const [checked, setChecked] = useState([0]);

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
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getNotificationPreferences();
        if (data.success) {
          setNotificationPreferences(data.methodResult);
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
      }
    })();
  }, [])

  console.log(notificatioPreferences);

  return (
    // <List>
    //   {[
    //     "Birthday Notification",
    //     "New employee joined",
    //     "Leave status",
    //     "Low leave balance",
    //     "Announcements",
    //     "Work Anniversaries",
    //     "Holiday reminder",
    //     "Off Boardings",
    //   ].map((value: any) => {
    //     const labelId = `checkbox-list-label-${value}`;

    //     return (
    //       <Stack spacing={1}>
    //         <ListItemIcon>
    //           <Checkbox
    //             edge="start"
    //             checked={checked.includes(value)}
    //             tabIndex={-1}
    //             disableRipple
    //             onClick={handleToggle(value)}
    //             inputProps={{ "aria-labelledby": labelId }}
    //           />
    //         </ListItemIcon>
    //         <ListItemText id={labelId} primary={`${value}`} />
    //       </Stack>
    //     );
    //   })}
    // </List>
    <Stack spacing={1}>

    </Stack>
  );
}
