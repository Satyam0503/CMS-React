import { FC } from "react";
import { useIntl } from "react-intl";
import Employees from "../../modules/employees/Employees";
import { Typography } from "@mui/material";

const EmployeePageWrapper: FC = () => {
  const intl = useIntl();  
  return (
    <>
        <Typography variant="h4" mb={3}>
          {intl.formatMessage({ id: "MENU.EMP" })}
        </Typography>
        <Employees />
    </>
  );
};

export default EmployeePageWrapper;
