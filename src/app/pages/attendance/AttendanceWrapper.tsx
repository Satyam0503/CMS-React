import { FC } from "react";
import { useIntl } from "react-intl";
import { Container, Typography } from "@mui/material";
import { EmployeeAttendance } from "../../modules/attendance/EmployeeAttendance";

export const AttendanceWrapper: FC = () => {
  const intl = useIntl();
  return (
    <>
      <Typography variant="h4" mb={3}>
        {intl.formatMessage({ id: "MENU.ATTENDANCE" })}
      </Typography>
      <EmployeeAttendance />
    </>
  );
};
