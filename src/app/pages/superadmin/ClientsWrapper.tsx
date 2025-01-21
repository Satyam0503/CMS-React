import { Typography } from "@mui/material";

import { useIntl } from "react-intl";
import Clients from "../../modules/superadmin/Clients";

export default function ClientsWrapper() {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.CLIENTS" })}
      </Typography>
      <Clients />
    </>
  );
}
