import {
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import { useIntl } from "react-intl";
export default function PageHeader() {
  const intl = useIntl();
  return (
    <Grid container className="d-flex justify-content-between py-4">
      <Stack>
        <Typography variant="h4">
          {intl.formatMessage({ id: "MENU.DASHBOARD" })}
        </Typography>
      </Stack>
    </Grid>
  );
}
