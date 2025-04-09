import { FC } from "react";
import { EmployeeModel } from "../../../../utils/common_types";
import { Box, Card, Typography } from "@mui/material";
import { colors } from "../../theme/MuiTheme";
import { useAppSelector } from "../../../Redux/hooks";
import { useNavigate } from "react-router-dom";
import { EmpCardSkeleton } from "./EmployeeCardSkeleton";
import { useIntl } from "react-intl";
import { CardMessage } from "../../../shared/CardMessage";

interface Props {
  employeeList: EmployeeModel[];
  isLoading: boolean;
}

const EmployeeGridView: FC<Props> = ({ employeeList, isLoading }) => {
  const currentEmpId =
    useAppSelector((state) => state.user.userData?.userId) ?? "";
  const navigate = useNavigate();

  const handleClick = (employeeId: string) => {
    employeeId === currentEmpId
      ? navigate("/myprofile")
      : navigate(`/employees/${employeeId}`);
  };

  if (employeeList.length===0) {
    return  <CardMessage title="Employee.No_Employee"/>
  }

  return (
    <Box component={"div"} className="employee-grid-container">
      {isLoading
        ? Array(1, 2, 3, 4, 5, 6).map((ele) => {
            return <EmpCardSkeleton key={ele} />;
          })
        : employeeList.length > 0 &&
          employeeList.map((emp) => (
            <Card
              className="employee-card shadow-sm"
              key={emp.userId}
              onClick={() => handleClick(emp.userId)}
            >
              <img
                src={
                  emp.fullProfileUrl ?? "/media/avatars/default-emp-imag.jpg"
                }
                alt="employee-profile-image"
              />
              <Box className="employee-card-content">
                <Typography
                  variant="h6"
                  className="fw-bold"
                  sx={{ color: colors.alpha.white[500] }}
                >
                  {emp.firstName} {emp.lastName}
                </Typography>
                <Typography variant="body2">{emp.jobRole ?? "NA"}</Typography>
              </Box>
            </Card>
          ))}
    </Box>
  );
};

export { EmployeeGridView };
