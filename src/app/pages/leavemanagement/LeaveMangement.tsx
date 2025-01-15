import { FC } from "react";
import { useIntl } from "react-intl";
import { EmployeeLeaves } from "../../modules/leaves/EmployeeLeaves";
import { Typography } from "@mui/material";

export const LeaveManagement: FC = () => {
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
