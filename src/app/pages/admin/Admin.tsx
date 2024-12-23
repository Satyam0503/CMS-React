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
      <Grid container sx={{ maxWidth: "1200px", m: "auto" }} spacing={2}>
        <Stack>
          <Typography variant="h4" className="mb-2">
            {intl.formatMessage({ id: "MENU.EMP" })}
          </Typography>
        </Stack>

        <AdminPermissions />
      </Grid>
    </>
  );
}
