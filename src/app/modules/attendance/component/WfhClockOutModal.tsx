import React, { FC, useEffect, useState } from "react";
import {
  Alert,
  Box,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AccessTime from "@mui/icons-material/AccessTime";
import CheckCircleOutline from "@mui/icons-material/CheckCircleOutline";
import Logout from "@mui/icons-material/Logout";
import WarningAmber from "@mui/icons-material/WarningAmber";
import { CustomisedModal } from "../../../shared/components/C_Modal";
import CustomisedButton from "../../../shared/components/C_Button";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => Promise<void> | void;
  checkInTime?: string;
  timeZoneId?: string;
  requiredHours?: number;
  halfDayRequiredHours?: number;
  loading?: boolean;
}

export const WfhClockOutModal: FC<Props> = ({
  open,
  onClose,
  onConfirm,
  checkInTime,
  timeZoneId = "UTC",
  requiredHours = 8,
  halfDayRequiredHours = 4,
  loading = false,
}) => {
  const [remarks, setRemarks] = useState("");
  const [nowTime, setNowTime] = useState<Date>(new Date());

  useEffect(() => {
    if (open) {
      setNowTime(new Date());
      setRemarks("");
      const timer = window.setInterval(() => setNowTime(new Date()), 30_000);
      return () => window.clearInterval(timer);
    }
  }, [open]);

  const checkInDate = checkInTime ? new Date(checkInTime) : null;
  const elapsedMinutes = checkInDate
    ? Math.max(0, Math.floor((nowTime.getTime() - checkInDate.getTime()) / 60000))
    : 0;
  const workedHoursNum = elapsedMinutes / 60;
  const hoursFormatted = `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`;
  const decimalHours = workedHoursNum.toFixed(2);
  const formatTime = (value: Date) => {
    try {
      return new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit", timeZone: timeZoneId }).format(value);
    } catch {
      return value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
  };

  const isFullDayEligible = workedHoursNum >= requiredHours;
  const isHalfDayEligible = workedHoursNum >= halfDayRequiredHours;

  const handleConfirm = async () => {
    await onConfirm(remarks.trim());
  };

  return (
    <CustomisedModal
      open={open}
      handleClose={loading ? () => {} : onClose}
      title={
        <Stack direction="row" alignItems="center" spacing={1}>
          <Logout color="primary" />
          <Typography variant="h6" fontWeight={700}>
            Confirm Work From Home Clock Out
          </Typography>
        </Stack>
      }
      maxWidth="sm"
    >
      <Stack spacing={2.5} sx={{ pt: 1, minWidth: { sm: 460 } }}>
        <Typography variant="caption" color="text.secondary" textAlign="right">
          Times shown in {timeZoneId}
        </Typography>
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2,
            bgcolor: "background.default",
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
            gap: 1.5,
            textAlign: "center",
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Check-In Time
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              {checkInDate
                ? formatTime(checkInDate)
                : "—"}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Clock-Out Time
            </Typography>
            <Typography variant="subtitle1" fontWeight={700}>
              {formatTime(nowTime)}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary" display="block">
              Time Worked
            </Typography>
            <Typography
              variant="subtitle1"
              fontWeight={800}
              color={isFullDayEligible ? "success.main" : isHalfDayEligible ? "warning.main" : "error.main"}
            >
              {hoursFormatted} ({decimalHours}h)
            </Typography>
          </Box>
        </Paper>

        {isFullDayEligible ? (
          <Alert severity="success" icon={<CheckCircleOutline />}>
            You have completed <strong>{decimalHours} hour(s)</strong>, meeting the full-day requirement ({requiredHours}h). Your attendance will be recorded as <strong>Full Day WFH</strong>.
          </Alert>
        ) : isHalfDayEligible ? (
          <Alert severity="info" icon={<AccessTime />}>
            You have completed <strong>{decimalHours} hour(s)</strong>, meeting the half-day threshold ({halfDayRequiredHours}h). Your attendance will be recorded as <strong>Half Day WFH</strong>.
          </Alert>
        ) : (
          <Alert severity="warning" icon={<WarningAmber />}>
            You have worked <strong>{hoursFormatted} ({decimalHours}h)</strong>, which is under the minimum half-day threshold ({halfDayRequiredHours}h). Clocking out will record this as an incomplete/under-hours shift. Attendance will be reviewed and regularized by <strong>HR / Admin</strong>.
          </Alert>
        )}

        <TextField
          label="Reason / Notes for Clock-Out (Optional)"
          placeholder="e.g., Leaving for doctor appointment, urgent power outage, completed allocated work..."
          multiline
          rows={2}
          fullWidth
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          inputProps={{ maxLength: 200 }}
          helperText={`${remarks.length}/200`}
        />

        <Divider />

        <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
          <CustomisedButton
            label="Cancel"
            variant="outlined"
            disabled={loading}
            handleClick={onClose}
          />
          <CustomisedButton
            label={loading ? "Clocking out..." : "Confirm Clock Out"}
            color={isFullDayEligible ? "primary" : isHalfDayEligible ? "warning" : "error"}
            disabled={loading}
            handleClick={() => void handleConfirm()}
          />
        </Stack>
      </Stack>
    </CustomisedModal>
  );
};
