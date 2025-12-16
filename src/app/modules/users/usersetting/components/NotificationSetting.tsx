import { Card, Checkbox, FormControlLabel, FormGroup, Stack, Typography } from "@mui/material";
import { NotificationPreferences } from "../../models";
import { useEffect, useState } from "react";
import { getNotificationPreferences, updateNotificationPreferences } from "../../userservices";
import { useIntl } from "react-intl";
import CustomisedButton from "../../../../shared/components/CustomisedButton";
import { toast } from "react-toastify";
import { ListSkeleton } from "../../about/components/ListSkeleton";

export const NotificationSetting = () => {
  const { formatMessage: i } = useIntl();
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({} as NotificationPreferences);
  const [isLoading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const { data } = await getNotificationPreferences();
        if (data.success) {
          setNotificationPreferences(data.methodResult);
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, [])


  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationPreferences({
      ...notificationPreferences,
      [event.target.name]: event.target.checked,
    });
  }

  const handleUpdateNotificationPreferences = async () => {
    try {
      const { data } = await updateNotificationPreferences(notificationPreferences);
      if (data.success) {
        toast.success(i({ id: "TOAST.SUCCESS.UPDATE" }));
        setNotificationPreferences(data.methodResult);
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
    }
  }
  if (isLoading) {
    return <ListSkeleton />
  }
  return (
    <Card className="p-4 d-flex flex-column">
      <Stack>
        <Typography variant="h5">
          {i({ id: "NOTIFCATION_PREFERENCE.TITLE" })}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {i({ id: "NOTIFCATION_PREFERENCE.NOTE" })}
        </Typography>
      </Stack>
      <FormGroup className="ms-2 mt-4" >
        {
          Object.keys(notificationPreferences).map((key, index) => (
            <FormControlLabel
              className="hover-secondary rounded"
              key={index}
              control={
                <Checkbox
                  name={key}
                  checked={notificationPreferences[key as keyof NotificationPreferences]}
                  onChange={handleToggle}
                  sx={{ '& .MuiSvgIcon-root': { fontSize: 36 } }}
                />
              }
              label={
                <>
                  <Typography>{i({ id: `NOTIFCATION_PREFERENCE.TYPE.${key}` })}</Typography>
                  <Typography variant="body2">{i({ id: `NOTIFCATION_PREFERENCE.TYPE_NOTE.${key}` })}</Typography>
                </>
              }
              sx={{
                marginRight: 0,
                paddingBlock: 1,
              }}
            />
          ))
        }
      </FormGroup>
      <CustomisedButton
        className="mt-4 align-self-end"
        label={i({ id: "BUTTON.UPDATE" })}
        handleClick={handleUpdateNotificationPreferences}
      />
    </Card >

  );
}
