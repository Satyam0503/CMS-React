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

      {/* <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
          <TextField
          id="input-with-icon-textfield"
          InputProps={{
              startAdornment: (
                <InputAdornment position="start">
               <SearchOutlined />
                </InputAdornment>
              ),
          }}
          variant="standard"
            placeholder="Search something ..."
        />
           
            <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
              <IconButton aria-label="Notification" size="small">
                <NotificationsOutlined />
              </IconButton>
              <IconButton aria-label="Notification" size="small">
                <Login />
              </IconButton>
            </Stack>
          </Stack> */}
    </Grid>
  );
}
