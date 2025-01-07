import { Typography, Grid, Stack } from "@mui/material";
import { useIntl } from "react-intl";

import AdminPermissions from "./AdminPermissions";
import { auto } from "@popperjs/core";

export default function Admin() {
  const intl = useIntl();
  return (
    <>
      <Grid container sx={{ maxWidth: "1200px" }} mx={auto} spacing={2} my={4}>
        <Stack>
          <Typography variant="h4" my={2}>
            {intl.formatMessage({ id: "MENU.USER_PERMISSION" })}
          </Typography>
        </Stack>

        <AdminPermissions />
      </Grid>
    </>
  );
}
