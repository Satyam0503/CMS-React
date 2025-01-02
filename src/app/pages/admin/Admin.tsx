import {
  Typography,
  Card,
  Grid,
  Stack,
  Button,
  TextField,
  InputAdornment,
} from "@mui/material";
import { useIntl } from "react-intl";
import { KTIcon, toAbsoluteUrl } from "../../../_themes/helpers";
import {
  AccountCircle,
  Add,
  Download,
  Filter,
  Filter1,
  SearchOutlined,
  Sort,
} from "@mui/icons-material";
import AdminPermissions from "./AdminPermissions";

type Props = {
  className: string;
};

export default function Admin() {
  const intl = useIntl();
  return (
    <>
      <Grid
        container
        sx={{ maxWidth: "1200px", mx: "auto", my: "20px" }}
        spacing={2}
      >
        <Stack>
          <Typography variant="h4" sx={{ pb: "20px" }}>
            {intl.formatMessage({ id: "MENU.USER_PERMISSION" })}
          </Typography>
        </Stack>

        <AdminPermissions />
      </Grid>
    </>
  );
}
