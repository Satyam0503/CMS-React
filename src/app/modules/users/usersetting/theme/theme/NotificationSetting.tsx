import {
  Typography,
  Card,
  Stack,
  TextField,
  InputAdornment,
  Container,
  IconButton,
  Dialog,
  DialogContent,
  Grid,
  Button,
  CardContent,
} from "@mui/material";
import { useIntl } from "react-intl";
import Setting from "../../Setting";
import { Check } from "@mui/icons-material";
import CustomisedButton from "../../../../components/CustomisedButton";

export default function NotificationSetting() {
  const intl = useIntl();
  return (
    <>
      <Card sx={{ width: "100%", mt: 4 }}>
        <Typography variant="h5" sx={{ px: 4, pt: 4 }}>
          {intl.formatMessage({ id: "SETTING.NOTIFICATION" })}
        </Typography>
        <Setting />
      </Card>
      <Card sx={{ width: "100%", mt: 4, p: 4 }}>
        <Typography variant="h5" sx={{ pb: 2 }}>
          {intl.formatMessage({ id: "SETTING.NOTIFICATION" })}
        </Typography>

        <Grid container spacing={4} mb={"10px"}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField fullWidth />
          </Grid>
        </Grid>
        <Grid item xs={12} display={"flex"} justifyContent={"flex-end"}>
          <CustomisedButton
            variant="contained"
            size="medium"
            label="Change Password"
            Icon={<Check />}
          />
        </Grid>
      </Card>
    </>
  );
}
