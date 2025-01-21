import { Typography } from "@mui/material";

import { useIntl } from "react-intl";
import Jobs from "../../modules/recruitment/jobs/Jobs";

export default function JobsWrapper() {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "REQUIREMENT.JOBS" })}
      </Typography>
      <Jobs />
    </>
  );
}
