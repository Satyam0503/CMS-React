import { FC } from "react";

import { useIntl } from "react-intl";

import { Typography } from "@mui/material";
import { EmployeeLeaves } from "../../modules/leaves/components/EmployeeLeaves";

export const LeaveManagementWrapper: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.LEAVE_MGMT" })}
      </Typography>
      <EmployeeLeaves />
    </>
  );
};
