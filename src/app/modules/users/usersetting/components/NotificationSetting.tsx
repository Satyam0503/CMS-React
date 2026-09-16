import { SaveRounded } from "@mui/icons-material";
import { Box, Button, Card, FormControlLabel, Stack, Switch, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { getNotificationPreferences, updateNotificationPreferences } from "../../userservices";
import { type NotificationPreferences } from "../../models";
import { notifications } from "../../../../shared/notifications";
import { ListSkeleton } from "../../about/components/ListSkeleton";

const labels: Record<string, { title: string; detail: string }> = {
  notice: { title: "Notice board", detail: "Receive important company notices." },
  birthday: { title: "Birthdays", detail: "Receive employee birthday reminders." },
  workAnniversary: { title: "Work anniversaries", detail: "Receive service anniversary reminders." },
  leaveStatusUpdate: { title: "Leave updates", detail: "Receive updates when leave requests change." },
  holiday: { title: "Holiday reminders", detail: "Receive upcoming holiday reminders." },
  message: { title: "Messages", detail: "Receive important company messages." },
};

export const NotificationSetting = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({} as NotificationPreferences);
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);

  useEffect(() => {
    getNotificationPreferences().then(({ data }) => data.success && setPreferences(data.methodResult)).catch(() => notifications.error("Unable to load notification preferences.")).finally(() => setLoading(false));
  }, []);

  const savePreferences = async () => {
    setSaving(true);
    try {
      const { data } = await updateNotificationPreferences(preferences);
      if (data.success) { setPreferences(data.methodResult); notifications.success("Notification preferences saved."); }
    } catch { notifications.error("Unable to save notification preferences."); }
    finally { setSaving(false); }
  };

  if (isLoading) return <ListSkeleton />;
  return <Card sx={{ p: { xs: 2, sm: 3, lg: 4 }, minHeight: { md: 520 } }}>
    <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={2} mb={3}>
      <Box><Typography variant="h5" fontWeight={700}>My notification preferences</Typography><Typography color="text.secondary">Choose the updates you want to receive. Company defaults are managed by your administrator.</Typography></Box>
      <Button variant="contained" startIcon={<SaveRounded />} onClick={savePreferences} disabled={isSaving} sx={{ alignSelf: { xs: "stretch", sm: "center" } }}>{isSaving ? "Saving…" : "Save preferences"}</Button>
    </Stack>
    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 1.5 }}>
      {Object.keys(preferences).map((key) => { const copy = labels[key] ?? { title: key.replace(/([A-Z])/g, " $1").trim(), detail: "Receive this notification category." }; return <FormControlLabel key={key} sx={{ m: 0, px: 2, py: 1.5, minHeight: 76, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "background.paper", justifyContent: "space-between", gap: 2 }} control={<Switch checked={Boolean(preferences[key as keyof NotificationPreferences])} onChange={(e) => setPreferences((current) => ({ ...current, [key]: e.target.checked }))} />} label={<Box><Typography fontWeight={650}>{copy.title}</Typography><Typography variant="body2" color="text.secondary">{copy.detail}</Typography></Box>} labelPlacement="start" />; })}
    </Box>
  </Card>;
};
