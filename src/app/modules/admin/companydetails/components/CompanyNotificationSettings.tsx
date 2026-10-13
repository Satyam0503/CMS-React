import { SaveRounded } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { getRequest, putRequest } from "../../../../../server/axios";
import {
  notifications,
  saveNotificationConfig,
  type NotificationConfig,
} from "../../../../shared/notifications";
const categories = [
  ["BirthdayNotification", "Birthdays"],
  ["WorkAnniversaries", "Work anniversaries"],
  ["LeaveStatusUpdate", "Leave updates"],
  ["Notice", "Notice board"],
  ["HolidayReminder", "Holiday reminders"],
  ["MessageNotification", "Messages"],
] as const;
type Config = NotificationConfig;
const defaults: Config = {
  position: "top-right",
  autoClose: 3500,
  limit: 2,
  newestOnTop: true,
  pauseOnHover: true,
  showCloseButton: true,
  closeOnClick: false,
  transition: "slide",
  theme: "system",
};
export const CompanyNotificationSettings = () => {
  const [preferences, setPreferences] = useState<Record<string, boolean>>({});
  const [configuration, setConfiguration] = useState(defaults);
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    getRequest<{
      success: boolean;
      methodResult?: {
        preferences: Record<string, boolean>;
        configuration?: Config;
      };
    }>("api/Company/NotificationPreferences")
      .then(({ data }) => {
        if (data.success) {
          console.log("Fetched company notification settings:", data.methodResult);
          setPreferences(data.methodResult?.preferences ?? {});
          setConfiguration({
            ...defaults,
            ...data.methodResult?.configuration,
          });
        }
      })
      .catch(() =>
        notifications.error("Unable to load company notification settings."),
      );
  }, []);
  const save = async () => {
    setSaving(true);
    try {
      const { data } = await putRequest<
        { preferences: Record<string, boolean>; configuration: Config },
        { success: boolean }
      >("api/Company/NotificationPreferences", { preferences, configuration });
      if (data.success)
      saveNotificationConfig(configuration);
      notifications.success("Company notification defaults saved.");
    } catch {
      notifications.error("Unable to save company notification settings.");
    } finally {
      setSaving(false);
    }
  };
  const update = <K extends keyof Config>(key: K, value: Config[K]) =>
    setConfiguration((c) => ({ ...c, [key]: value }));
  const cardSx = {
    m: 0,
    minHeight: 64,
    px: 1.5,
    py: 1,
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 2,
    justifyContent: "space-between",
    gap: 2,
  };
  const toggle = (key: keyof Config, label: string, helper: string) => (
    <FormControlLabel
      labelPlacement="start"
      sx={cardSx}
      label={
        <Box>
          <Typography fontWeight={600}>{label}</Typography>
          <Typography variant="caption" color="text.secondary">
            {helper}
          </Typography>
        </Box>
      }
      control={
        <Switch
          checked={Boolean(configuration[key])}
          onChange={(e) => update(key, e.target.checked)}
        />
      }
    />
  );
  return (
    <Card sx={{ p: { xs: 2, sm: 3 }, borderRadius: 3 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        gap={2}
        mb={3}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Company notification defaults
          </Typography>
          <Typography color="text.secondary">
            Admin-managed defaults for this company.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<SaveRounded />}
          onClick={save}
          disabled={saving}
          sx={{
            minHeight: 48,
            minWidth: { xs: "100%", sm: 148 },
            borderRadius: 2,
            textTransform: "none",
            fontWeight: 700,
            boxShadow: "none",
          }}
        >
          Save defaults
        </Button>
      </Stack>
      <Typography variant="h6" mb={1.5}>
        Notification categories
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
          gap: 1.5,
        }}
      >
        {categories.map(([key, label]) => (
          <FormControlLabel
            key={key}
            labelPlacement="start"
            sx={cardSx}
            label={label}
            control={
              <Switch
                checked={preferences[key] ?? true}
                onChange={(e) =>
                  setPreferences((p) => ({ ...p, [key]: e.target.checked }))
                }
              />
            }
          />
        ))}
      </Box>
      <Divider sx={{ my: 3 }} />
      <Typography variant="h6" mb={1.5}>
        Display and delivery behaviour
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
          gap: 1.5,
        }}
      >
        <FormControl fullWidth>
          <InputLabel>Position</InputLabel>
          <Select
            label="Position"
            value={configuration.position}
            onChange={(e) => update("position", e.target.value)}
          >
            {[
              "top-right",
              "top-center",
              "top-left",
              "bottom-right",
              "bottom-center",
              "bottom-left",
            ].map((x) => (
              <MenuItem key={x} value={x}>
                {x}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          type="number"
          label="Auto-close duration (ms)"
          value={configuration.autoClose}
          inputProps={{ min: 0, max: 60000 }}
          onChange={(e) =>
            update("autoClose", Math.max(0, Number(e.target.value) || 0))
          }
        />
        <TextField
          fullWidth
          type="number"
          label="Visible notification limit"
          value={configuration.limit}
          inputProps={{ min: 1, max: 10 }}
          onChange={(e) =>
            update(
              "limit",
              Math.min(10, Math.max(1, Number(e.target.value) || 1)),
            )
          }
        />
        <FormControl fullWidth>
          <InputLabel>Transition</InputLabel>
          <Select
            label="Transition"
            value={configuration.transition}
            onChange={(e) => update("transition", e.target.value)}
          >
            {["slide", "zoom", "flip", "bounce"].map((x) => (
              <MenuItem key={x} value={x}>
                {x}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl fullWidth>
          <InputLabel>Theme</InputLabel>
          <Select
            label="Theme"
            value={configuration.theme}
            onChange={(e) => update("theme", e.target.value)}
          >
            {["system", "light", "dark"].map((x) => (
              <MenuItem key={x} value={x}>
                {x === "system" ? "Match application" : x}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2,1fr)" },
          gap: 1.5,
          mt: 1.5,
        }}
      >
        {toggle(
          "newestOnTop",
          "Newest on top",
          "Prioritise the latest notification.",
        )}
        {toggle(
          "pauseOnHover",
          "Pause on hover",
          "Give people time to read it.",
        )}
        {toggle(
          "showCloseButton",
          "Show close button",
          "Keep an explicit dismiss control.",
        )}
        {toggle(
          "closeOnClick",
          "Dismiss when clicked",
          "Close non-actionable notifications on click.",
        )}
      </Box>
    </Card>
  );
};
