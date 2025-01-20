import { Typography } from "@mui/material";

import { useIntl } from "react-intl";
import Applications from "../../modules/recruitment/applications/Applications";

export default function ApplicationsWrapper() {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "USER.APPLICATIONS" })}
      </Typography>
      <Applications />
    </>
  );
}
